const um = require('../utils/MongoDB/models').userModel;
const pm = require('../utils/MongoDB/models').professionalModel;
const cs = require('../services/chat.service');
const socketIo = require('../chat/socketIo');

async function getChat(req,res,next){
    console.log("chat.controller")  
    try {
        if(req.get('uID') && req.get('pID')){
            let u = await um.findById(req.get('uID'));
            let p = await pm.findById(req.get('pID'));
            if(u && p){
                let result = await cs.getChat(req.get('uID'),req.get('pID'));
                socketIo.emitEvent('messages',result)
                res.json(result);
            }else{
                err = new Error('no user or professional found');
                err.statusCode=406;
                next(err)
            }
        }else{
            err = new Error('no userID and professionalID params');
            err.statusCode=406;
            next(err)
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }

}

async function sendMessage(req,res,next){
    try {
        if(req.get('uID') && req.get('pID') && req.body.message && req.body.message.from && req.body.message.to && req.body.message.text){
            let u = await um.findById(req.get('uID'));
            let p = await pm.findById(req.get('pID'));
            if(u && p){
                await cs.addMessage(req.get('uID'),req.get('pID'),req.body.message);
                socketIo.emitEvent('sendMessage',message)
                res.json(message);
            }else{
                err = new Error('no user or professional found');
                err.statusCode=406;
                next(err)
            }
        }else{
            err = new Error('no userID and professionalID params');
            err.statusCode=406;
            next(err)
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

async function getDestinatari(req,res,next){
    try {
        if(req.get('uID')){
            let destinatari = await cs.getDestinatariPerUtenti(req.get('uID'));
            res.json(destinatari);
        }else if(req.get('pID')){
            let destinatari = await cs.getDestinatariPerAziende(req.get('pID'));
            res.json(destinatari);
        }else{
            err = new Error('no id param');
            err.statusCode=404;
            next(err);
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}

module.exports = {
    getChat,
    sendMessage,
    getDestinatari
}