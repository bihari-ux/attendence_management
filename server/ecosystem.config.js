/**
 * PM2 Enterprise Process File & Cluster Load Balancer
 * Usage:
 *   npx pm2 start ecosystem.config.js
 *   npx pm2 reload ecosystem.config.js (Zero-downtime rolling restart)
 */
module.exports = {
  apps: [
    {
      name: 'nexora-api-cluster',
      script: './server.js',
      instances: 'max',               // Scale across all available CPU cores automatically
      exec_mode: 'cluster',           // Enable PM2 internal TCP load balancing
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',     // Auto-restart if memory leak detected
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Zero-downtime reload settings
      wait_ready: true,
      listen_timeout: 8000,
      kill_timeout: 4000,
    },
  ],
};
