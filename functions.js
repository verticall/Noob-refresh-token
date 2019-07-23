const config = require('./config')
const redis = require('redis')
// const client = redis.createClient(6379, '10.0.12.8');
const client = redis.createClient(6379, '127.0.0.1');

const getRefreshToken = (keys) =>{
  let asyncListFnc = []
  for (let i = 0; i < keys.length; i++) {
    asyncListFnc.push(getRf_redis(keys[i]))
  }
  let ret2 = Promise.all(asyncListFnc)
  return ret2
}

const getRf_redis = (id_key) => {
  return new Promise(function(resolve, reject) {
    console.log('begin task : ',id_key)
    client.get(id_key, function(err, resp) {
      if (err) {
        reject(err)
      }
      console.log('success task : ',id_key)
      resolve(resp);
    })
  })
}
const setRf_redis = (key, val) => {
  return new Promise(function(resolve, reject) {
    client.set(key, val)
    client.expire(key, config.refreshTokenLife)
    resolve('success')
  })
}
const getKeys_redis = (key4like) => {
  return new Promise(function(resolve, reject) {
    client.keys(key4like, function(error, result) {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })
}


module.exports = {
  getRf_redis,
  setRf_redis,
  getKeys_redis,
  getRefreshToken
}
