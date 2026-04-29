import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export default {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './db/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './db/seeds',
    },
  },
};