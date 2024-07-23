const mongoose = require("mongoose");
const logger = require("../utils/winston/winston");
const models = require("../utils/MongoDB/models");
const dayjs = require("dayjs");
const validator = require("email-validator");
const jwt = require("../utils/jwt/jwt");
const hash = require("../utils/hash/hash");
const mail = require("../utils/mail/mail");
const crypto = require("crypto");
const multers = require("../utils/multer/multers");
const fs = require("fs");
const { promisify } = require("util");
const postService = require("../services/post.service");
const professionalService = require("../services/professional.service");
const { professional } = require("../middlewares/authGuard");
const path = require("path");
const bucketService = require("../services/bucket.service");

const unlinkAsync = promisify(fs.unlink);

let pm = models.professionalModel;
const pFields = ["email", "number", "intro"];
const postFields = ["image", "video", "copy", "sell"];

async function signUp(req, res, next) {
	data = req.body;
	if (
		!data.password ||
		!data.number ||
		!data.securityQuestion ||
		!data.securityAnswer ||
		!data.intro ||
		!data.signUpToken
	) {
		err = new Error("wrong or missing params");
		err.statusCode = 400;
		next(err);
	} else {
		email = jwt.getEmail(data.signUpToken);
		p = await pm.exists({ email: email });
		if (p != null) {
			pData = {
				password: await hash.getHash(data.password),
				token: null,
				resetToken: null,
				securityQuestion: data.securityQuestion,
				securityAnswer: await hash.getHash(data.securityAnswer),
				number: data.number,
				intro: data.intro,
			};
			p = await pm.findOneAndUpdate({ email }, pData);

			mail.sendSignUp(email);
			res.send(
				"professional signed up succesfully, do not forget to complete your profile! - email sent "
			);
		} else {
			let msg = "email not in db  - contact your business consultant";
			err = new Error(msg);
			err.statusCode = 406;
			next(err);
		}
	}
}

async function login(req, res, next) {
	data = req.body;

	if (validator.validate(data.email) && data.password) {
		p = await pm.find({ email: data.email });
		if (p.length != 0 && p[0].password != null) {
			if (await hash.compare(data.password, p[0].password)) {
				token = jwt.getToken({ pID: p[0]._id.toString() }, data.expiredIn);
				await pm.findOneAndUpdate({ email: data.email }, { token: token });
				res.json({
					pID: p[0]._id.toString(),
					token: token,
				});
			} else {
				err = new Error("wrong password");
				err.statusCode = 400;
				next(err);
			}
		} else {
			err = new Error(
				p == []
					? "you could not login: complete password reset!"
					: "professional not found"
			);
			err.statusCode = 404;
			next(err);
		}
	} else {
		err = new Error("wrong or missing params");
		err.statusCode = 400;
		next(err);
	}
}

