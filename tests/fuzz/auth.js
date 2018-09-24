/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  generateAddress = require('../utils/address/generateAddress');

module.exports = () => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.txModel.remove({});
  });


  it('GET /addr/:addr/balance without auth headers - error', async () => {
    const address = generateAddress();

    const response = await request(`${config.dev.url}/addr/${address}/balance`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /addr/:addr/balance with not right auth headers - error', async () => {
    const address = generateAddress();

    const response = await request(`${config.dev.url}/addr/${address}/balance`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });



  it('GET /tx/:hash without auth headers - error', async () => {
    const hash = generateAddress();
    const tx = new models.txModel();
    tx._id = hash;
    await tx.save();

    const response = await request(`${config.dev.url}/tx/${hash}`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /tx/:hash with not right auth headers - error', async () => {
    const hash = generateAddress();

    const response = await request(`${config.dev.url}/tx/${hash}`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });


  it('GET /tx/:addr/history without auth headers - error', async () => {
    const address = generateAddress();
    await models.accountModel.update({address}, {address}, {upsert: true});

    const tx = new models.txModel();
    tx._id = 11;
    tx.recipient = address;
    await tx.save();

    const response = await request(`${config.dev.url}/tx/${address}/history`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /tx/:addr/history with not right auth headers - error', async () => {
    const address = generateAddress();

    const response = await request(`${config.dev.url}/tx/${address}/history`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  



};
