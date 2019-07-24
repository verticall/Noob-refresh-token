
const config = require('./config')
const redis = require('redis')

const redis_conn = {
  host: '127.0.0.1',
  port: '6379',
  no_ready_check: true,
  auth_pass: 'bajskbdf2@majsdf9_0123.c09912398',
}
const client = redis.createClient(redis_conn)

const getRefreshToken = async (keys) => {
  let asyncListFnc = []
  for (let i = 0; i < keys.length; i++) {
    asyncListFnc.push(getRf_redis(keys[i]))
  }
  let ret2 = await Promise.all(asyncListFnc)
  return ret2
}

const getRf_redis = (id_key) => {
  return new Promise(function(resolve, reject) {
    // console.log('begin task : ', id_key)
    client.get(id_key, function(err, resp) {
      if (err) {
        reject(err)
      }
      // console.log('success task : ', id_key)
      resolve(resp)
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