async function logout(req, res, next) {
	data = req.body;
	try {
		if (jwt.validateToken(req.get("token"))) {
			await pm.findByIdAndUpdate(req.get("pID"), { token: null });
			res.json({ detail: "successfully logged out" });
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function deleteAccount(req, res, next) {
	try {
		const p = await pm.findById(req.get("pID"));
		try {
			await unlinkAsync(p.selfCertified);
		} catch (error) {}
		await pm.findByIdAndRemove(p._id);
		mail.sendRemoved(p.email);
		res.send("account deleted correctly - email sent");
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function resetPassword(req, res, next) {
	data = req.body;
	if (
		!validator.validate(data.email) ||
		!data.securityQuestion ||
		!data.securityAnswer
	) {
		err = new Error("wrong or missing params");
		err.statusCode = 400;
		next(err);
	} else {
		try {
			const p = await pm.find({ email: data.email });
			if (p.length != 0) {
				if (
					p[0].securityQuestion === data.securityQuestion &&
					(await hash.compare(data.securityAnswer, p[0].securityAnswer))
				) {
					resetToken = jwt.getResetPassToken(data.email);
					hashedToken = await hash.getHash(resetToken);
					await pm.findByIdAndUpdate(p[0]._id, {
						resetToken: hashedToken,
						password: null,
					});
					mail.sendResetPassProfessional(data.email, resetToken);
					res.json({
						detail: "password has been reset - email with token sent",
					});
				} else {
					err = new Error("wrong security question and answer");
					err.statusCode = 400;
					next(err);
				}
			} else {
				err = new Error("No professional found!");
				err.statusCode = 406;
				next(err);
			}
		} catch (error) {
			err = new Error(error.message);
			err.statusCode = 406;
			next(err);
		}
	}
}

async function setPassword(req, res, next) {
	data = req.body;
	if (!data.password || !data.resetToken) {
		err = new Error("wrong or missing params");
		err.statusCode = 400;
		next(err);
	} else {
		try {
			const email = jwt.getEmail(data.resetToken);
			const p = await pm.find({ email });
			if (p.length != 0) {
				if (await hash.compare(data.resetToken, p[0].resetToken)) {
					await pm.findByIdAndUpdate(p[0]._id, {
						password: await hash.getHash(data.password),
						resetToken: null,
					});
					mail.sendPassUpdated(email);
					res.json({
						detail: "password has been updated - email with confirm sent",
					});
				} else {
					err = new Error("Wrong reset token");
					err.statusCode = 400;
					next(err);
				}
			} else {
				err = new Error("No professional found!");
				err.statusCode = 406;
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
		err = new Error("wrong or missing params");
		err.statusCode = 400;
		next(err);
	} else {
		try {
			const p = await pm.findOne({ email: data.email });
			if (p) {
				res.json({ securityQuestion: p.securityQuestion });
			} else {
				err = new Error("No professional found!");
				err.statusCode = 406;
				next(err);
			}
		} catch (error) {
			err = new Error(error.message);
			err.statusCode = 406;
			next(err);
		}
	}
}

async function uploadProfilePic(req, res, next) {
	try {
		if (req.file) {
			const p = await pm.findById(req.get("pID"));
            
            const oldProfilePic = p.profilePic;

            if(oldProfilePic){
                let key = "profilePic/" + oldProfilePic.split("profilePic/")[1].replaceAll("%20", " ");
                await bucketService.deleteS3File("chi-sa-fare-bucket", key);
            }

			p.profilePic = req.file.location;

			await p.save();
			res.send("Profile picture uploaded!");
		} else {
			err = new Error("failed to load file");
			err.statusCode = 406;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function uploadAboutUs(req, res, next) {
	try {
		const p = await pm.findById(req.get("pID"));
		const aboutUsGallery = req.files ? req.files.aboutUsGallery : null;
		const specializationGallery = req.files
			? req.files.specializationsGallery
			: null;
		if (aboutUsGallery) {
			const oldGallery = p.aboutUsGallery;
			p.aboutUsGallery = [];
			for (i = 0; i < aboutUsGallery.length; i++) {
				p.aboutUsGallery.push(aboutUsGallery[i].location);
			}
			for (i = 0; i < oldGallery.length; i++) {
				let key =
					"galleries/" +
					oldGallery[i].split("galleries/")[1].replaceAll("%20", " ");
                    console.log(key);
				await bucketService.deleteS3File("chi-sa-fare-bucket", key);
			}
		}
		if (specializationGallery) {
			const oldSpecializations = p.specializationsGallery;
			p.specializationsGallery = [];
			for (i = 0; i < specializationGallery.length; i++) {
				p.specializationsGallery.push(specializationGallery[i].location);
			}
			for (i = 0; i < oldSpecializations.length; i++) {
				let key =
					"galleries/" +
					oldSpecializations[i].split("galleries/")[1].replaceAll("%20", " ");
                    console.log(key);
				await bucketService.deleteS3File("chi-sa-fare-bucket", key);
			}
		}

		if (req.body.aboutUsCopy) {
			p.aboutUsCopy = req.body.aboutUsCopy;
		}
		await p.save();
		res.send("About us uploaded!");
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function updateFields(req, res, next) {
	try {
		let changed = [],
			notChange = [];
		let obj = {};
		let fields = Object.keys(req.body.fields);
		for (i = 0; i < fields.length; i++) {
			if (pFields.includes(fields[i])) {
				if (fields[i] == "email") {
					if (validator.validate(req.body.fields[fields[i]])) {
						let resp = await pm.findOne({ email: req.body.fields[fields[i]] });
						if (resp == null) {
							changed.push(fields[i]);
							obj[fields[i]] = req.body.fields[fields[i]];
						} else {
							notChange.push(fields[i]);
						}
					} else {
						notChange.push(fields[i]);
					}
				} else {
					changed.push(fields[i]);
					obj[fields[i]] = req.body.fields[fields[i]];
				}
			} else {
				notChange.push(fields[i]);
			}
		}
		if (notChange.length == 0) {
			await pm.findByIdAndUpdate(req.get("pID"), obj);
			res.json("Sucessfully updated!");
		} else {
			err = new Error("wrong params or already used email");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function activate(req, res, next) {
	if (
		!req.get("pIva") ||
		req.get("pIva").length != 11 ||
		!/^\d+$/.test(req.get("pIva"))
	) {
		err = new Error("missing param: no pIva or wrong format!");
		err.statusCode = 400;
		next(err);
	} else {
		try {
			p = await pm.findOne({ pIva: req.get("pIva") });
			if (p != null) {
				let exp =
					p.profileStatus.get("exp") != null &&
					dayjs(p.profileStatus.get("exp")).diff(dayjs()) > 0
						? dayjs(p.profileStatus.get("exp")).add(1, "year").format()
						: dayjs().add(1, "year").format();
				m = new Map().set("status", "da saldare").set("exp", exp);
				p.profileStatus = m;
				await p.save();
				res.send("Professional active! exp: " + exp);
			} else {
				err = new Error(
					"no professional found - contact your business consultant!"
				);
				err.statusCode = 404;
				next(err);
			}
		} catch (error) {
			err = new Error(error.message);
			err.statusCode = 406;
			next(err);
		}
	}
}

async function createPost(req, res, next) {
	try {
		data = req.body;
		if (data && data.copy) {
			let imagePath = req.file ? req.file.location : null;
			if (data.sell && typeof data.sell != Boolean) {
				err = new Error("sell param is not a boolean");
				err.statusCode = 400;
				next(err);
			} else {
				postData = {
					image: imagePath,
					video: data.video,
					copy: data.copy,
					shares: 0,
					sell: data.sell || false,
					professionalID: req.get("pID"),
					likes: [],
					comments: [],
					date: dayjs().format(),
				};
				postService
					.addPost(postData)
					.then(async (result) => {
						await professionalService.addPost(
							result._id.toString(),
							req.get("pID")
						);
						res.send(result);
					})
					.catch((err) => next(err));
			}
		} else {
			err = new Error("copy is missing");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllPosts(req, res, next) {
	let data = req.body;
	try {
		postService
			.getAllPosts(data.from, data.num)
			.then((result) => {
				res.json(result);
			})
			.catch((error) => {
				err = new Error(error.message);
				err.statusCode = 406;
				next(err);
			});
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllOwnPosts(req, res, next) {
	let data = req.body;
	try {
		postService
			.getAllPosts(data.from, data.num)
			.then((result) => {
				let r = result.filter(
					(p) => p.professionalID == req.get("professionalFromPost")
				);
				orderedPosts = r.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
				console.log(orderedPosts);
				res.json(orderedPosts);
			})
			.catch((error) => {
				err = new Error(error.message);
				err.statusCode = 406;
				next(err);
			});
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getOnePost(req, res, next) {
	try {
		let data = req.body;
		if (data.postID) {
			res.json(await postService.getOnePost(data.postID));
		} else {
			err = new Error("postID is missing");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function updatePost(req, res, next) {
	let data = req.body;
	try {
		result = await pm.findById(req.get("pID"));
		if (req.get("postID") && result.posts.includes(req.get("postID"))) {
			let post = await postService.getOnePost(req.get("postID"));
			let postData = {};
			let fields = Object.keys(req.body);
			for (let i = 0; i < fields.length; i++) {
				if (postFields.includes(fields[i])) {
					if (fields[i] !== "image") {
						postData[fields[i]] = data[fields[i]];
					}
				}
			}
			if (req.file) {
				if (post.image) {
					let key = "posts/" + post.image.split("posts/")[1].replaceAll("%20", " ");
					await bucketService.deleteS3File("chi-sa-fare-bucket", key);
				}
				postData["image"] = req.file.location;
			}
			const old = await postService.updatePost(req.get("postID"), postData);
			res.send(await postService.getOnePost(req.get("postID")));
		} else {
			err = new Error("no post found");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function removePost(req, res, next) {
	let data = req.body;
	try {
		result = await pm.findById(req.get("pID"));
		if (req.get("postID") && result.posts.includes(req.get("postID"))) {
			let post = await postService.removePost(req.get("postID"));
			result.posts = result.posts.filter((pID) => pID != req.get("postID"));
			await result.save();
			if (post.image) {
				console.log(post.image);
				await unlinkAsync(post.image);
			}
			res.send("post removed correclty");
		} else {
			err = new Error("no post found");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function setFollowedProfessional(req, res, next) {
	try {
		if (req.get("professionalID")) {
			let professionalToAdd = await pm.findById(req.get("professionalID"));
			let professional = await pm.findById(req.get("pID"));
			if (professional && professionalToAdd) {
				if (
					!professional.followedProfessionals.includes(
						req.get("professionalID")
					)
				) {
					professional.followedProfessionals.push(professionalToAdd._id);
					await professional.save();
					professionalToAdd.followingProfessionals.push(req.get("pID"));
					await professionalToAdd.save();
					res.send("followed professional succesfully set");
				} else {
					res.send("already followed!");
				}
			} else {
				err = new Error("no professional found");
				err.statusCode = 400;
				next(err);
			}
		} else {
			err = new Error("no postID param");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function removeFollowedProfessional(req, res, next) {
	try {
		if (req.get("professionalID")) {
			let professionalToAdd = await pm.findById(req.get("professionalID"));
			let professional = await pm.findById(req.get("pID"));
			if (professional && professionalToAdd) {
				if (
					professional.followedProfessionals.includes(
						req.get("professionalID")
					)
				) {
					let index = professional.followedProfessionals.indexOf(req.get("professionalID"));
					if (index > -1) { // only splice array when item is found
						professional.followedProfessionals.splice(index, 1); // 2nd parameter means remove one item only
					}
					await professional.save();

					
					index = professionalToAdd.followingProfessionals.indexOf(req.get("pID"));
					if (index > -1) { // only splice array when item is found
						professionalToAdd.followingProfessionals.splice(index, 1); // 2nd parameter means remove one item only
					}
					await professionalToAdd.save();
					res.send("followed professional succesfully set");
				} else {
					res.send("not followed!");
				}
			} else {
				err = new Error("no professional found");
				err.statusCode = 400;
				next(err);
			}
		} else {
			err = new Error("no param");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getFollowingProfessionals(req, res, next) {
	try {
		let p = await pm.findById(req.get("pID"));
		let result = [];
		for (let i = 0; i < p.followingProfessionals.length; i++) {
			let professional = await professionalService.getProfessional(
				p.followingProfessionals[i]
			);
			let seguo = professional.followingProfessionals.includes(req.get("pID"));
			result.push({
				professional:
					professionalService.getProfessionalPreviewSync(professional),
				seguo,
			});
		}
		res.json(result);
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getFollowedPosts(req, res, next) {
	try {
		const followed = (await pm.findById(req.get("pID"))).followedProfessionals;
		const result = await postService.getFollowedPosts(followed);
		console.log(result);
		res.json(result);
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function addComment(req, res, next) {
	try {
		let data = req.body;
		if (data.text && data.text != "" && req.get("postID")) {
			let post = await postService.getOnePost(req.get("postID"));
			if (post) {
				let commentData = {
					text: data.text,
					lastModifiedDate: dayjs().format(),
					professionalID: req.get("pID"),
				};
				let comment = await postService.addComment(commentData);
				post.comments.push(comment._id);
				await post.save();
				res.json(comment);
			}
		} else {
			err = new Error("no text or postID params");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getComments(req, res, next) {
	try {
		const post = await postService.getOnePost(req.get("postID"));
		if (post) {
			result = [];
			for (let i = 0; i < post.comments.length; i++) {
				result.push(await postService.getComment(post.comments[i]));
			}
			res.json({
				comments: result,
				counter: result.length,
			});
		} else {
			err = new Error("no post found");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function removeComment(req, res, next) {
	try {
		const post = await postService.getOnePost(req.get("postID"));
		if (
			post &&
			req.get("commentID") &&
			post.comments.includes(req.get("commentID"))
		) {
			await postService.removeComment(req.get("commentID"));
			post.comments = post.comments.filter(
				(commentID) => commentID != req.get("commentID")
			);
			await post.save();
			res.send("comment removed succesfully");
		} else {
			err = new Error("no post or comment found!");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function addLike(req, res, next) {
	try {
		console.log(req.get("postID"));
		if (
			req.get("postID") &&
			(await postService.checkIfExists(req.get("postID")))
		) {
			await postService.addLike(req.get("pID"), req.get("postID"));
			res.send("like succesfully added");
		} else {
			err = new Error("no post found!");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getLikes(req, res, next) {
	try {
		if (
			req.get("postID") &&
			(await postService.checkIfExists(req.get("postID")))
		) {
			let result = [];
			let likes = await postService.getLikes(req.get("postID"));
			for (let i = 0; i < likes.length; i++) {
				result.push(await professionalService.getProfessional(likes[i]));
			}
			res.json({
				likes: result,
				counter: result.length,
			});
		} else {
			err = new Error("no post found!");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function removeLike(req, res, next) {
	try {
		if (
			req.get("postID") &&
			(await postService.checkIfExists(req.get("postID")))
		) {
			await postService.removeLike(req.get("pID"), req.get("postID"));
			res.send("like removed correctly");
		} else {
			err = new Error("no post found!");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getProfessional(req, res, next) {
	try {
		let p = await professionalService.getProfessionalInfo(
			req.get("professionalID"),
			true,
			req.get("from"),
			req.get("num")
		);
		if (p) {
			res.json(p);
		} else {
			err = new Error("no professional found!");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getProfessionals(req, res, next) {
	try {
		let query = String(req.get("query"));

		let p = await professionalService.getAllProfessional();
		if (p) {
			let result = [];
			for (let i = 0; i < p.length; i++) {
				if (p[i].ragioneSociale.toLowerCase().includes(query.toLowerCase())) {
					result.push(p[i]);
				}
			}
			res.json(result);
		} else {
			err = new Error("Missing query!");
			err.statusCode = 400;
			next(err);
		}
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
	deleteAccount,
	resetPassword,
	setPassword,
	getSecurityQuestion,
	uploadProfilePic,
	uploadAboutUs,
	updateFields,
	activate,
	createPost,
	getOnePost,
	getAllPosts,
	updatePost,
	removePost,
	setFollowedProfessional,
	getFollowedPosts,
	addComment,
	getComments,
	removeComment,
	addLike,
	getLikes,
	removeLike,
	getProfessional,
	getFollowingProfessionals,
	getAllOwnPosts,
	getProfessionals,
	removeFollowedProfessional
};
