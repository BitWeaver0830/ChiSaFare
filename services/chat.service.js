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
    message.read = false;
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

async function markMessagesAsRead(userID, professionalID) {
    await cm.updateOne(
        { userID, professionalID },
        { $set: { "messages.$[elem].read": true } },
        {
            arrayFilters: [
                { "elem.to": professionalID, 
                    $or: [
                        { "elem.read": { $exists: false } },
                        { "elem.read": false } 
                    ]
                }
            ],
            multi: true
        }
    );
}

async function markUserMessagesAsRead(userID, professionalID) {
    await cm.updateOne(
        { userID, professionalID },
        { $set: { "messages.$[elem].read": true } },
        {
            arrayFilters: [
                { "elem.to": userID, 
                    $or: [
                        { "elem.read": { $exists: false } },
                        { "elem.read": false } 
                    ]
                }
            ],
            multi: true
        }
    );
}

async function getUserUnreadCount(userID, professionalID) {
    let c = await cm.findOne({ userID, professionalID });
    if (!c) {
        return 0;
    }
    const unreadMessages = c.messages.filter(message => message.to === userID && !message.read);
    return {
        count: unreadMessages.length,
        latestMessageTime: new Date(Math.max(...unreadMessages.map(message => new Date(message.date))))
    };
}

async function getProfessionalUnreadCount(userID, professionalID) {
    let c = await cm.findOne({ userID, professionalID });
    if (!c) {
        return 0;
    }
    const unreadMessages = c.messages.filter(message => message.to === professionalID && !message.read);
    return {
        count: unreadMessages.length,
        latestMessageTime: new Date(Math.max(...unreadMessages.map(message => new Date(message.date))))
    };
}

async function getTotalUnreadCount(professionalID) {
    let chats = await cm.find({ professionalID });
    if (!chats || chats.length === 0) {
        return 0;
    }

    return chats.reduce((total, chat) => {
        return total + chat.messages.filter(message => message.to === professionalID && !message.read).length;
    }, 0);
}

async function getDestinatariPerUtenti(userID){
    let destinatari = await cm.find({userID});
    if(destinatari){
        let result = [];
        for(let i=0;i<destinatari.length;i++){
            let p = await ps.getProfessionalDestinatario(destinatari[i].professionalID);
            let c = await getUserUnreadCount(userID, destinatari[i].professionalID);
            if(p){
                result.push({ ...p, unreadCount: c.count, latestMessageTime: c.latestMessageTime });
            }
        }
        
        return result.sort((a, b) => {
            const dateA = new Date(a.latestMessageTime);
            const dateB = new Date(b.latestMessageTime);
            
            if (isNaN(dateA.getTime())) return 1; 
            if (isNaN(dateB.getTime())) return -1;
            
            return dateB - dateA;
        });
    }  
    return [];
}

async function getDestinatariPerAziende(professionalID){
    let destinatari = await cm.find({professionalID});
    if(destinatari){
        let result = [];
        for(let i=0;i<destinatari.length;i++){
            let u = await us.getUser(destinatari[i].userID);
            let c = await getProfessionalUnreadCount(destinatari[i].userID, professionalID);
            if(u){
                result.push({ ...u, unreadCount: c.count, latestMessageTime: c.latestMessageTime });
            }
        }

        return result.sort((a, b) => {
            const dateA = new Date(a.latestMessageTime);
            const dateB = new Date(b.latestMessageTime);
            
            if (isNaN(dateA.getTime())) return 1; 
            if (isNaN(dateB.getTime())) return -1;
            
            return dateB - dateA;
        });
    }  
    return [];
}



module.exports = {
    getChat,
    addMessage,
    getDestinatariPerUtenti,
    getDestinatariPerAziende,
    markMessagesAsRead,
    markUserMessagesAsRead,
    getUserUnreadCount,
    getProfessionalUnreadCount,
    getTotalUnreadCount
}