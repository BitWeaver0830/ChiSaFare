const mongoose = require('mongoose');
const logger = require('../utils/winston/winston');
const models = require('../utils/MongoDB/models');
const dayjs = require('dayjs');
const validator = require("email-validator");
const jwt = require('../utils/jwt/jwt');
const hash = require('../utils/hash/hash');
const mail = require('../utils/mail/mail');
const pService = require('../services/professional.service');
const rService = require('../services/review.service');
const geo = require('../utils/geo/geo');
const tagService = require('../services/tag.service');

let userModel = models.userModel;
let reviewModel = models.reviewModel;

async function signUp(req, res, next) {
    data = req.body;

    if (data.name && data.lastname && data.email && data.password && validator.validate(data.email) && data.securityAnswer && data.securityQuestion) {
        emailUsed = await userModel.exists({ email: data.email });
        if (emailUsed == null) {
            userData = {
                name: data.name,
                lastname: data.lastname,
                email: data.email,
                password: await hash.getHash(data.password),
                reviews: [],
                signUpDate: dayjs().format(),
                token: null,
                favouriteProfessionals: [],
                resetToken: null,
                securityQuestion: data.securityQuestion,
                securityAnswer: await hash.getHash(data.securityAnswer),
                tags: data.tags
            }
            user = new userModel(userData);
            user.save()
                .then((result) => {
                    mail.sendSignUp(data.email);
                    // add tags in tags if not
                    (async function () {
                        if (data.tags) {
                            for (const tag of data.tags) {
                                const trimmedTag = tag.trimStart().trimEnd();
                                await tagService.regAddTag({ tag: trimmedTag });
                            }
                        }
                    })();
                    res.json({ detail: 'successfully signed up' })
                })
                .catch((err) => {
                    next(err, req, res);
                });
        } else {
            err = new Error('user already exists');
            err.statusCode = 406;
            next(err);
        }
    } else {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    }
}

async function login(req, res, next) {
    const data = req.body;
    if (validator.validate(data.email) && data.password) {
        user = await userModel.find({ email: data.email });

        if (user.length != 0 && user[0].password != null) {
            if (await hash.compare(data.password, user[0].password)) {
                token = jwt.getToken({ userID: user[0]._id.toString() }, data.expiredIn);
                await userModel.findOneAndUpdate({ email: data.email }, { token: token });
                res.json({
                    userID: user[0]._id.toString(),
                    token: token
                })
            } else {
                err = new Error('wrong password');
                err.statusCode = 400;
                next(err);
            }

        } else {
            err = new Error(user == [] ? 'you could login: complete password reset!' : 'user not found');
            err.statusCode = 404;
            next(err);
        }
    } else {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        if (jwt.validateToken(req.get('token'))) {
            await userModel.findByIdAndUpdate(req.get('userID'), { token: null });
            res.json({ detail: 'successfully logged out' });
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err)
    }
}

