const multer  = require('multer');
const logger = require('../winston/winston');
const path = require('path');
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

const env = require("dotenv");
env.config();

AWS.config.update({ region: "eu-central-1" });

const s3 = new AWS.S3({
	accessKeyId: process.env.ACCESSKEYID,
	secretAccessKey: process.env.SECRETACCESSKEY,
	ACL: "public-read",
});


// Adding profile picture
const uploadProfilePic = multer({
	storage: multerS3({
		s3: s3,
		acl: "public-read",
		bucket: "chi-sa-fare-bucket",
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, `profilePic/${Date.now().toString()}-${file.originalname}`);
		},
	}),
	limits:{
		fileSize: 200 * 1024 * 1024
	},
	fileFilter: function (req, file, callback){
		const fileTypes = /jpeg|jpg|png|gif|svg/;
		const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
		if(extName){
			return callback(null, true);
		}else return callback(new Error('Only images are allowed!'))
	},
});



const uploadFile = multer({
	storage: multerS3({
		s3: s3,
		acl: "public-read",
		bucket: "chi-sa-fare-bucket",
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, `autocertificazioni/${Date.now().toString()}-${file.originalname}`);
		},
	}),
	limits:{
		fileSize: 200 * 1024 * 1024
	},
	fileFilter: function (req, file, callback){
		const fileTypes = /pdf|doc|docx/;
		const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
		if(extName){
			return callback(null, true);
		}else return callback(new Error('Only pdf and doc are allowed!'))
	},
});

const uploadGallery = multer({
	storage: multerS3({
		s3: s3,
		acl: "public-read",
		bucket: "chi-sa-fare-bucket",
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, `galleries/${Date.now().toString()}-${file.originalname}`);
		},
	}),
	limits:{
		fileSize: 200 * 1024 * 1024
	},
	fileFilter: function (req, file, callback){
		const fileTypes = /jpeg|jpg|png|gif|svg/;
		const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
		if(extName){
			return callback(null, true);
		}else return callback(new Error('Only images are allowed!'))
	},
});

const uploadPost = multer({
	storage: multerS3({
		s3: s3,
		acl: "public-read",
		bucket: "chi-sa-fare-bucket",
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, `posts/${Date.now().toString()}-${file.originalname}`);
		},
	}),
	limits:{
		fileSize: 200 * 1024 * 1024
	},
	fileFilter: function (req, file, callback){
		const fileTypes = /jpeg|jpg|png|gif|svg/;
		const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
		if(extName){
			return callback(null, true);
		}else return callback(new Error('Only images are allowed!'))
	},
});

module.exports = {
    uploadFile,
    uploadProfilePic,
    uploadGallery,
    uploadPost
}