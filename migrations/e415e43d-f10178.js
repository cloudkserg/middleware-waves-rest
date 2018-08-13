
module.exports.id = 'e415e43d.f10178';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow e415e43d.f10178 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"e415e43d.f10178","type":"flows"}, {
    $set: {"path":"e415e43d.f10178","body":[{"id":"b68ffffb.8e49e","type":"catch","z":"e415e43d.f10178","name":"","scope":null,"x":307,"y":585,"wires":[["49075d44.432d44"]]},{"id":"5c2fd91f.e496a8","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":764,"y":586,"wires":[]},{"id":"49075d44.432d44","type":"function","z":"e415e43d.f10178","name":"transform","func":"\nlet factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nif (msg.statusCode == '401')\n    msg.payload = factories.messages.generic.failAuth;\n\n    \nreturn msg;","outputs":1,"noerr":0,"x":548,"y":585,"wires":[["5c2fd91f.e496a8"]]},{"id":"cb93a20a.bb5d3","type":"http in","z":"e415e43d.f10178","name":"history","url":"/tx/:addr/history","method":"get","upload":false,"swaggerDoc":"","x":110,"y":220,"wires":[["ccd50a5c.188da8"]]},{"id":"e558bff.7e2784","type":"function","z":"e415e43d.f10178","name":"parse","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr;\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      $or: [\n        {'sender': msg.address},\n        {'recipient': msg.address}\n      ]\n  },\n  options: {\n      sort: {timestamp: -1},\n      limit: parseInt(msg.req.query.limit) || 100,\n      skip: parseInt(msg.req.query.skip) || 0\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":437.0000762939453,"y":237.00001335144043,"wires":[["45ab2beb.917bc4"]]},{"id":"45ab2beb.917bc4","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":603,"y":237,"wires":[["452c6d9e.f16384"]]},{"id":"ab0df8ed.00d388","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":909,"y":236,"wires":[]},{"id":"452c6d9e.f16384","type":"function","z":"e415e43d.f10178","name":"","func":"const _ = global.get('_');\n\nmsg.payload = _.map(msg.payload, tx => {\n \n tx.hash = tx.signature;\n tx.id = tx._id;\n delete tx._id;\n delete tx.__v;\n return tx;    \n});\nreturn msg;","outputs":1,"noerr":0,"x":750,"y":237,"wires":[["ab0df8ed.00d388"]]},{"id":"b6fd6057.701b3","type":"http in","z":"e415e43d.f10178","name":"send tx","url":"/tx/send","method":"post","upload":false,"swaggerDoc":"","x":270,"y":320,"wires":[["1ffd48b0.295f37"]]},{"id":"a16c085c.68b818","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":670,"y":320,"wires":[]},{"id":"1ffd48b0.295f37","type":"async-function","z":"e415e43d.f10178","name":"requestTx","func":"const rpc = global.get('settings.node.rpc');\nconst requests = global.get('settings.requests');\n\n\nconst MINIMUM_FEE = 100000;\n\nfunction removeRecipientPrefix (original) {\n  if (original.slice(0, 8) === 'address:') \n    return original.slice(8);\n  else \n    return original;\n}\n\nconst prepareTransaction = (tx) => {\n  return {\n    transactionType: null,//'transfer',\n    senderPublicKey: tx.senderPublicKey,\n    assetId: tx.assetId === 'WAVES' ? null : tx.assetId,\n    feeAsset: tx.feeAssetId === 'WAVES' ? null : tx.feeAssetId,\n    timestamp: tx.timestamp,\n    amount: tx.amount,\n    fee: tx.fee || MINIMUM_FEE,\n    recipient: removeRecipientPrefix(tx.recipient),\n    attachment: tx.attachment,\n    signature: tx.signature\n  };\n};\n\nconst tx = prepareTransaction(msg.payload);\n\n\nmsg.payload = await requests.sendTransactionFromLib(tx, rpc).catch(e => { const message = e.error.message || e; return {message: JSON.stringify(message)}; });\nreturn msg;","outputs":1,"noerr":1,"x":480,"y":320,"wires":[["a16c085c.68b818"]]},{"id":"6b2f3912.a09f08","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":907.500019073486,"y":395.5000133514401,"wires":[]},{"id":"12413869.ddc528","type":"http in","z":"e415e43d.f10178","name":"tx","url":"/tx/:id","method":"get","upload":false,"swaggerDoc":"","x":130,"y":400,"wires":[["fb773624.208478"]]},{"id":"92a80432.496758","type":"async-function","z":"e415e43d.f10178","name":"requestTx","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.payload ={ \n    model: `${prefix}TX`, \n    request: {\n      _id: msg.req.params.id\n  }\n};\n\nreturn msg;\n","outputs":1,"noerr":0,"x":460,"y":396,"wires":[["9352032c.01b68"]]},{"id":"9352032c.01b68","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":645.0173149108887,"y":396.7881832122803,"wires":[["e2a724dd.f42068"]]},{"id":"e2a724dd.f42068","type":"function","z":"e415e43d.f10178","name":"","func":"const _ = global.get('_');\n\nif(!msg.payload[0]){\n    msg.payload = null;\n    return msg;\n}\n\n\nmsg.payload = msg.payload[0];\n\nmsg.payload.hash = msg.payload.signature;\nmsg.payload.id = msg.payload._id;\ndelete msg.payload._id;\ndelete msg.payload.__v;\n\nreturn msg;","outputs":1,"noerr":0,"x":776.3507080078125,"y":396.0104064941406,"wires":[["6b2f3912.a09f08"]]},{"id":"ccd50a5c.188da8","type":"laborx_auth","z":"e415e43d.f10178","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":270,"y":240,"wires":[["e558bff.7e2784"]]},{"id":"fb773624.208478","type":"laborx_auth","z":"e415e43d.f10178","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":280,"y":400,"wires":[["92a80432.496758"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"e415e43d.f10178","type":"flows"}, done);
};
