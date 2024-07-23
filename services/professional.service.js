const models = require('../utils/MongoDB/models');
const postService  = require('./post.service');
const reviewService = require('./review.service');

const pm = models.professionalModel;

async function getProfessionalDestinatario(id){
    if(!id){
        return null;
    }
    let p = await pm.findById(id);
    if(p!= null){
        p = p.toObject();
        delete p.password;
        delete p.signUpDate;
        delete p.token;
        delete p.resetToken;
        delete p.securityAnswer;
        delete p.securityQuestion;
        delete p.__v;
        delete p.ateco;
        delete p.durcExp;
        delete p.visuraExp;
        delete p.insuranceExp;
        delete p.intro;
        delete p.aboutUsGallery;
        delete p.aboutUsCopy;
        delete p.specializationsGallery;
        delete p.businessConsultant;
        delete p.posts;
        delete p.followedProfessionals;
        delete p.followingProfessionals;
        delete p.reviews;
        delete p.profileStatus;
        delete p.latitude;
        delete p.longitude;
        return p;
    }else return null;
}

async function getProfessional(id){
    if(!id){
        return null;
    }
    let p = await pm.findById(id);
    if(p!= null){
        p = p.toObject();
        delete p.password;
        delete p.signUpDate;
        delete p.token;
        delete p.resetToken;
        delete p.securityAnswer;
        delete p.securityQuestion;
        delete p.__v;
        return p;
    }else return null;
} 

function getProfessionalSync(p){
    if(p!= null){
        p = p.toObject();
        delete p.password;
        delete p.token;
        delete p.resetToken;
        delete p.securityAnswer;
        delete p.securityQuestion;
        delete p.__v;
        return p;
    }else return null;
} 


function getProfessionalAsync(p){
    p = p.toObject();
    delete p.password;
    delete p.signUpDate;
    delete p.token;
    delete p.resetToken;
    delete p.securityAnswer;
    delete p.securityQuestion;
    delete p.__v;
    return p;
}

async function getProfessionalPosts(id,from,num){
    if(!id) return null;
    let posts = (await pm.findById(id)).posts;
    if(posts && from && num){
        return await postService.getAllPosts(from,num)
    }else return null;
}

async function getProfessionalInfo(id, social=false,from=null,num=null){
    if(id){
        let p = await pm.findById(id);
        if(p){
            p = p.toObject();
            let result = {};
            result.pID= id;
            result.intro= p.intro;
            result.aboutUsGallery= p.aboutUsGallery;
            result.aboutUsCopy= p.aboutUsCopy;
            result.specializationGallery= p.specializationsGallery;
            result.profilePic= p.profilePic || null;
            result.reviews = p.reviews;
            if(social){
                result.posts= await getProfessionalPosts(id,from,num);
                result.followedPosts = await postService.getFollowedPosts(id,from,num);
            }
            return result;
        }else return null;
    }else return null;
}

function getProfessionalInfoAsync(professional){
    p = professional.toObject();
    let result = {};
    result.pID= p._id;
    result.intro= p.intro;
    result.aboutUsGallery= p.aboutUsGallery;
    result.aboutUsCopy= p.aboutUsCopy;
    result.specializationGallery= p.specializationsGallery;
    result.profilePic= p.profilePic || null;
    result.reviews = p.reviews;
    result.category = p.category;
    result.address = p.address;
    result.city = p.city;
    result.province = p.province;
    result.cap = p.cap;
    return result;
}


async function getProfessionalPreview(pID){
    if(pID){
        let p = await pm.findById(pID);
        if(p){
            result = {
                pID,
                ragioneSociale: p.ragioneSociale,
                profilePic: p.profilePic || null,
                intro: p.intro,
                category: p.category
            }
            return result
        }else{
            return null
        }
    }
    return null
}

function getProfessionalPreviewSync(p){
    result = {
        pID: p._id,
        ragioneSociale: p.ragioneSociale,
        profilePic: p.profilePic || null,
        intro: p.intro,
        category: p.category
    }
    return result
}


async function checkActive(id){
    if(id){
        let p = await pm.findById(id);
        if(p){
            return p.profileStatus.status === 'attivo'
        }else return false
    }else return false
}

async function addPost(postID,pID){
    if(postID){
        p = await pm.findById(pID);
        p.posts.push(postID);
        await p.save();
        return true;
    }else return false
}

async function addReview(professionalID, reviewID){
    if(reviewID && professionalID){
        let p = await pm.findById(professionalID);
        if(p){
            p.reviews.push(reviewID);
            await p.save();
            return true;
        }else return false
    }else return null
}

async function getAllProfessional(){
    return await pm.find();
}

async function getAvgReview(id){
    if(id){
        let reviews  = (await pm.findById(id)).reviews;
        let count = reviews.length;
        let sum = 0;
        for(let i=0; i<count; i++){
            sum += (await reviewService.getReview(reviews[i])).vote
        }
        return sum/count;
    }else return -1
}

async function getAllActiveProfessionals(){
    let p = await pm.find();
    let result = [];
    for(let i=0; i<p.length;i++){
        if(p[i].profileStatus.get('status') === 'da saldare'){
            result.push(getProfessionalSync(p[i]))
        }
    }
    return result;
}

async function setSaldato(pID){
    let p = await pm.findById(pID);
    let old = p.profileStatus;
    old.set('status','saldato');
    p.profileStatus=old;
    await p.save()
    return true;
}


module.exports = {
    getProfessional,
    getProfessionalInfo,
    getProfessionalPosts,
    checkActive,
    addPost,
    addReview,
    getAllProfessional,
    getAvgReview,
    getProfessionalPreview,
    getProfessionalPreviewSync,
    getProfessionalInfoAsync,
    getProfessionalAsync,
    getAllActiveProfessionals,
    setSaldato,
    getProfessionalDestinatario
}