/**
 * Nexora Multi-Core Cluster Load Balancer
 * Distributes incoming network requests across all available CPU cores
 * using Node.js cluster module and OS-level round-robin socket balancing.
 */
const cluster = require('cluster');
const os = require('os');
const path = require('path');
require('dotenv').config();

const numCPUs = process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS) : os.cpus().length;

if (cluster.isMaster || cluster.isPrimary) {
  console.log(`====================================================`);
  console.log(`🚀 Nexora Cluster Master Process [PID: ${process.pid}]`);
  console.log(`⚡ Detected ${numCPUs} CPU Cores. Forking worker pool...`);
  console.log(`⚖️ Load Balancing Strategy: Round-Robin OS Sockets`);
  console.log(`====================================================`);

  const workers = [];

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }

  // Handle worker lifecycle & zero-downtime auto-restart
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Worker #${worker.id} (PID: ${worker.process.pid}) died with signal: ${signal || code}. Auto-respawning replacement worker...`);
    const newWorker = cluster.fork();
    console.log(`✅ Replacement Worker #${newWorker.id} online [PID: ${newWorker.process.pid}]`);
  });

  // Handle master shutdown signals gracefully
  const shutdownMaster = () => {
    console.log('\n🛑 Master process caught shutdown signal. Terminating all cluster workers gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill('SIGTERM');
    }
    setTimeout(() => {
      console.log('🏁 All workers terminated. Master exiting.');
      process.exit(0);
    }, 1500);
  };

  process.on('SIGINT', shutdownMaster);
  process.on('SIGTERM', shutdownMaster);

} else {
  // Worker process starts the express application
  require('./server.js');
}
