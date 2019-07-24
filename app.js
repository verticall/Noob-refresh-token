const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const config = require('./config')
const axios = require('axios')
const {
  getRf_redis,
  setRf_redis,
  getKeys_redis,
  getRefreshToken
} = require('./functions')
const router = express.Router()

const whiteList = [
  "/api/",
  "/api/login",
  "/api/token",
  "/api/secure",
  "/api/getproduct",
  "/api/getbrand",
  "/api/getTokenList"
]

const tokenList = {}
const app = express()

app.set('views', path.resolve('views'))
app.set('view engine', 'ejs');

// Logging Middleware
app.use(function(req, res, next) {
  // console.log(req.method + ' ' + req.url)
  // Reject Url out of WhiteList
  if (whiteList.indexOf(req.url) == -1) {
    res.status(404).send('404 Not Found');
  } else {
    next();
  }
})

// set Body Limit
app.use(bodyParser.json({
  limit: config.bodyLimit
}));



async function xxx(url) {
  const x = Math.floor(Math.random()*100)
  console.log('begin :: ',url,x)
  const response = await axios.get(url)
  console.log('success :: ',url,x)
  return await response.data
}

async function getUser() {
  console.log('start call API')
  const obj = await Promise.all(
    [
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/5'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=2'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users/6'),
      xxx('http://localhost:5000/api/getTokenList'),
      xxx('https://reqres.in/api/users?page=1')

    ]
  )
  const ret = {}
  for(var i = 0 ; i<obj.length;i++){
      ret['res_'+i] = obj[i]
  }
  return ret
}

router.get('/', async (req, res) => {
  res.status(200).json(await getUser())
})


router.get('/getTokenList', async (req, res) => {
  const keys_list = await getKeys_redis('node-*')
  const refresh_token = await getRefreshToken(keys_list)
  // console.log(refresh_token);
  setTimeout(
    ()=>{
      res.status(200).json(refresh_token)
    }
    ,
    Math.floor(Math.random()*1000))

})

router.post('/login', async (req, res) => {
  const postData = req.body;
  const user = {
    "email": postData.email,
    "name": postData.name
  }
  // do the database authentication here, with user name and password combination.
  const token = jwt.sign(user, config.secret, {
    expiresIn: config.tokenLife
  })
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenLife
  })
  const response = {
    "status": "Logged in",
    "token": token,
    "refreshToken": refreshToken,
  }
  const set_status = await setRf_redis('node-' + user.email, response.refreshToken);
  const keys_list = await getKeys_redis('node-*')
  const refresh_token = await getRefreshToken(keys_list)
  console.log(refresh_token)
  response.refreshTokenList = refresh_token
  res.status(200).json(response);
})

router.post('/token', async (req, res) => {
  const postData = req.body;
  var rf_token_redis = await getRefreshToken(['node-' + postData.email])
  rf_token_redis = rf_token_redis[0]
  if ((postData.refreshToken) && (postData.refreshToken === rf_token_redis)) {
    const user = {
      "email": postData.email,
      "name": postData.name
    }
    const token = jwt.sign(user, config.secret, {
      expiresIn: config.tokenLife
    })
    const response = {
      "token": token,
    }
    const set_status = setRf_redis('node-' + user.email, rf_token_redis)
    res.status(200).json(response);
  } else {
    res.status(404).send('Invalid request')
  }
})





router.use(require('./tokenChecker')) // mehod interupt
router.get('/secure', (req, res) => {
  // all secured routes goes here
  res.send('Hello : ' + req.decoded.name + '____ I am secured...')
})
router.get('/getproduct', (req, res) => {
  // all secured routes goes here
  // res.send('Hello : ' + req.decoded.name + '<br>I am secured...')
  const postData = req.body;
  req.qb.select('*').select('product.product_id as cc')
    .like('product_name', postData.q, 'both')
    .limit(10000)
    .get('product', (err, response) => {
      req.qb.disconnect();

      if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);

      // SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
      console.log("Query Ran: " + req.qb.last_query());

      // [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
      //console.log("Results:", response);
      res.send(response);
    });
})

router.get('/getbrand', (req, res) => {
  const postData = req.body;
  req.qb.select('*')
    .get('brands', (err, response) => {
      req.qb.disconnect();

      if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);

      res.render('brands_view', {
        brand_list: response
      });
      // res.send(response);
    });
})



app.use(bodyParser.json());
app.use('/api', router);
app.listen(5000);
