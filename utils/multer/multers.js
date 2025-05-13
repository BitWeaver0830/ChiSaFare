const multer = require('multer');
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

// Generalized multer configuration function
const createMulterConfig = (config = {}) => {
	const defaultConfig = {
		storage: multerS3({
			s3: s3,
			acl: "public-read",
			bucket: "chi-sa-fare-bucket",
			metadata: (req, file, cb) => {
				cb(null, { fieldName: file.fieldname });
			},
			key: (req, file, cb) => {
				const folder = config.folder || 'uploads';
				cb(null, `${folder}/${Date.now().toString()}-${file.originalname}`);
			},
		}),
		limits: {
			fileSize: 200 * 1024 * 1024 // 200MB
		},
		fileFilter: function (req, file, callback) {
			const fileTypes = config.fileTypes || /jpeg|jpg|png|gif|svg/;
			const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
			if (extName) {
				return callback(null, true);
			} else {
				return callback(new Error(config.errorMessage || 'Only images are allowed!'));
			}
		}
	};

	return multer({
		...defaultConfig,
		...config // Override defaults with specific config
	});
};

// Specific configurations using the generalized function
const uploadProfilePic = createMulterConfig({
	folder: 'profilePic',
	fileTypes: /jpeg|jpg|png|gif|svg/, // Optional, uses default if not provided
	errorMessage: 'Only images are allowed for profile pictures!'
});

const uploadFile = createMulterConfig({
	folder: 'autocertificazioni',
	fileTypes: /pdf|doc|docx/,
	errorMessage: 'Only pdf and doc are allowed!'
});

const uploadGallery = createMulterConfig({
	folder: 'galleries',
	fileTypes: /jpeg|jpg|png|gif|svg/,
	errorMessage: 'Only images are allowed!'
});

const uploadPost = createMulterConfig({
	folder: 'posts',
	fileTypes: /jpeg|jpg|png|gif|svg/,
	errorMessage: 'Only images are allowed!'
});

module.exports = {
	uploadFile,
	uploadProfilePic,
	uploadGallery,
	uploadPost,
};