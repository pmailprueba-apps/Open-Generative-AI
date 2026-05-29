// PM2 Ecosystem — APUESTA.IA
// Inicia: pm2 start ecosystem.config.js
// Auto-inicio: pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name: 'mission-control',
      cwd: '/Users/macbook/mission-control',
      script: 'pnpm',
      args: 'dev',
      interpreter: 'none',
      env: {
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
        MC_ALLOWED_HOSTS: 'localhost,127.0.0.1,::1,192.168.%,100.%',
        MC_COOKIE_SECURE: '0',
        NEXT_PUBLIC_GATEWAY_OPTIONAL: 'true'
      },
      max_memory_restart: '1G',
      restart_delay: 3000,
      max_restarts: 10
    },
    {
      name: 'prediction-api',
      cwd: '/Users/macbook/Proyectos/24-apuestas',
      script: 'node',
      args: 'server-predict.js',
      max_memory_restart: '512M',
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        HOST: '0.0.0.0'
      }
    },
    {
      name: 'scraper-cada-6h',
      cwd: '/Users/macbook/Proyectos/24-apuestas',
      script: 'bash',
      args: 'scraper-historico.sh',
      cron_restart: '0 */6 * * *',
      autorestart: false
    }
  ]
};
