module.exports = {
  apps: [{
    name: 'quotex-ui',
    script: 'npm',
    args: 'start',
    cwd: '/home/jahidul11/nextjs/quotex',
    env: {
      NODE_ENV: 'production',
  PORT: 3006
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }, {
    name: 'quotex-deposit-watcher',
    script: 'node',
    args: 'scripts/watchDeposits.js',
    cwd: '/home/jahidul11/nextjs/quotex',
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
  }]
};
