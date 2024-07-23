const mongoose = require('mongoose');
const logger = require('../utils/winston/winston');
const models = require('../utils/MongoDB/models');
const dayjs = require('dayjs');
const validator = require("email-validator");
const jwt = require('../utils/jwt/jwt');
const hash = require('../utils/hash/hash');
const mail = require('../utils/mail/mail');
const multers = require("../utils/multer/multers");
const fs = require('fs')
const { promisify } = require('util');
const pService = require('../services/professional.service');
const aService = require('../services/ateco.service');
const unlinkAsync = promisify(fs.unlink)
const bucketService = require('../services/bucket.service');
const tagService = require('../services/tag.service');

let bcm = models.businessConsultantModel;
let pm = models.professionalModel;
const bcFields = [ 'email','name','lastname','pIva','address','city','province','iban'];
const pFields = [ 'ragioneSociale','pIva','address','city','province','cap','visuraExp','durcExp','insuranceExp','category','ateco', 'latitude', 'longitude','tags'];

async function signUp(req,res,next){
    console.log("Signup in corso...");
    const data = req.body;
    if(!data.name || !data.lastname || !validator.validate(data.email) || !data.password || !data.pIva || !data.pIva.length==11 || !/^\d+$/.test(data.pIva) || !data.address || !data.city || !data.province || !data.iban || !data.securityQuestion || !data.securityAnswer){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);        
    }else{
        emailUsed = await bcm.findOne({email: data.email});
        pIvaUsed = await bcm.findOne({pIva: data.pIva});
        if(!emailUsed && !pIvaUsed && req.file){
            bcData = {    
                name: data.name,
                lastname: data.lastname,
                email: data.email,
                password: await hash.getHash(data.password),
                signUpDate: dayjs().format(),
                token: null,
                professionals: [],
                resetToken: null,
                securityQuestion: data.securityQuestion,
                securityAnswer: await hash.getHash(data.securityAnswer),
                pIva: data.pIva,
                address: data.address,
                city: data.city,
                province: data.province,
                iban: data.iban,
                selfCertified: req.file.location
            }
            bc = new bcm(bcData);
            bc.save()
                .then((result) => {
                    mail.sendSignUp(data.email);
                    res.send('business consultant signed up succesfully - email sent');
                })
                .catch((err)=>{
                    next(err,req,res);
                });    
        }else{
            msg = !req.file ? 'failed to load file': 'business  consultant already exists'
            err = new Error(msg);
            err.statusCode=406;
            next(err);
        }     
    }
}

async function login(req,res,next){
    data = req.body;

    if(validator.validate(data.email) && data.password){
        bc = await bcm.find({email: data.email});
        if(bc.length != 0 && bc[0].password != null){
            if(await hash.compare(data.password, bc[0].password)){
                token = jwt.getToken({bcID: bc[0]._id.toString()},data.expiredIn);
                await bcm.findOneAndUpdate({email: data.email},{token: token});
                res.json({
                    bcID: bc[0]._id.toString(),
                    token: token,
                    name: bc[0].name,
                    lastname: bc[0].lastname,
                })
            }else{
                err = new Error('wrong password');
                err.statusCode=400;
                next(err);
            }
            
        }else{
            err = new Error(bc==[] ? 'you could not login: complete password reset!' : 'business  consultant not found');
            err.statusCode=404;
            next(err);
        }
    }else{
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }

}

