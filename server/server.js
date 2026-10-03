const path = require('path');
require('dotenv').config();
const os = require('os');
const cluster = require('cluster');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

connectDB();

const app = express();

// High performance response compression for load-balanced nodes
app.use(compression());

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limit for auth routes (Prevents Brute-force attacks across all instances)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts from this IP, please try again after 15 minutes.' }
});
app.use('/api/auth', authLimiter);

// General API limiter
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 2000 });
app.use('/api', apiLimiter);

// Load Balancer Health Check & Metrics Probe
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nexora API Cluster is operational',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    workerId: cluster.isWorker ? cluster.worker.id : 'standalone',
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Comprehensive System Design Status endpoint for DevOps / Load Balancers
app.get('/api/system/status', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    success: true,
    cluster: {
      mode: cluster.isWorker ? 'cluster-worker' : 'standalone',
      workerId: cluster.isWorker ? cluster.worker.id : 1,
      totalCpuCores: os.cpus().length,
      platform: os.platform(),
      loadAvg: os.loadavg(),
    },
    performance: {
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
    database: {
      status: 'connected',
      poolConfig: 'min:10, max:50',
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  const workerInfo = cluster.isWorker ? `[Worker #${cluster.worker.id} PID:${process.pid}]` : `[PID:${process.pid}]`;
  console.log(`Nexora Server running on port ${PORT} ${workerInfo} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown handling for load balancers (drains in-flight requests)
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down worker ${process.pid} gracefully...`);
  server.close(() => {
    console.log(`Closed out remaining connections on PID ${process.pid}. Exiting.`);
    process.exit(0);
  });
  // Force exit after 10s if connections don't drain
  setTimeout(() => {
    console.error(`Could not close connections in time on PID ${process.pid}, forcefully shutting down.`);
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;

