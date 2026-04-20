module.exports = {
  apps: [
    {
      name: "email-checker",
      script: "src/index.ts",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      combine_logs: true,
    },
  ],
};