async function logout(req,res,next){
    data = req.body;
    try {
        if(jwt.validateToken(req.get('token'))){
            await bcm.findByIdAndUpdate(req.get('bcID'), { token: null});
            res.json({detail: 'successfully logged out'});
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function resetPassword(req,res,next){
    data = req.body;
    if(!validator.validate(data.email) || !data.securityQuestion || !data.securityAnswer){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try{
            const bc = await bcm.find({email: data.email});
            if( bc.length != 0){
                if(bc[0].securityQuestion === data.securityQuestion && await hash.compare(data.securityAnswer,bc[0].securityAnswer)){
                    resetToken = jwt.getResetPassToken(data.email);
                    hashedToken = await hash.getHash(resetToken);
                    await bcm.findByIdAndUpdate(bc[0]._id, {resetToken: hashedToken, password: null});
                    mail.sendResetPassBC(data.email,resetToken);
                    res.json({detail: 'password has been reset - email with token sent'});
                }else{
                    err = new Error('wrong security question and answer');
                    err.statusCode=400;
                    next(err);
                }

            }else{
                err = new Error('No business consultant found!');
                err.statusCode=406;
                next(err)
            }
        }catch(error){
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
    }

}

async function setPassword(req,res,next){
    data = req.body;
    if(!data.password || !data.resetToken ){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try{
            const email = jwt.getEmail(data.resetToken);
            const bc = await bcm.find({email});
            if( bc.length != 0){
                if(await hash.getHash(data.resetToken) === bc[0].resetToken){
                    await bcm.findByIdAndUpdate(bc[0]._id, {password: await hash.getHash(data.password)});
                    mail.sendPassUpdated(email);
                    res.json({detail: 'password has been updated - email with confirm sent'});
                }else{
                    err = new Error('Wrong reset token');
                    err.statusCode=400;
                    next(err)
                }
    
            }else{
                err = new Error('No business  consultant found!');
                err.statusCode=406;
                next(err)
            }
        }catch(error){
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
    }
}

async function setProfessional(req,res,next){
    data = req.body;
    if(!req.get('bcID') || !req.get('token') || !data.professionalID){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            if(jwt.validateToken(req.get('token'))){
                bc = await bcm.findById(req.get('bcID'));
                if( bc.professionals.indexOf(data.professionalID) == -1){
                    bc.professionals.push(data.professionalID);
                    bc.save();
                    res.json({detail: 'successfully added favourite professional'});
                }else{
                    err = new Error('professional is already in');
                    err.statusCode=400;
                    next(err);
                }

            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
    }

}

async function getSecurityQuestion(req,res,next){
    data = req.body;
    if(!validator.validate(data.email)){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            const bc = await bcm.find({email: data.email});
            if( bc.length != 0){
                res.json({securityQuestion: bc[0].securityQuestion})
            }else{
                err = new Error('No business consultant found!');
                err.statusCode=406;
                next(err)
            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode=406;
            next(err)
        }
    }

}


async function getAllProfessionals(req,res,next){
    try {
        const bc = await bcm.findById(req.get('bcID'));
        const result = [];
        for(let i=0; i<bc.professionals.length; i++){
            let p = await pService.getProfessional(bc.professionals[i]);
            if(p){
                p.profileStatus = {
                    status: p.profileStatus.get('status'),
                    exp: p.profileStatus.get('exp')
                }
                result.push(p);
            } 
        }
        res.json({
            professionals: result,
            counter: result.length
        });
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)       
    }
}

async function getAllActiveProfessionals(req,res,next){
    try {
        const bc = await bcm.findById(req.get('bcID'));
        const result = [];
        for(let i=0; i<bc.professionals.length; i++){
            let p = await pService.getProfessional(bc.professionals[i]);
            if(p && await pService.checkActive()) result.push(p);
        }
        res.send({
            professionals: result,
            counter: result.length
        });
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)  
    }
}

async function getAllUnactiveProfessionals(req,res,next){
    try {
        const bc = await bcm.findById(req.get('bcID'));
        const result = [];
        for(let i=0; i<bc.professionals.length; i++){
            let p = await pService.getProfessional(bc.professionals[i]);
            if(p && ! (await pService.checkActive())) result.push(p);
        }
        res.send({
            professionals: result,
            counter: result.length
        });
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)  
    }
}

async function updateFields(req,res,next){
    try{
        let changed = [], notChange = [];
        let obj = {}
        let fields = Object.keys(req.body.fields);
        if (fields.includes("pIva")){
            console.log('p.iva inviata');
            let alreadyTaken = await bcm.find({ pIva : req.body.fields.pIva}).exec();

            if(alreadyTaken.length > 0){
                if(req.get('bcID') != alreadyTaken[0]._id.toString()){
                    err = new Error('P.Iva già presente');
                    err.statusCode=400;
                    next(err);
                    return;
                }
            }

        }else{
            console.log('p.iva non inviata');
        }

        for(i=0; i<fields.length; i++){
            
            if(bcFields.includes(fields[i])){
                changed.push(fields[i]);
                obj[fields[i]]=req.body.fields[fields[i]]
            }else{
                notChange.push(fields[i])
            }
        }
        if(notChange.length == 0){
            await bcm.findByIdAndUpdate(req.get('bcID'), obj);
            res.json('Sucessfully updated!');
        }else{
            err = new Error('wrong params');
            err.statusCode=400;
            next(err);
            return;
        }
    } catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)         
    }
}

async function updateSelfCertified(req,res,next){
        if(req.file){
            const bc = await bcm.findById(req.get('bcID'));
            const key = "autocertificazioni" + bc.selfCertified.split('/autocertificazioni')[1].replaceAll("%20", " ");
            await bucketService.deleteS3File("chi-sa-fare-bucket", key);
            bc.selfCertified = req.file.location;
            await bc.save();
            res.status(200).send("Updated");
        } else {
            err = new Error('Nessun file');
            err.statusCode=400;
            next(err);
            return;
        }
}


async function deleteAccount(req,res,next){
    try{
        const bc = await bcm.findById(req.get('bcID'));
        try {
            await unlinkAsync(bc.selfCertified);
        } catch (error) {}
        await bcm.findByIdAndRemove(bc._id);
        await pm.updateMany({businessConsultant: bc._id}, {businessConsultant: 'guest'});
        mail.sendRemoved(bc.email);
        res.send('account deleted correctly');
    }catch(error){
        err = new Error(error.message);
        err.statusCode=406;
        next(err)       
    }
}

async function signUpProfessional(req,res,next){
    let data = req.body;
    if(!data.ragioneSociale || !data.ateco ||!data.email || !validator.validate(data.email)|| !data.pIva || data.pIva.length!=11 || !/^\d+$/.test(data.pIva) || !data.address || !data.city || !data.province || !data.cap || !data.durcExp || !data.visuraExp || !data.insuranceExp ){
        err = new Error('wrong or missing params');
        err.statusCode=400;
        next(err);
    }else{
        try {
            ateco = data.ateco;
            if(! await aService.checkAteco(ateco)){
                err = new Error('wrong ateco!');
                err.statusCode=400;
                next(err);
            }
            pIva = await pm.exists({pIva: data.pIva});
            email = await pm.exists({email: data.email});
            if( pIva == null && email == null){
                resetToken = jwt.getSignUpToken(data.email);
                pData={
                    email: data.email,
                    ragioneSociale: data.ragioneSociale,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    pIva: data.pIva,
                    address: data.address,
                    city: data.city,
                    province: data.province,
                    cap: data.cap,
                    durcExp: dayjs(data.durcExp).format(),
                    visuraExp: dayjs(data.visuraExp).format(),
                    insuranceExp: dayjs(data.insuranceExp).format(),
                    aboutUsGallery: [],
                    specializationGallery: [],
                    posts: [],
                    reviews: [],
                    followedProfessionals: [],
                    followingProfessionals: [],
                    signUpDate: dayjs().format(),
                    businessConsultant: req.get('bcID'),
                    profileStatus: {
                        status: 'non attivo',
                        exp: null
                    },
                    password: null,
                    token: null,
                    resetToken,
                    securityQuestion: null,
                    securityAnswer: null,
                    number: null,
                    category: (data.ateco.split('-'))[1],
                    ateco: data.ateco,
                    intro: null,
                    aboutUsCopy: null,
                    tags: data.tags
                }
                p = new pm(pData);
                
                (async function () {
                    if (data.tags) {
                        for (const tag of data.tags) {
                            const trimmedTag = tag.trimStart().trimEnd();
                            await tagService.regAddTag({ tag: trimmedTag });
                        }
                    }
                })();
                p.save()
                    .then(async (result) => {
                        bc = await bcm.findById(req.get('bcID'));
                        bc.professionals.push(result._id.toString());
                        await bc.save();
                        mail.sendProfessionalSignUpLink(data.email,resetToken, result._id.toString());

                        await aService.addToMacroAteco(ateco,result._id);
                        res.send('professional signed up succesfully from businessConsultant');
                    })
                    .catch((err)=>{
                        next(err,req,res);
                    });  

            }else{
                msg = pIva ? 'Piva already used' : 'mail already used';
                err = new Error(msg);
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

async function updateProfessional(req, res, next) {
    try {
        if (req.get('pIVA')) {
            let professionals = (await bcm.findById(req.get('bcID'))).professionals;
            let pID = (await pm.findOne({ pIva: req.get('pIVA') }))._id;
            if (!professionals.includes(pID)) {
                let err = new Error('No professionals found with this pIVA - commercialist is right?!');
                err.statusCode = 400;
                next(err);
                return;
            }
            
            let changed = [];
            let notChange = [];
            let obj = {};
            let fields = Object.keys(req.body.fields);

            for (let i = 0; i < fields.length; i++) {
                if (pFields.includes(fields[i])) {
                    changed.push(fields[i]);
                    obj[fields[i]] = req.body.fields[fields[i]];
                } else {
                    notChange.push(fields[i]);
                }
            }

            if (req.body.fields.tags && Array.isArray(req.body.fields.tags)) {
                obj.tags = req.body.fields.tags.map(tag => tag.trim());
                for (const tag of obj.tags) {
                    await tagService.regAddTag({ tag });
                }
            }

            if (notChange.length === 0) {
                await pm.findOneAndUpdate({ pIva: req.get('pIVA') }, obj);
                res.json('Successfully updated!');
            } else {
                let err = new Error('One or more params are wrong');
                err.statusCode = 400;
                next(err);
            }
        } else {
            let err = new Error("Wrong params - no professional's pIva!");
            err.statusCode = 400;
            next(err);
        }
    } catch (error) {
        let err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}


async function getBusinessConsultant(req,res,next){
    try {
        let u = await bcm.findById(req.get('bcID'))
        let result = {
            name: u.name,
            lastname: u.lastname,
            email: u.email,
            pIva: u.pIva,
            address: u.address,
            city: u.city,
            province: u.province,
            iban: u.iban, }

        res.json(result)
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}



module.exports = {
    signUp,
    login,
    logout,
    resetPassword,
    setPassword,
    setProfessional,
    getSecurityQuestion,
    getAllProfessionals,
    updateFields,
    updateSelfCertified,
    deleteAccount,
    signUpProfessional,
    updateProfessional,
    getAllActiveProfessionals,
    getAllUnactiveProfessionals,
    getBusinessConsultant,

}