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


module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:id when no tx in db - get {}', async () => {
    const response = await request(`http://localhost:${config.rest.port}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:id with non exist hash - get {}', async () => {
    const id = 'TESTHASH';
    const address = generateAddress();
    await models.txModel.update({'_id': id}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:id with exist hash (in db two txs) - get right tx', async () => {
    const id = 'TESTHASH2';
    const address = generateAddress();
    await models.txModel.update({'_id': id}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});
  
    await models.txModel.update({'_id': 'HASHES'}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/${id}`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);

    expect(response).to.deep.equal({
      'recipient':address,
      "transfers": [],
      "data": [],
      'blockNumber': 5,
      'id': id,
      'timestamp': 1
    });
  });



  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress();
    const response = await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress();
    await models.txModel.update({'_id': 'HASHES'}, {
      recipient: generateAddress(),
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const address = generateAddress();
    await models.txModel.update({'_id': 'TEST1'}, {
      recipient: address,
      timestamp: 1,
      signature: 1,
      blockNumber: 5
    }, {upsert: true});

    await models.txModel.update({'_id': 'HASHES'}, {
      recipient: generateAddress('addr2'),
      timestamp: 1,
      signature: 2,
      blockNumber: 5
    }, {upsert: true});

    await models.txModel.update({'_id': 'TEST2'}, {
      recipient: address,
      timestamp: 2,
      signature: 3,
      blockNumber: 7
    }, {upsert: true});


    const response = await request(`http://localhost:${config.rest.port}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    }).catch(e => e);
    expect(response.length).to.equal(2);
    expect(response).to.deep.equal([
      {
        recipient: address,
        blockNumber: 7,
        id: 'TEST2',
        hash: "3",
        signature: "3",
        data: [],
        transfers: [],
        timestamp: 2 
      }, { 
        recipient: address,
        blockNumber: 5,
        id: 'TEST1',
        hash: "1",
        signature: "1",
        data: [],
        transfers: [],
        timestamp: 1 
      }
    ])
  });

};
