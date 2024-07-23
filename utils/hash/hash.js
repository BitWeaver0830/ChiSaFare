var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

function getHash(string){
    return bcrypt.hash(string,salt);
}

function compare(string, hash){
    return bcrypt.compare(string,hash);
}

module.exports = {
    getHash,
    compare
}
