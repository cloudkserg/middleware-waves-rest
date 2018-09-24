/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const config = require('../config'),
  spawn = require('child_process').spawn,
  Promise = require('bluebird'),
  request = require('request-promise'),
  models = require('../../models'),
  killProcess = require('../helpers/killProcess'),
  expect = require('chai').expect,
  generateAddress = require('../utils/address/generateAddress'),
  authTests = require('./auth'),
  addressTests = require('./address');



module.exports = (ctx) => {

  before (async () => {
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });


  it('kill rest server and up already - work GET /tx/:hash', async () => {
    await ctx.restPid.kill();
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);

    const id = 'TESTHASH2';
    const address = generateAddress();
    await models.txModel.update({'_id': id}, {
      recipient: address,
      timestamp: 1,
      signature: 'babba',
      blockNumber: 5
    }, {upsert: true});
  
    const response = await request(`${config.dev.url}/tx/${id}`, {
      method: 'GET',
      json: true,
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);

    expect(response).to.deep.equal({
      'recipient':address,
      'data':[],
      'transfers':[],
      'hash': 'babba',
      'signature': 'babba',
      'blockNumber': 5,
      'id': id,
      'timestamp': 1
    });
  });
   
   describe('auth', () => authTests(ctx));
   describe('address', () => addressTests(ctx));


  after ('kill environment', async () => {
    await ctx.restPid.kill();
  });

};
