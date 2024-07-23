const jwt = require("../utils/jwt/jwt");
const models = require("../utils/MongoDB/models");
const hash = require("../utils/hash/hash");
const validator = require("email-validator");

const am = models.adminModel;
const pm = models.professionalModel;

async function AuthGuard(req, res, next) {
	if (
		(req.get("bcID") || req.get("userID") || req.get("pID")) &&
		req.get("token")
	) {
		let model = req.get("bcID")
			? models.businessConsultantModel
			: req.get("userID")
			? models.userModel
			: models.professionalModel;
		let id = req.get("bcID") ? "bcID" : req.get("userID") ? "userID" : "pID";
		try {
			if (jwt.validateToken(req.get("token"))) {
				bc = await model.findById(req.get(id));
				if (bc) {
					next();
				} else {
					err = new Error("Auth guard not passed");
					next(err);
				}
			}
		} catch (error) {
			err = new Error(error.message);
			err.statusCode = 406;
			next(err);
		}
	} else {
		err = new Error("Auth guard not passed");
		next(err);
	}
}
/*
async function chat(req,res,next){
    let model;
    let id;
    if(req.get('userID') && req.get('userID') == req.get('uID')){
        model = models.userModel;
        id = req.get('userID');
    }else if(req.get('professionalID') && req.get('professionalID') == req.get('pID')){
        console.log('professional')
        model = models.professionalModel;
        id = req.get('professionalID');
    }else{
        err = new Error('Auth guard not passed');
        next(err);
    }
    try {
        if(jwt.validateToken(req.get('token'))){
            let found = await model.findById(id);
            if( found ){
                next();
            }else{
                err = new Error('Auth guard not passed');
                next(err);
            }
        }
    } catch (error) {
        err = new Error(error.message);
        err.statusCode=406;
        next(err)
    }
}
*/

async function chat(req, res, next) {
	let model;
	let id;

	if (req.get("userID") && req.get("userID") == req.get("uID")) {
		model = models.userModel;
		id = req.get("userID");
	} else if (
		req.get("professionalID") &&
		req.get("professionalID") == req.get("pID")
	) {
		model = models.professionalModel;
		id = req.get("professionalID");
	} else {
		const err = new Error("Auth guard not passed");
		err.statusCode = 401;
		return next(err);
	}

	try {
		if (jwt.validateToken(req.get("token"))) {
			let found = await model.findById(id);
			if (found) {
				next();
			} else {
				const err = new Error("Auth guard not passed");
				err.statusCode = 401;
				return next(err);
			}
		}
	} catch (error) {
		const err = new Error(error.message);
		err.statusCode = 406;
		return next(err);
	}
}

async function ownerLogin(req, res, next) {
	email = req.get("email");
	password = req.get("password");
	loginToken = req.get("loginToken");
	if (validator.validate(email) && password && loginToken) {
		a = await am.findOne({ email, loginToken });
		if (a && a.level === 0 && (await hash.compare(password, a.password))) {
			next();
		} else {
			err = new Error("Auth guard not passed");
			next(err);
		}
	} else {
		err = new Error("Auth guard not passed");
		next(err);
	}
}

async function owner(req, res, next) {
	aID = req.get("aID");
	token = req.get("token");
	if (aID && jwt.validateToken(token)) {
		try {
			a = await am.findOne({ _id: aID, level: 0 });
			if (a) {
				next();
			} else {
				err = new Error("owner::level: Auth guard not passed");
				next(err);
			}
		} catch (error) {
			err = new Error(error.message);
			err.statusCode = 406;
			next(err);
		}
	} else {
		err = new Error("owner::aID: Auth guard not passed");
		next(err);
	}
}

async function staffLogin(req, res, next) {
	try {
		email = req.get("email");
		password = req.get("password");
		if (validator.validate(email)) {
			const am = await models.adminModel.findOne({ email });
			if (am && (await hash.compare(password, am.password))) {
				next();
			} else {
				err = new Error("Auth guard not passed");
				next(err);
			}
		} else {
			err = new Error("Auth guard not passed");
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function staff(req, res, next) {
	aID = req.get("aID");
	token = req.get("token");
	try {
		if (aID && jwt.validateToken(token)) {
			a = await am.findOne({ _id: aID });
			if (a && a.level <= 1) {
				next();
			} else {
				err = new Error("Auth guard not passed");
				next(err);
			}
		} else {
			err = new Error("Auth guard not passed");
			next(err);
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

async function professional(req, res, next) {
	pId = req.get("pID");
	token = req.get("token");
	try {
		if (pId && jwt.validateToken(token)) {
			result = await pm.findOne({ _id: pId });
			if (result) next();
			else next(new Error("Auth guard not passed"));
		} else {
			next(new Error("Auth guard not passed"));
		}
	} catch (error) {
		err = new Error(error.message);
		err.statusCode = 406;
		next(err);
	}
}

module.exports = {
	AuthGuard,
	owner,
	ownerLogin,
	staffLogin,
	staff,
	professional,
	chat,
};
