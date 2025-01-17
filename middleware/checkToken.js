const jwt = require('jsonwebtoken')
function checkJwt(req, res, next) {
    try{
        const JWT_SECRET = 'your_secure_jwt_secret_key';
        const token = req.cookies.auth_token;
    
        const decoded = jwt.verify(token, JWT_SECRET);
    }
    catch(err){
    return  res.json({
        "status":"false",
        "message":err.message
      })
    }
   
    next()
}

module.exports=checkJwt;
