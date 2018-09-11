/**
 * Chronobank/waves-rest configuration
 * @module config
 * @returns {Object} Configuration
 * 
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
require('dotenv').config();
const path = require('path'),
  requests = require('../services/nodeRequests'),
  mongoose = require('mongoose'),
  rest = {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081,
    auth: process.env.USE_AUTH || false
  }, 
  node = {
    rpc: process.env.RPC || 'http://localhost:6869'
  },
  rabbit = {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_waves'
  },
  accountPrefix = process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'waves',
  profilePrefix = process.env.MONGO_PROFILE_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'waves',
  collectionPrefix = process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'waves';

let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: accountPrefix
    },
    profile: {
      uri: process.env.MONGO_PROFILE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: profilePrefix
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: collectionPrefix,
      useData: process.env.USE_MONGO_DATA ? parseInt(process.env.USE_MONGO_DATA) : 1
    }
  },
  node,
  rest,
  rabbit,
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.NODE_RED_MONGO_COLLECTION_PREFIX || ''
    },
    logging: {
      console: {
        level: process.env.LOG_LEVEL || 'info'
      }
    },
    autoSyncMigrations: process.env.NODERED_AUTO_SYNC_MIGRATIONS || true,
    customNodesDir: [path.join(__dirname, '../')],
    migrationsDir: path.join(__dirname, '../migrations'),
    migrationsInOneFile: true,
    httpAdminRoot: process.env.HTTP_ADMIN || false,
    functionGlobalContext: {
      connections: {
        primary: mongoose
      },
      settings: {
        node,
        requests,
        ['request-promise']: require('request-promise'),
        apiKey: process.env.API_KEY || 'password',
        mongo: {
          accountPrefix,
          collectionPrefix
        },
        rabbit,
        laborx: {
          url: process.env.LABORX_RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
          authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
          profileModel: profilePrefix + 'Profile',
          dbAlias: 'profile'
        }
      }
    }
  }
};


module.exports = config;
