const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')


const JWT_secret = process.env.JWT_secret;


function getToken(payload, expiresIn){
    const exp = expiresIn ? expiresIn: '24h';
    return jwt.sign({ data: payload},JWT_secret, {expiresIn: exp});
}

function validateToken(token){
    return jwt.verify(token,JWT_secret).exp - Date.now()/1000 > 0 ;
}

function getResetPassToken(email){
    return jwt.sign({email},JWT_secret,{expiresIn: '2d'})
}

function getEmail(token){
    if(validateToken(token)){
        return (jwt.decode(token)).email;
    }
}

function getSignUpToken(email){
    return jwt.sign({email},JWT_secret,{expiresIn: '15d'})
}

function getLoginOwnerToken(email){
    return jwt.sign({email},JWT_secret,{expiresIn: '10m'});
}

function getLoginTokenAndEmail(token){
    if(validateToken(token)){
        return { email: (jwt.decode(token)).email }
    }
}


module.exports = {
    getToken,
    validateToken,
    getResetPassToken,
    getEmail,
    getSignUpToken,
    getLoginOwnerToken,
    getLoginTokenAndEmail
}