async function resetPassword(req, res, next) {
    data = req.body;
    if (!validator.validate(data.email) || !data.securityQuestion || !data.securityAnswer) {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    } else {
        try {
            const user = await userModel.find({ email: data.email });

            if (user.length != 0) {
                if (user[0].securityQuestion === data.securityQuestion && await hash.compare(data.securityAnswer, user[0].securityAnswer)) {
                    resetToken = jwt.getResetPassToken(data.email);
                    hashedToken = await hash.getHash(resetToken);
                    await userModel.findByIdAndUpdate(user[0]._id, { resetToken: hashedToken, password: null });
                    mail.sendResetPassUser(data.email, resetToken);
                    res.json({ detail: 'password has been reset - email with token sent' });
                } else {
                    err = new Error('wrong security question and answer');
                    err.statusCode = 400;
                    next(err);
                }
            } else {
                err = new Error('No user found!');
                err.statusCode = 406;
                next(err)
            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode = 406;
            next(err)
        }
    }
}

async function setPassword(req, res, next) {
    data = req.body;
    if (!data.password || !data.resetToken) {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    } else {
        try {
            const email = jwt.getEmail(data.resetToken);
            const user = await userModel.find({ email: email });

            if (user.length != 0) {
                if (await hash.compare(data.resetToken, user[0].resetToken)) {
                    await userModel.findByIdAndUpdate(user[0]._id, { password: await hash.getHash(data.password), resetToken: null });
                    mail.sendPassUpdated(email);
                    res.json({ detail: 'password has been updated - email with confirm sent' });
                } else {
                    err = new Error('Wrong reset token');
                    err.statusCode = 400;
                    next(err)
                }
            } else {
                err = new Error('No user found!');
                err.statusCode = 406;
                next(err)
            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode = 406;
            next(err)
        }
    }
}

async function setFavouiriteProfessional(req, res, next) {
    data = req.body;
    if (!data.professionalID) {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    } else {
        try {
            user = await userModel.findById(req.get('userID'));
            p = await pService.getProfessionalInfo(data.professionalID);

            if (p != null && user.favouriteProfessionals.indexOf(data.professionalID) == -1) {
                user.favouriteProfessionals.push(data.professionalID);
                user.save();
                res.json({ detail: 'successfully added favourite professional' });
            } else {
                err = new Error('professional is already a favourite one');
                err.statusCode = 400;
                next(err);
            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode = 406;
            next(err)
        }
    }
}

async function removeFavouiriteProfessional(req, res, next) {
    data = req.body;
    if (!data.professionalID) {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    } else {
        try {
            user = await userModel.findById(req.get('userID'));
            p = await pService.getProfessionalInfo(data.professionalID);
            let index = user.favouriteProfessionals.indexOf(data.professionalID);
            if (p != null && index != -1) {
                let fp = user.favouriteProfessionals;
                let p = [];
                p.push(...fp.slice(0, index));
                p.push(...fp.slice(index + 1));
                user.favouriteProfessionals = p;
                await user.save();
                res.json({ detail: 'successfully removed favourite professional' });
            } else {
                err = new Error('professional is not a favourite one');
                err.statusCode = 400;
                next(err);
            }
        } catch (error) {
            err = new Error(error.message);
            err.statusCode = 406;
            next(err);
        }
    }
}

async function getSecurityQuestion(req, res, next) {
    const data = req.body;
    if (!validator.validate(data.email)) {
        err = new Error('wrong or missing params');
        err.statusCode = 400;
        next(err);
    } else {
        const user = await userModel.find({ email: data.email });
        if (user.length != 0) {
            res.json({ securityQuestion: user[0].securityQuestion })
        } else {
            err = new Error('No user found!');
            err.statusCode = 406;
            next(err);
        }
    }
}

async function deleteAccount(req, res, next) {
    try {
        const user = await userModel.findByIdAndDelete(req.get('userID'));
        mail.sendRemoved(user.email);
        res.send('account deleted correctly - email sent');
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function addReview(req, res, next) {
    try {
        let data = req.body;
        if (req.get('userID') && data.vote && data.text && await pService.getProfessionalInfo(data.professionalID)) {
            const r = await rService.addReview(data.vote, data.text, req.get('userID'), data.professionalID);
            const u = await userModel.findById(req.get('userID'));
            if (!u.reviews.includes(r._id)) {
                u.reviews.push(r._id.toString());
                await u.save();
                await pService.addReview(data.professionalID, r._id.toString());
                res.status(200).send('review added succesfully');
            } else {
                res.status(200).send('review already in, but upgraded succesfully');
            }
        } else {
            err = new Error('wrong params');
            err.statusCode = 406;
            next(err)
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function removeReview(req, res, next) {
    try {
        if (req.get('reviewID')) {
            const u = await userModel.findById(req.get('userID'));
            if (u.reviews.includes(req.get('reviewID'))) {
                u.reviews = u.reviews.filter(r => r != req.get('reviewID'));
                await u.save();

                await rService.removeReview(req.get('reviewID'));
                res.send('review removed succesfully')
            } else {
                err = new Error('no review found');
                err.statusCode = 406;
                next(err)
            }
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function getProfessional(req, res, next) {
    try {
        if (req.get('professionalID')) {
            let p = await pService.getProfessional(req.get('professionalID'));
            p.profileStatus = {
                status: p.profileStatus.get('status'),
                exp: p.profileStatus.get('exp')
            }
            if (p) {
                for (let i = 0; i < p.reviews.length; i++) {
                    p.reviews[i] = await rService.getReview(p.reviews[i]);
                }
                res.json(p);
            }
            else {
                err = new Error('No professional found!');
                err.statusCode = 406;
                next(err)
            }
        } else {
            err = new Error('No professionalID params!');
            err.statusCode = 406;
            next(err)
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function getAllProfessionals(req, res, next) {
    try {
        let professionals = await pService.getAllProfessional();
        result = [];
        let distanceMax = req.get('distance');
        let lat = req.get('lat');
        let lon = req.get('lon');
        let reviewMin = req.get('reviewMin');
        let category = req.get('category');
        let keyWords = req.get('keyWords');
        let distances = new Map();

        if (distanceMax && keyWords) {
            for (let i = 0; i < professionals.length; i++) {
                let p = professionals[i];
                let scarto = false;

                if (distanceMax && lat && lon) {
                    const distance = geo.getLinearDistance(lat, lon, p.latitude, p.longitude);
                    if (!distance || distance > parseFloat(distanceMax)) {
                        scarto = true;
                    } else {
                        distances.set(p._id, distance);
                    }
                }
                if (!scarto && reviewMin) {
                    let avg = await pService.getAvgReview(p._id);
                    if (!avg) avg = 0;
                    if (avg < reviewMin) {
                        scarto = true;
                    }
                }
                if (!scarto && category) {
                    if (!p.category.includes(category)) {
                        scarto = true;
                    }
                }
                if (!scarto && keyWords) {
                    let kW = keyWords.toLowerCase().replace('\n', '').split(' ');
                    let category = p.category ? p.category.toLowerCase() : [];
                    let intro = p.intro ? p.intro.toLowerCase() : [];
                    let aboutUsCopy = p.aboutUsCopy ? p.aboutUsCopy.toLowerCase() : [];
                    let ragioneSociale = p.ragioneSociale ? p.ragioneSociale.toLowerCase() : [];
                    let test = kW.some(c => category.includes(c) || intro.includes(c) || aboutUsCopy.includes(c) || ragioneSociale.includes(c));
                    if (!test) scarto = true;
                }
                if (!scarto) {
                    let prof = pService.getProfessionalAsync(p);
                    for (let i = 0; i < prof.reviews.length; i++) {
                        prof.reviews[i] = await rService.getReview(prof.reviews[i]);
                    }
                    prof.distance = distances.get(p._id);
                    prof.status = prof.profileStatus.get('status');
                    result.push(prof);
                }
            }
            res.json(result.sort((a, b) => {
                return b.distance - a.distance
            }))
        } else {
            err = new Error('at least distanceMax and keyWords params pls');
            err.statusCode = 406;
            next(err);
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

async function getAllActiveProfessionals(req, res, next) {
    try {
        let professionals = await pService.getAllProfessional();
        result = [];
        let distanceMax = req.get('distance');
        let lat = req.get('lat');
        let lon = req.get('lon');
        let reviewMin = req.get('reviewMin');
        let category = req.get('category');
        let tags = req.get('tags');
        let keyWords = req.get('keyWords');
        let distances = new Map();
        if (distanceMax && (keyWords || category)) {
            for (let i = 0; i < professionals.length; i++) {
                let p = professionals[i];
                let scarto = false;
                
                if (p.profileStatus.get('status') == 'non attivo') {
                    scarto = true;
                }
                if (distanceMax && lat && lon) {
                    const distance = geo.getLinearDistance(lat, lon, p.latitude, p.longitude);
                    distances.set(p._id, distance);

                    if (!distance || distance > parseFloat(distanceMax)) {
                        scarto = true;
                    } else {
                        distances.set(p._id, distance);
                    }
                }
                if (!scarto && reviewMin) {
                    let avg = await pService.getAvgReview(p._id);
                    if (!avg) avg = 0;
                    if (avg < reviewMin) {
                        scarto = true;
                    }
                }
                if (!scarto && category) {
                    if (!p.category.includes(category)) {
                        scarto = true;
                    }
                }
                if (!scarto && tags) {
                    let professionTags = p.tags || []; // Default to an empty array if tags are not defined for the professional
                    let tag = tags;
                    let tagMatch = false;
                    if (Array.isArray(professionTags)) {
                        professionTags = professionTags.join(' ');
                    }
                    professionTags = professionTags.toLowerCase().split(' ');
                    for (let j = 0; j < professionTags.length; j++) {
                        let professionTag = professionTags[j].trim(); // Trim whitespaces
                        if (professionTag === tag) {
                            tagMatch = true;
                            break;
                        }
                    }
                    if (tagMatch) {
                        scarto = false;
                    }
                }

                function compareFn(a, b) {
                    if (keyWords || category) {
                        let kW = keyWords.toLowerCase().replace('\n', '').split(' ');
                        let categoryA = a.category ? a.category.toLowerCase() : [];
                        let categoryB = b.category ? b.category.toLowerCase() : [];
                        let introA = a.intro ? a.intro.toLowerCase() : [];
                        let introB = b.intro ? b.intro.toLowerCase() : [];
                        let tagsA = a.tags ? a.tags.map(tag => tag.toLowerCase()) : [];                    
                        let tagsB = b.tags ? b.tags.map(tag => tag.toLowerCase()) : [];                    
                        let aboutUsCopyA = a.aboutUsCopy ? a.aboutUsCopy.toLowerCase() : [];
                        let aboutUsCopyB = b.aboutUsCopy ? b.aboutUsCopy.toLowerCase() : [];
                        let ragioneSocialeA = a.ragioneSociale ? a.ragioneSociale.toLowerCase() : [];
                        let ragioneSocialeB = b.ragioneSociale ? b.ragioneSociale.toLowerCase() : [];
                        let occurrencesA = kW.reduce(function(acc, c) {
                            acc += (categoryA.includes(c) ? 1 : 0) + (introA.includes(c) ? 1 : 0) + (aboutUsCopyA.includes(c) ? 1 : 0) + (ragioneSocialeA.includes(c) ? 1 : 0) + (tagsA.includes(c) ? 1 : 0);
                            return acc;
                        }, 0);
                        let occurrencesB = kW.reduce(function(acc, c) {
                            acc += (categoryB.includes(c) ? 1 : 0) + (introB.includes(c) ? 1 : 0) + (aboutUsCopyB.includes(c) ? 1 : 0) + (ragioneSocialeB.includes(c) ? 1 : 0) + (tagsB.includes(c) ? 1 : 0);
                            return acc;
                        }, 0);
                        if (occurrencesA < occurrencesB) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }
                    return 0;
                  }

                if (!scarto) {
                    let prof = pService.getProfessionalAsync(p);
                    for (let i = 0; i < prof.reviews.length; i++) {
                        prof.reviews[i] = await rService.getReview(prof.reviews[i]);
                    }
                    prof.distance = distances.get(p._id);
                    prof.status = prof.profileStatus.get('status');
                    result.push(prof);
                }
            }
            result = result.sort(compareFn);
            res.json(result);
        } else {
            err = new Error('at least distanceMax and keyWords params pls');
            err.statusCode = 406;
            next(err);
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}





async function getUser(req, res, next) {
    try {
        let u = await userModel.findById(req.get('userID'))
        let result = {
            name: u.name,
            lastname: u.lastname,
            email: u.email,
            favouriteProfessionals: [],
            reviews: []
        }
        for (let i = 0; i < u.favouriteProfessionals.length; i++) {
            p = await pService.getProfessionalPreview(u.favouriteProfessionals[i]);
            result.favouriteProfessionals.push(p)
        }
        for (let i = 0; i < u.reviews.length; i++) {
            r = await rService.getReview(u.reviews[i]);
            result.reviews.push(r);
        }
        res.json(result);
    } catch (error) {
        err = new Error(error.message);
        err.statusCode = 406;
        next(err);
    }
}

module.exports = {
    signUp,
    login,
    logout,
    resetPassword,
    setPassword,
    setFavouiriteProfessional,
    removeFavouiriteProfessional,
    getSecurityQuestion,
    deleteAccount,
    addReview,
    removeReview,
    getProfessional,
    getAllProfessionals,
    getAllActiveProfessionals,
    getUser
}