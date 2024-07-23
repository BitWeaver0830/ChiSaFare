const http = require('http');
const { Server } = require("socket.io");
const cs = require('../services/chat.service');
const logger = require('../utils/winston/winston');


let io = null;

function initSocketIo(server){
    
    io = new Server(server);

    io.on('connection',(socket)=>{
        logger.debug('a user connected -> socket id: '+socket.id)
        socket.on('sendMessage',async (data)=>{
            // save in db
            let m = await cs.addMessage(data.userID, data.professionalID,data.message);
            // emit in response
            socket.emit('sendMessage',{
                from: m.from,
                to: m.to,
                text: m.text,
                date: m.date
            })
        })
    })


}

function emitEvent(event,data){
    io.emit(event,data);
}

module.exports = {
    initSocketIo,
    emitEvent
}