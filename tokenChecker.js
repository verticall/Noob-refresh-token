const jwt = require('jsonwebtoken')
const config = require('./config')
const QueryBuilder = require('node-querybuilder')
const settings = require('./db')

module.exports = (req,res,next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
        }
      req.decoded = decoded;

      // connect db
      const qb = new QueryBuilder(settings, 'mysql', 'single');
      req.qb = qb;
      
      next();
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        "error": true,
        "message": 'No token provided.'
    });
  }
}
