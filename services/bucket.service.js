const path = require('path');
const multer = require("multer");
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

const deleteS3File = async (bucket, key) => {
	try {
		await s3
			.deleteObject(
				{
					Bucket: bucket,
					Key: key,
				},
			).promise();
	} catch (error) {
		console.log(error);
		throw error;
	}
};


module.exports = {deleteS3File};