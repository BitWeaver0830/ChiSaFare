const models = require('../utils/MongoDB/models');
const hash = require('../utils/hash/hash');
const crypto = require("crypto");
const mail = require('../utils/mail/mail');
const aService = require('../services/admin.service');
const validator = require("email-validator");
const jwt = require("../utils/jwt/jwt");

const am = models.adminModel;
const pm = models.professionalModel;
const auth_mail = process.env.MAIL_owner;
const auth_pass = process.env.MAIL_owner_pass;

async function setOwner(req,res,next){
    try {
        a = new am({
            email: auth_mail,
            password: await hash.getHash(auth_pass),
            level: 0,
            signUpToken: null,
            loginToken: null,
            securityQuestion: null,
            securityAnswer: null,
            resetToken: null
        });
        await a.save();
        console.log('\ncaricato!\n')
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
    
}


async function setStaff(req,res,next){
    staffMail = req.body.staffMail;
    if(!staffMail){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            s = await am.findOne({email: staffMail});
            if(!s){
                token = crypto.randomBytes(32).toString("hex");
                staff = new am({
                    email: staffMail,
                    password: null,
                    level: 1,
                    signUpToken: token,
                    securityQuestion: null,
                    securityAnswer: null,
                    resetToken: null
                });
                await staff.save();
                mail.sendSignupTokenStaff(staffMail,token);
                res.send('Staff inserted in db - email sent for signUp'); 
            }else{
                err = new Error('staff already in');
                err.statusCode=400;
                next(err);
            }
            
        } catch (error) {
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
    }
}

async function getAllStaff(req,res,next){
    try {
        const staff = await am.find({level: 1});
        const result = [];
        for(i=0; i<staff.length; i++){
            let s = await aService.getAdmin(staff[i]._id);
            if(s) result.push(s);
        }
    res.json(result);
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function getAdmin(req,res,next){
    try {
        const staff = await am.find({level: 0});
        const result = [];
        for(i=0; i<staff.length; i++){
            let s = await aService.getAdmin(staff[i]._id);
            if(s) result.push(s);
        }
    res.json(result);
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function removeStaff(req,res,next){
    const sID = req.body.sID;
    if(!sID){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            removed = await aService.removeStaff(sID);
            if(!removed){
                err = new Error('no staff member found');
                err.statusCode=404;
                next(err);
            }else{
                res.send('staff member removed correctly');
            } 
        } catch (error) {
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
        
    }
}

async function ownerSendLoginToken(req,res,next){
    try {
        const email = req.get('email')
        const password = req.get('password')
        if( email !=null && validator.validate(email)){
            const a = await am.findOne({email: email, level: 0});
            if(a!=null && validator.validate(email) && await hash.compare(password,a.password)){
                let loginToken = jwt.getLoginOwnerToken(email);
                a.loginToken = loginToken;
                await a.save();
                mail.ownerSendLoginToken(email,loginToken);
                console.log('\n');
                console.log(email,loginToken);
                console.log('\n');
                res.send('ownerLogin.html?token=' + loginToken);
            }else{
                err = new Error('no owner - check email');
                err.statusCode=406;
                next(err)
            }
        }else{
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
        
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function ownerLogin(req,res,next){
    try{
        data = jwt.getLoginTokenAndEmail(req.get('loginToken'));
        o = await am.findOne({email: data.email});
        token = jwt.getToken({aID: o._id},data.expiredIn);
        await am.findByIdAndUpdate(o._id, {token, loginToken: null})
        res.json({
            aID: o._id,
            token
        })
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
    
}



async function ownerLogout(req,res,next){
    try{
        await am.findByIdAndUpdate(req.get('aID'), {token: null});
        res.json({detail: 'successfully logged out'});
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function staffSignUp(req,res,next){
    data = req.body;
    signUpToken = req.get('signUpToken');
    if(!signUpToken || !validator.validate(data.email) || !data.password || !data.securityQuestion || !data.securityAnswer){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            const s = await am.findOne({email:data.email});
            if( s!=null && s.signUpToken && s.signUpToken === signUpToken){
                s.password = await hash.getHash(data.password);
                s.securityQuestion = data.securityQuestion;
                s.securityAnswer = await hash.getHash(data.securityAnswer);
                s.signUpToken = null;
                s.loginToken = null;
                await s.save();
                mail.sendSignUpStaff(data.email);
                res.send('staff signed up - email sent')
            }else{
                let msg = s==null ? 'no staff in db - contact owner': 'wrong signUpToken'
                err = new Error(msg);
                err.statusCode=406;
                next(err); 
            }   
        } catch (error) {
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
        
        
    }
}


async function staffLogin(req,res,next){
    try{
        s = await am.findOne({email: req.get('email')});
        token = jwt.getToken({aID: s._id},req.body.expiredIn);
        s.loginToken = token;
        await s.save();
        res.json({
            aID: s._id,
            token
        })
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function staffLogout(req,res,next){
    try{
        await am.findByIdAndUpdate(req.get('aID'), {loginToken: null});
        res.json({detail: 'successfully logged out'});
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function staffResetPassword(req,res,next){
    try{
        let email = req.get('email');
        if(validator.validate(email) && req.get('securityQuestion') && req.get('securityAnswer')){
            s = await am.findOne({email});
            if(s != null){
                if(s.securityQuestion != req.get('securityQuestion') || ! await hash.compare(req.get('securityAnswer'),s.securityAnswer)){
                    err = new Error('security question or answer are wrong');
                    err.statusCode=406;
                    next(err); 
                }else{
                    token = jwt.getResetPassToken(email);
                    s.resetToken = token;
                    s.password = null;
                    await s.save();
                    mail.sendResetPassAdmin(email,token);
                    res.send('reset token sent');
                }
            }else{
                err = new Error('no staff with this email');
                err.statusCode=406;
                next(err); 
            }
        }else{
            err = new Error('wrong or missing params');
            err.statusCode=406;
            next(err);
        }
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function staffSetPassword(req,res,next){
    try {
        let password = req.get('password');
        let resetToken = req.get('resetToken');
        if(password && resetToken){
            const email = jwt.getEmail(resetToken);
            s = await am.findOne({email});
            if( s && resetToken && resetToken === s.resetToken){
                s.password = await hash.getHash(password);
                s.resetToken = null;
                await s.save();
                res.send('password changed!');
            }else{
                msg = !s? 'no user found': !s.resetToken? 'password already changed':'wrong reset token';
                err = new Error(msg);
                err.statusCode=406;
                next(err);
            }
        }else{
            msg = !validator.validate(email)? 'wrong email format': !resetToken? 'reset token bust be not null': 'password bust be not null';
            err = new Error(msg);
            err.statusCode=406;
            next(err);
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function getGuestBusinessConsultants(req,res,next){
    try {
        const professionals = await pm.find({businessConsultant: 'guest'});
        res.json({
            professionals,
            counter: professionals.length
        })
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }

}

async function getStaffSecurityQuestion(req,res,next){
    try {
        let result = await aService.getStaffSecurityQuestion(req.get('email'));
        if(result){
            res.json({
                securityQuestion: result
            })
        }else{
            err = new Error('no staff found');
            err.statusCode=406;
            next(err)
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

module.exports = {
    setOwner,
    ownerLogin,
    ownerLogout,
    setStaff,
    getAllStaff,
    getAdmin,
    removeStaff,
    staffSignUp,
    staffLogin,
    staffLogout,
    staffResetPassword,
    staffSetPassword,
    ownerSendLoginToken,
    getGuestBusinessConsultants,
    getStaffSecurityQuestion
}