const models = require('../utils/MongoDB/models');
const dayjs = require('dayjs');

const rm = models.reviewModel;

async function addReview(vote,text,userID,professionalID){
    let review = await rm.findOne({
        userID,
        professionalID
    });
    if(!review){
        const r = new rm({
            vote: vote,
            text: text,
            date: dayjs().format(),
            userID: userID,
            professionalID: professionalID
        });
        await r.save();
        return r;
    }else{
        review.vote = vote;
        review.text = text;
        review.date = dayjs().format();
        await review.save();
        return review;
    }
    
}

async function getReview(id){
    return await rm.findById(id);
}

async function removeReview(id){
    return await rm.findByIdAndRemove(id);
}


module.exports = {
    addReview,
    getReview,
    removeReview
}