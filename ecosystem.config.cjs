/* eslint-disable */
module.exports = {
  apps: [{
    name: 'RocketMqtt',
    script: 'npm start',
    watching: false,
    error_file: "./pm2/pm2-error.log",
    out_file: "./pm2/pm2-out.log",
  }],
};
