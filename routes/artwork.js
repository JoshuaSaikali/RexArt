// Developped by Joshua Saikali
import express from "express";
import mongoose from "mongoose";
import ArtModel from "../models/ArtModel.js";
import UserModel from "../models/UserModel.js";

let router = express.Router();

// routes for query and specific artwork
router.get("/?", artworkQuery);
router.get("/:artID", renderArtPost);

function renderArtPost(req, res, next) {
	let oID;
	// create object ID if it causes an error than it redirects to error page 
	try {
		oID = mongoose.Types.ObjectId(req.params.artID);
	} catch {
		res.status(404);
		res.render("pages/error", { code: 404, error: "Artwork ID not found.." });
		return;
	}

	// find artwork with specified id
	ArtModel.findOne({ _id: oID }, async function (err, result) {
		if (err) {
			console.log(err);
			res.status(500);
		} else {
			// if artwork is not found, render error page 
			if (!result) {
				res.render("pages/error", {
					code: 404,
					error: "The artwork you are trying to find does not exist!",
				});
			} else {
				// if artwork is found then render the artwork's page
				let user = await UserModel.findOne({ _id: req.session.user._id });
				res.render("pages/artPost", { artwork: result, user: user });
			}
		}
	});
}

async function artworkQuery(req, res, next) {
	let query = {};
	let params = [];

	// create query string for pug file 
	for (let prop in req.query) {
		if (prop != "page") {
			params.push(prop + "=" + req.query[prop]);
		}
	}

	let qstring = params.join("&");
	let limit = 10;
	let page = 1;

	//Parse limit parameter
	try {
		if (!req.query.limit) {
			limit = 10;
		} else {
			limit = Number(req.query.limit);
		}
		if (limit > 10) {
			limit = 10;
		}
	} catch {
		limit = 10;
	}

	//Parse page parameter
	try {
		if (!req.query.page) {
			page = 1;
		} else {
			page = Number(req.query.page);
		}

		if (page < 1) {
			page = 1;
		}
	} catch {
		page = 1;
	}

	let regexN = new RegExp(req.query.name, "i");
	let regexA = new RegExp(req.query.username, "i");
	let regexC = new RegExp(req.query.category, "i");

	// add required query parameters
	if (req.query.username) {
		query["artist"] = { $regex: regexA };
	}
	if (req.query.name) {
		query["name"] = { $regex: regexN };
	}
	if (req.query.category) {
		query["category"] = { $regex: regexC };
	}
	if (req.query.year) {
		query["year"] = req.query.year;
	}

	// create options for query
	let startIndex = (page - 1) * Number(limit);
	let amount = limit;
	let options = { skip: startIndex, limit: amount };

	// find all artworks with specified query
	let results = await ArtModel.find(query, {}, options);
	if (!results) {
		res.status(401).send("Error with query");
	} else {
		// send requested information back to client
		res.format({
			"application/json": () => {
				res.status(200).json(results);
			},
			"text/html": () => {
				res.render("pages/artQuery", {
					artworks: results,
					qstring: qstring,
					current: page,
				});
			},
		});
	}
}

export default router;
