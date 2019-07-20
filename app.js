const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const router = express.Router()
const config = require('./config')


const whiteList = [
"/api/",
"/api/login",
"/api/token",
"/api/secure",
"/api/getproduct",
"/api/getbrand",
"/api/getTokenList"]

const tokenList = {}
const app = express()

// Logging Middleware
app.use(function(req, res, next){
  console.log(req.method + ' ' + req.url)
  // Reject Url out of WhiteList
  if(whiteList.indexOf(req.url) == -1){
    res.status(404).send('404 Not Found');
  }else{
    next();
  }
})

router.get('/', (req,res) => {
    res.send('Ok');
})

router.get('/getTokenList',(req,res)=>{
  var temp_refresh = Object.values(tokenList).map((obj,index)=>{return obj.token})
  res.status(200).json(temp_refresh);
})

router.post('/login', (req,res) => {
    const postData = req.body;
    const user = {
        "email": postData.email,
        "name": postData.name
    }
    // do the database authentication here, with user name and password combination.
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
    const response = {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    }
    // console.log(response)
    tokenList[refreshToken] = response
    const list_token = Object.values(tokenList).map((obj,index)=>{
        return [obj.token,obj.refreshToken]
    })
    console.log(list_token)
    console.log(list_token.length)
    res.status(200).json(response);
})

router.post('/token', (req,res) => {
    // refresh the damn token
    const postData = req.body;
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        console.log(tokenList);
        res.status(200).json(response);
    } else {
        res.status(404).send('Invalid request')
    }
})





router.use(require('./tokenChecker')) // mehod interupt
router.get('/secure', (req,res) => {
    // all secured routes goes here
    res.send('Hello : ' + req.decoded.name + '____ I am secured...')
})
router.get('/getproduct', (req,res) => {
    // all secured routes goes here
    // res.send('Hello : ' + req.decoded.name + '<br>I am secured...')
    const postData = req.body;
    req.qb.select('*').select('product.product_id as cc')
    .like('product_name',postData.q,'both')
    .limit(10000)
    .get('product', (err, response) => {
        req.qb.disconnect();

        if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);

        // SELECT `name`, `position` FROM `planets` WHERE `type` = 'rocky' AND `diameter` < 12000
        console.log("Query Ran: " + req.qb.last_query());

        // [{name: 'Mercury', position: 1}, {name: 'Mars', position: 4}]
        //console.log("Results:", response);
        res.send(response);
    }
  );
})

router.get('/getbrand', (req,res) => {
    const postData = req.body;
    req.qb.select('*')
    .get('brands', (err, response) => {
        req.qb.disconnect();

        if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);

        res.render('brands_view.ejs', {
            brand_list:response
        });
        // res.send(response);
    }
  );
})



app.use(bodyParser.json())
app.use('/api', router)
app.listen(5000);
