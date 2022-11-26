// Update with your config settings.

var dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'development';
const dotenvPath = '.env.' + environment;
dotenv.config({path: dotenvPath, debug: true});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.POSTGRES_CONNECTION_STRING,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'database/migrations'
    },
    seeds: {
      directory: 'database/seeds'
    }
  },

  staging: {
    client: 'postgresql',
    connection: process.env.POSTGRES_CONNECTION_STRING,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'database/migrations'
    },
    seeds: {
      directory: 'database/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.POSTGRES_CONNECTION_STRING,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'database/migrations'
    },
    seeds: {
      directory: 'database/seeds'
    }
  }
};
