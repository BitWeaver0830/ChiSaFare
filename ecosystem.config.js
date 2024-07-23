module.exports = {
  apps : [{
    name: "chi-sa-fare-app",
    script: "npm run start",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}