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
  url = config.dev.url,

  authTests = require('./auth'),
  addressTests = require('./address');



const generateAddress  = (name) => name.concat('z'.repeat(35-name.length)).toUpperCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }

module.exports = (ctx) => {

  before (async () => {
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    ctx.amqp.channel.prefetch(1);
    
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(5000);
  });

  after ('kill environment', async () => {

    await ctx.amqp.channel.close();
    await killProcess(ctx.restPid);
  });

   describe('auth', () => authTests(ctx));
   describe('address', () => addressTests(ctx));

  it('kill rest server and up already - work GET /tx/:hash', async () => {

    await killProcess(ctx.restPid);
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(5000);

    const id = 'TESTHASH2';
    const address = generateAddress('addr');
    const tx = await models.txModel.findOneAndUpdate({'_id': id}, {
      recipient: address,
      timestamp: 1,
      signature: 'babba',
      blockNumber: 5
    }, {upsert: true, new: true});
  
    const response = await request(`${url}/tx/${id}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);

    expect(response).to.deep.equal({
      'recipient':address,
      'data':[],
      'transfers':[],
      'hash': 'babba',
      'signature': 'babba',
      'blockNumber': tx.blockNumber,
      'id': id,
      'timestamp': tx.timestamp
    });
  });


};
