module.exports = {
  apps: [
    {
      name: 'xnmytx-brand',
      cwd: __dirname + '/..',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '700M',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
