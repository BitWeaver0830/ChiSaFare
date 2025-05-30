const um = require('../utils/MongoDB/models').userModel;
const pm = require('../utils/MongoDB/models').professionalModel;
const cs = require('../services/chat.service');
const socketIo = require('../chat/socketIo');

async function getChat(req,res,next){
    console.log("chat.controller")  
    try {
        const uID = req.get('uID');
        const pID = req.get('pID');
        if(uID && pID){
            let u = await um.findById(uID);
            let p = await pm.findById(pID);
            if(u && p){
                if (req.get("professionalID")) await cs.markMessagesAsRead(uID, pID);
                if (req.get("userID")) await cs.markUserMessagesAsRead(uID, pID);
                let result = await cs.getChat(uID,pID);
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

async function getUserUnreadCount(req, res, next) {
    try {
        const uID = req.get('uID');
        const pID = req.get('pID');
        if (uID && pID) {
            const count = await cs.getUserUnreadCount(uID, pID);
            res.json({ unreadCount: count });
        } else {
            const err = new Error('Missing userID or professionalID params');
            err.statusCode = 406;
            next(err);
        }
    } catch (error) {
        const err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function getProfessionalUnreadCount(req, res, next) {
    try {
        const uID = req.get('uID');
        const pID = req.get('pID');
        if (uID && pID) {
            const count = await cs.getProfessionalUnreadCount(uID, pID);
            res.json({ unreadCount: count });
        } else {
            const err = new Error('Missing userID or professionalID params');
            err.statusCode = 406;
            next(err);
        }
    } catch (error) {
        const err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function getTotalUnreadCount(req, res, next) {
    try {
        const pID = req.get('pID');
        if (pID) {
            const count = await cs.getTotalUnreadCount(pID);
            res.json({ unreadCount: count });
        } else {
            const err = new Error('Missing professionalID param');
            err.statusCode = 406;
            next(err);
        }
    } catch (error) {
        const err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

module.exports = {
    getChat,
    sendMessage,
    getDestinatari,
    getUserUnreadCount,
    getProfessionalUnreadCount,
    getTotalUnreadCount
}