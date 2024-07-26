const fs = require("fs")
const { parse } = require("csv-parse")
const logger = require("../utils/winston/winston")
const { dirname } = require("path")
const { log } = require("console")
const atecoModel = require("../utils/MongoDB/models").atecoModel
const macroAtecoModel = require("../utils/MongoDB/models").macroAtecoModel
const { path } = require("path")

let macroAteco = [],
	ateco = []

async function getAtecoCSV() {
	fs.createReadStream("/app/public/ateco/AtecoMacroCategorie.csv")
		.pipe(parse({ delimieter: ",", from_line: 1 }))
		.on("data", (r) => {
			macroAteco.push({
				code: r[0],
				detail: r[1].split(" - ")[1].toUpperCase(),
				count: 0,
			})
		})
		.on("error", (err) => console.log(err.message))
		.on("end", () => {
			fs.createReadStream("/app/public/ateco/AtecoCompleto.csv")
				.pipe(parse({ delimieter: ",", from_line: 2 }))
				.on("data", (r) => {
					ateco.push({
						code: r[0],
						detail: r[1].split(" - ")[1].toUpperCase(),
					})
				})
				.on("error", (err) => console.log(err.message))
				.on("end", async function () {
					logger.info("codici Ateco letti correttamente da csv")
					for (let i = 0; i < macroAteco.length; i++) {
						let already = await macroAtecoModel.findOne({
							code: macroAteco[i].code,
						})
						if (!already) {
							ma = new macroAtecoModel(macroAteco[i])
							await ma.save()
						}
					}
					for (let j = 0; j < ateco.length; j++) {
						let already = await atecoModel.findOne({ code: ateco[j].code })
						if (!already) {
							a = new atecoModel(ateco[j])
							await a.save()
						}
					}
					logger.info("codici ateco caricati correttamente sul db")
				})
		})
}

async function uploadAteco() {
	for (let i = 0; i < macroAteco.length; i++) {
		console.log(macroAteco[i])
		let already = await macroAtecoModel.findOne({ code: macroAteco[i] })
		if (!already) {
			ma = new macroAtecoModel(macroAteco[i])
			await ma.save()
		}
	}
	for (let j = 0; j < ateco.length; j++) {
		let already = await atecoModel.findOne({ code: ateco[j] })
		if (!already) {
			a = new atecoModel(ateco[j])
			await a.save()
		}
	}
	logger.info("codici ateco caricati correttamente sul db")
}

async function checkAteco(code) {
	let atecoDescription = code.split(" - ")[1].toString().toUpperCase()
	let atecoCode = code.split(" - ")[0]
	let result = await atecoModel.findOne({
		code: atecoCode,
		detail: atecoDescription,
	})
	if (result) return true
	return false
}

async function addToMacroAteco(atecoCode, pID) {
	let macroAteco = atecoCode.split(" - ")[0].split(".")[0]
	let result = await macroAtecoModel.findOne({ code: macroAteco })
	if (result) {
		result.professionals.push(pID.toString())
		await result.save()
	}
}

async function getAllAteco() {
	let result = await atecoModel.find().sort({detail: 1})
	return result.map((ateco) => ateco.code + " - " + ateco.detail)
}

async function getMostPerformant() {
	let result = await macroAtecoModel.find()
	result = result
		.map((r) => {
			return {
				code: r.code,
				detail: r.detail,
				professionals: r.professionals.length,
			}
		})
		.sort((a, b) => {
			return b.professionals - a.professionals
		})
		.slice(0, 4)
		.filter((r) => r.professionals > 0)
	return result
}

module.exports = {
	checkAteco,
	getAtecoCSV,
	addToMacroAteco,
	getAllAteco,
	getMostPerformant,
	uploadAteco,
}
