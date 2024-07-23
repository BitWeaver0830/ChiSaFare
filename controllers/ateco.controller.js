const aService = require("../services/ateco.service")

async function getAllAteco(req, res, next) {
	try {
		res.json(await aService.getAllAteco())
	} catch (error) {
		err = new Error(error.message)
		err.statusCode = 406
		next(err)
	}
}

async function getMostPerformant(req, res, next) {
	try {
		res.json(await aService.getMostPerformant())
	} catch (error) {
		err = new Error(error.message)
		err.statusCode = 406
		next(err)
	}
}

module.exports = {
	getAllAteco,
	getMostPerformant,
}
