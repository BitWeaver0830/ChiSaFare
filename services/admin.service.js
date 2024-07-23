const models = require('../utils/MongoDB/models');
const mail = require('../utils/mail/mail');

const am = models.adminModel;

async function getAdmin(id){
    if(!id){
        return null;
    }
    let admin = await am.findById(id);
    if(admin!= null){
        a = admin.toObject();
        delete a.password;
        delete a.resetToken;
        delete a.setPassToken;
        delete a.securityAnswer;
        delete a.securityQuestion;
        delete a.__v;
        return a;
    }else return null;
}

async function removeStaff(id){
    if(!id){
        return null
    }
    let staff = await am.findById(id);
    if(staff && staff.level == 1){
        await am.findByIdAndRemove(id);
        mail.sendRemovedStaff(staff.email);
        return true;
    }
    return false;
}

async function getStaffSecurityQuestion(email){
    if(email){
        let s = await am.findOne({
            email: email,
            level: 1
        });
        if(s){
            return s.securityQuestion;
        }else return null
    }else return null
}


module.exports = {
    getAdmin,
    removeStaff,
    getStaffSecurityQuestion
}