const models = require('../utils/MongoDB/models');
const um = models.userModel;

async function getUser(id){
    if(!id){
        return null;
    }
    let u = await um.findById(id);
    if(u!= null){
        u = u.toObject();
        delete u.password;
        delete u.signUpDate;
        delete u.token;
        delete u.resetToken;
        delete u.securityAnswer;
        delete u.securityQuestion;
        delete u.__v;
        return u;
    }else return null;
}





module.exports = {getUser};