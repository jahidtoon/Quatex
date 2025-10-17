module.exports = {
  apps: [
    {
      name: 'quatex-ui',
      script: 'npm',
      args: 'start',
      // Run from the project directory (no hardcoded absolute path)
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        // Set other required envs in your server or via pm2 ecosystem if needed, e.g. JWT_SECRET
        // JWT_SECRET: 'change-me'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'quatex-deposit-watcher',
      script: 'node',
      args: 'scripts/watchDeposits.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/deposit-watcher-err.log',
      out_file: './logs/deposit-watcher-out.log',
      log_file: './logs/deposit-watcher.log',
      time: true
    }
  ]
};
