const cm = require('../utils/MongoDB/models').chatModel;
const dayjs = require('dayjs');
const ps = require('./professional.service');
const us = require('./users.service');

async function getChat(userID, professionalID){
    let c = await cm.findOne({userID,professionalID});
    if(!c){
        c = new cm({
            userID,
            professionalID,
            messages: []
        })
        console.log("chat.service")
        await c.save();
    }
    return c;
}

async function addMessage(userID,professionalID,message){
    if(! message.from || !message.to || !message.text){
        return false
    }
    let c = await cm.findOne({userID,professionalID});
    message.date = dayjs().format()
    if(!c){
        c = new cm({
            userID,
            professionalID,
            messages: [].push(message)
        })
        await c.save();
        return message
    }else{
        c.messages.push(message);
        await c.save();
        return message;
    }
}

async function getDestinatariPerUtenti(userID){
    let destinatari = await cm.find({userID});
    if(destinatari){
        let result = [];
        for(let i=0;i<destinatari.length;i++){
            let p = await ps.getProfessionalDestinatario(destinatari[i].professionalID);
            if(p){
                result.push(p);
            }
        }
        
    return result;
    }  
    return [];
}

async function getDestinatariPerAziende(professionalID){
    let destinatari = await cm.find({professionalID});
    if(destinatari){
        let result = [];
        for(let i=0;i<destinatari.length;i++){
            let u = await us.getUser(destinatari[i].userID);
            if(u){
                result.push(u);
            }
        }

    return result;
    }  
    return [];
}



module.exports = {
    getChat,
    addMessage,
    getDestinatariPerUtenti,
    getDestinatariPerAziende
}