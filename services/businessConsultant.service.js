const bcm = require('../utils/MongoDB/models').businessConsultantModel;


async function getAll(){
    return await bcm.find();
}


module.exports = {
    getAll
}