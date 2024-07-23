const dayjs = require('dayjs');
const models = require('../utils/MongoDB/models');
const postModel = models.postModel;
const commentModel = models.commentModel;
const professionalModel = models.professionalModel;

function addPost(postData){
    post = new postModel(postData);
    return post.save();
}

function getOnePost(postID){
    return postModel.findById(postID);
}

function getAllPosts(from,num){
    return postModel.find({}).skip(from-1).limit(num);
}

function updatePost(postID,postData){
    return postModel.findByIdAndUpdate(postID,postData);
}

function removePost(postID){
    return postModel.findByIdAndRemove(postID);
}

async function checkIfExists(postID){
    return (await postModel.findById(postID)) != null
}

async function getComment(commentID){
    return await commentModel.findById(commentID);
}

async function addComment(commentID){
    const c = new commentModel(commentID);
    return await c.save();
}

async function removeComment(commentID){
    return await commentModel.findByIdAndDelete(commentID);
}

async function addLike(professionalID, postID){
    post = await postModel.findById(postID);
    post.likes.push(professionalID);
    return post.save();
}

async function removeLike(professionalID, postID){
    post = await postModel.findById(postID);
    post.likes = post.likes.filter(pID => pID != professionalID);
    var index = post.likes.indexOf(post.likes);
    if (index !== -1) {
        array.splice(index, 1);
    }
    return post.save();
}

async function getLikes(postID){
    post = await postModel.findById(postID);
    return post.likes;
}

async function getFollowedPosts(professionalsID,from=0,num=10){
    posts = [];

    for(let i=0; i<professionalsID.length; i++){
        posts.push(await postModel.find({professionalID: professionalsID[i]}))
    };

    posts.sort(function(a,b){
        return dayjs(b.date).diff(dayjs(a.date));
    });


    return posts.slice(from,from+num);
}

module.exports = {
    addPost,
    getOnePost,
    getAllPosts,
    updatePost,
    removePost,
    checkIfExists,
    getComment,
    addComment,
    removeComment,
    addLike,
    getLikes,
    removeLike,
    getFollowedPosts
}