/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  url = 'http://localhost:8081';


const generateAddress  = (name) => name.concat('z'.repeat(35-name.length)).toUpperCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
  });

  it('GET /tx/:id when no tx in db - get {}', async () => {
    const response = await request(`${url}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:id with non exist hash - get {}', async () => {
    const id = 'TESTHASH';
    const address = generateAddress('addr');
    await models.txModel.findOneAndUpdate({'_id': id}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${url}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal({});
  });

  it('GET /tx/:id with exist hash (in db two txs) - get right tx', async () => {
    const id = 'TESTHASH2';
    const address = generateAddress('addr');
    const tx = await models.txModel.findOneAndUpdate({'_id': id}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});
  
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: address,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);

    expect(response).to.deep.equal({
      'recipient':address,
      'assets':[],
      'blockNumber': tx.blockNumber,
      'id': id,
      'timeStamp': tx.timestamp
    });
  });



  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress('addr');
    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress('addr');
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: generateAddress('addr2'),
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});

    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const address = generateAddress('addr');
    const txs = [];
    txs[0] = await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      recipient: address,
      timestamp: 1,
      signature: 1,
      blockNumber: 5
    }, {upsert: true});

    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      recipient: generateAddress('addr2'),
      timestamp: 1,
      signature: 2,
      blockNumber: 5
    }, {upsert: true});

    txs[1] = await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      recipient: address,
      timestamp: 2,
      signature: 3,
      blockNumber: 7
    }, {upsert: true});



    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response.length).to.equal(2);
    expect(response).to.deep.equal([
      {
        recipient: 'ADDRZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
        assets: [],
        blockNumber: 7,
        id: 'TEST2',
        signature: 3,
        timeStamp: 2 
      }, { 
        recipient: 'ADDRZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
        assets: [],
        blockNumber: 5,
        id: 'TEST1',
        signature: 1,
        timeStamp: 1 
      }
    ])
  });

};
