const dayjs = require("dayjs");
const pService = require("../services/professional.service");
const statusList = ["non attivo", "da saldare", "saldato"];
const bcService = require("../services/businessConsultant.service");
const AWS = require("aws-sdk");
const writeFileSync = require("fs").writeFileSync;
csv = require("csv-stringify");
const usr = require("../utils/MongoDB/models").userModel;
const streamToPromise = require('stream-to-promise');
const env = require("dotenv");
env.config();

async function getAllProfessionals(req, res, next) {
	try {
		let p = await pService.getAllProfessional();
		let result = [];
		if (req.get("status") && statusList.includes(req.get("status"))) {
			for (let i = 0; i < p.length; i++) {
				if (p[i].profileStatus.get("status") === req.get("status")) {
					let prof = pService.getProfessionalAsync(p[i]);
					prof.profileStatus = Object.fromEntries(prof.profileStatus);
					result.push(prof);
				}
			}
		} else {
			for (let i = 0; i < p.length; i++) {
				let prof = pService.getProfessionalAsync(p[i]);
				prof.profileStatus = Object.fromEntries(prof.profileStatus);
				result.push(prof);
			}
		}
		res.json(result);
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getProfessionalsPerDate(req, res, next) {
	try {
		if (req.get("from") && req.get("to")) {
			let from = dayjs(req.get("from"));
			let to = dayjs(req.get("to"));
			if (from.format() == "Invalid Date" || to.format() == "Invalid Date") {
				err = new Error("Invalid Date");
				err.statusCode = 400;
				next(err);
			} else {
				let result = new Map();
				let days = [];
				let p = await pService.getAllProfessional();
				let diff = to.diff(from, "days");
				for (let i = 0; i <= diff; i++) {
					result.set(from.add(i, "day").format("YYYY-MM-DD"), 0);
					days.push(from.add(i, "day").format("YYYY-MM-DD"));
				}
				for (let i = 0; i < p.length; i++) {
					let data = dayjs(p[i].signUpDate).format("YYYY-MM-DD");
					if (days.includes(data)) {
						result.set(data, result.get(data) + 1);
					}
				}
				res.send(
					Array.from(result, (k, v) => {
						return {
							date: k[0],
							count: k[1],
						};
					})
				);
			}
		} else {
			err = new Error("wrong params");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllIncomeInInterval(req, res, next) {
	try {
		if (req.get("from") && req.get("to")) {
			let from = dayjs(req.get("from"));
			let to = dayjs(req.get("to"));
			if (from.format() == "Invalid Date" || to.format() == "Invalid Date") {
				err = new Error("Invalid Date");
				err.statusCode = 400;
				next(err);
			} else {
				let count = 0;
				let days = [];
				let p = await pService.getAllProfessional();
				let diff = to.diff(from, "days");
				for (let i = 0; i <= diff; i++) {
					days.push(from.add(i, "day").format("YYYY-MM-DD"));
				}
				for (let i = 0; i < p.length; i++) {
					let data = dayjs(p[i].signUpDate).format("YYYY-MM-DD");
					if (days.includes(data)) {
						count++;
					}
				}
				res.send({
					from: from.format(),
					to: to.format(),
					amount: count * process.env.SUBSCRIPTION_price,
				});
			}
		} else {
			err = new Error("wrong params");
			err.statusCode = 400;
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAnnualIncome(req, res, next) {
	try {
		let from = dayjs().startOf("year");
		let to = dayjs();
		if (from.format() == "Invalid Date" || to.format() == "Invalid Date") {
			err = new Error("Invalid Date");
			err.statusCode = 400;
			next(err);
		} else {
			let count = 0;
			let days = [];
			let p = await pService.getAllProfessional();
			let diff = to.diff(from, "days");
			for (let i = 0; i <= diff; i++) {
				days.push(from.add(i, "day").format("YYYY-MM-DD"));
			}
			for (let i = 0; i < p.length; i++) {
				let data = dayjs(p[i].signUpDate).format("YYYY-MM-DD");
				if (days.includes(data)) {
					count++;
				}
			}
			res.send({
				from: from.format(),
				to: to.format(),
				amount: count * process.env.SUBSCRIPTION_price,
			});
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAmountToPay(req, res, next) {
	try {
		let p = await pService.getAllActiveProfessionals();
		res.json({
			amount: p.length * process.env.BC_price,
		});
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllBusinessConsultants(req, res, next) {
	try {
		let bc = await bcService.getAll();
		if (req.get("from") && req.get("to")) {
			let from = dayjs(req.get("from"));
			let to = dayjs(req.get("to"));
			if (from.format() == "Invalid Date" || to.format() == "Invalid Date") {
				err = new Error("Invalid Date");
				err.statusCode = 400;
				next(err);
			} else {
				let count = 0;
				let days = [];
				let diff = to.diff(from, "days");
				for (let i = 0; i <= diff; i++) {
					days.push(from.add(i, "day").format("YYYY-MM-DD"));
				}
				for (let i = 0; i < bc.length; i++) {
					let data = dayjs(bc[i].signUpDate).format("YYYY-MM-DD");
					if (days.includes(data)) {
						count++;
					}
				}
				res.send({
					from: from.format(),
					to: to.format(),
					count,
				});
			}
		} else {
			res.json({
				count: bc.length,
			});
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllBusinessConsultantsDetailed(req, res, next) {
	try {
		let bc = await bcService.getAll();
		res.send({ bc });
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function getAllUsersDetailed(req, res, next) {
	try {
		let users = await usr.find();
		res.send({ users });
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

AWS.config.update({ region: "eu-central-1" });

const s3 = new AWS.S3({
	accessKeyId: process.env.ACCESSKEYID,
	secretAccessKey: process.env.SECRETACCESSKEY,
	ACL: "public-read",
});

async function getAndGenerateReport(req, res, next) {
	try {
		if (req.get("from") && req.get("to")) {
			let from = dayjs(req.get("from"));
			let to = dayjs(req.get("to"));
			if (from.format() == "Invalid Date" || to.format() == "Invalid Date") {
				err = new Error("Invalid Date");
				err.statusCode = 400;
				next(err);
			} else {
				let days = [];
				let result = new Map();
				let diff = to.diff(from, "days");
				for (let i = 0; i <= diff; i++) {
					days.push(from.add(i, "day").format("YYYY-MM-DD"));
				}
				let prof = (await pService.getAllActiveProfessionals())
					.filter((p) =>
						days.includes(dayjs(p.signUpDate).format("YYYY-MM-DD"))
					)
					.map((p) => p._id);
				let bc = await bcService.getAll();
				for (let i = 0; i < bc.length; i++) {
					result.set(bc[i]._id, {
						name: bc[i].name,
						lastname: bc[i].lastname,
						iban: bc[i].iban,
						count: 0,
						totalToBePayed: 0,
					});
				}
				for (let i = 0; i < bc.length; i++) {
					let professionals = bc[i].professionals;
					for (let j = 0; j < prof.length; j++) {
						if (professionals.includes(prof[j])) {
							await pService.setSaldato(prof[j]);
							let old = result.get(bc[i]._id);
							old.count = old.count + 1;
							old.totalToBePayed = old.count * process.env.BC_price;
							result.set(bc[i]._id, old);
						}
					}
				}
				let resArray = Array.from(result, (k, v) => {
					return {
						businessConsultantID: k[0],
						bc: k[1],
					};
				}).filter((r) => r.bc.count > 0);

				//creating csv
				let data = resArray.map((r) => {
					return {
						nome: r.bc.name,
						cognome: r.bc.lastname,
						iban: r.bc.iban,
						importo: r.bc.totalToBePayed,
					};
				});

				const csvContent = csv.stringify(data, {
					header: true,
					columns: {
						nome: "NOME",
						cognome: "CONGOME",
						iban: "IBAN",
						importo: "IMPORTO",
					},
				});

                const csvString = await streamToPromise(csvContent);

				// Genera un nome di file univoco per il report CSV
				const filename = `reports/${Date.now().toString()}-report_${from.format(
					"YYYY-MM-DD"
				)}_${to.format("YYYY-MM-DD")}.csv`;

				// Specifica il percorso del bucket S3 in cui salvare il file
				const bucketName = "chi-sa-fare-bucket";

				// Imposta le opzioni per l'upload del file
				const params = {
					Bucket: bucketName,
					Key: filename,
					Body: csvString,
					ContentType: "text/csv", // Imposta il tipo di contenuto come CSV
				};

				// Carica il file su S3
				await s3.putObject(params).promise();

				// Restituisci l'URL pubblico del file caricato su S3
				const fileUrl = `https://${bucketName}.s3.amazonaws.com/${filename}`;

				// Restituisci l'URL del file e altre informazioni necessarie
				res.send({
					csvContent: resArray,
					path: fileUrl,
				});
			}
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

module.exports = {
	getAllProfessionals,
	getProfessionalsPerDate,
	getAllIncomeInInterval,
	getAnnualIncome,
	getAmountToPay,
	getAllBusinessConsultants,
	getAllBusinessConsultantsDetailed,
	getAllUsersDetailed,
	getAndGenerateReport,
};
