// Developped by Joshua Saikali
import express from "express";
import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";

let router = express.Router();

// routes for /users/{username} and /users/{username}/{workshopName}
router.get("/:username", renderArtist);
router.get("/:username/:workshopName", renderWorkshop);

async function renderArtist(req, res) {
	let artistName = req.params.username;
	let artist = await UserModel.findOne({ username: artistName });

	// if artist is not found render error page
	if (artist == null) {
		res.status(404);
		res.render("pages/error", { code: 404, error: "Artist not found.." });
		return;
	}

	// render artist profile
	res.render("pages/artist", {
		artist: artist,
		userId: req.session.user.username,
	});
}

async function renderWorkshop(req, res) {
	let artistName = req.params.username;
	let workshopName = req.params.workshopName;
	let artist = await UserModel.findOne({ username: artistName });

	// if artist is not found render error page
	if (artist == null) {
		res.status(404);
		res.render("pages/error", { code: 404, error: "Artist not found.." });
		return;
	}

	let workshop;
	// find requested workshop
	artist.workshops.forEach((element) => {
		if (element.name === workshopName) {
			workshop = element;
			return;
		}
	});

	// if workshop not found render error page
	// else render workshop page
	if (!workshop) {
		res.status(404);
		res.render("pages/error", { code: 404, error: "Workshop not found" });
	} else {
		res.status(200);
		res.render("pages/workshop", { workshop: workshop, artist: artist });
	}
}

export default router;
