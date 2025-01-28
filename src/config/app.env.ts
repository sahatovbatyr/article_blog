import * as process from 'node:process';

export const appEnv = () => ({
  HOST:process.env.HOST,
  HOST_PORT:process.env.HOST_PORT,
  DB_HOST:process.env.DB_HOST,
  DB_PORT:process.env.DB_PORT,
  DB_USER:process.env.DB_USER,
  DB_NAME:process.env.DB_NAME,
  DB_PASSWORD:process.env.DB_PASSWORD
});

