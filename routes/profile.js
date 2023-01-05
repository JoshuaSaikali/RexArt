// Developped by Joshua Saikali
import express from "express";
import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";
import ArtModel from "../models/ArtModel.js";

let router = express.Router();

// routes for /myprofile
router.get("/", renderProfile);
router.post("/", changeUserType);

// routes for /myprofile/favorites
router.post("/favorites", addLike);
router.delete("/favorites", removeLike);

// routes for /myprofile/reviews
router.post("/reviews", addReview);
router.delete("/reviews", removeReview);

// routes for /myprofile/follow
router.post("/follow", addUserFollowing, addArtistFollowers);
router.delete("/follow", removeUserFollowing, removeArtistFollowers);

// routes for /myprofile/workshop
router.post("/workshop", addWorkshopArtist);
router.get("/workshop", verify, renderWorkshop);
router.put("/workshop", createWorkshop);

// routes for /myprofile/artwork
router.get("/artwork", verify, renderArtwork);
router.post("/artwork", createArtwork);

// routes for /myprofile/notifications
router.post("/notifications", notifyFollowers);
router.get("/notifications", renderNotifications);

async function renderProfile(req, res) {
	// renders the profile page
	let user = await UserModel.findById(req.session.user._id);
	res.render("pages/profile", { user: user });
}

async function removeReview(req, res) {
	// create objectid for artpiece id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artpiece = await ArtModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	// update artwork's review array
	let artArray = [];
	artpiece.reviews.forEach((element) => {
		if (element.reviewId != req.body.reviewId) {
			artArray.push(element);
		}
	});

	// update user's review array
	let docArray = [];
	doc.reviews.forEach((element) => {
		if (element.reviewId != req.body.reviewId || !element.artId.equals(oId)) {
			docArray.push(element);
		}
	});

	// set artwork and user property to new array
	artpiece.reviews = artArray;
	doc.reviews = docArray;

	// save the documents
	await doc.save();
	await artpiece.save();

	res.status(200).send();
}

async function addReview(req, res) {
	// create objectid for artpiece id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artpiece = await ArtModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	// create a review object
	let review = {
		content: req.body.review,
		artId: oId,
		user: req.session.user.username,
		reviewId: artpiece.reviews.length,
	};

	// add the review to the artwork and users reviews
	artpiece.reviews.push(review);
	doc.reviews.push(review);

	//save the documents
	await doc.save();
	await artpiece.save();

	res.status(201).send();
}

async function addLike(req, res) {
	// create objectid for artpiece id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let flag = false;
	let artpiece = await ArtModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	// check if user already liked this artwork
	let array = doc.liked;
	array.forEach((element) => {
		if (element._id.equals(artpiece._id)) {
			flag = true;
		}
	});

	// if user has not liked this artwork
	// then add the artwork to the users liked property
	// and increase the artwork's rating by 1
	if (!flag) {
		array.push(artpiece);
		doc.liked = array;
		artpiece.rating += 1;
	}

	// save the documents
	await doc.save();
	await artpiece.save();

	res.status(201).send();
}

async function renderNotifications(req, res) {
	// renders the notifications page
	let user = await UserModel.findOne({ _id: req.session.user._id });
	res.render("pages/notifications", { user: user });
}

async function notifyFollowers(req, res) {
	// find user
	let user = await UserModel.findOne({ _id: req.session.user._id });

	// create notification object
	let notification = {
		artist: user.username,
		content: req.body.content,
	};

	// for each of the followers of the user
	// add the notification to their notifications property
	// save the document
	user.followers.forEach(async (element) => {
		let follow = await UserModel.findOne({ _id: element._id });
		follow.notifications.push(notification);
		await follow.save();
	});

	res.status(201).send();
}

async function createArtwork(req, res) {
	// find user
	let user = await UserModel.findOne({ _id: req.session.user._id });

	let flag = false;

	// create artwork object
	let artwork = {
		name: req.body.name,
		artist: user.username,
		year: req.body.year,
		category: req.body.category,
		rating: 0,
		description: req.body.description,
		image: req.body.image,
		reviews: [],
	};

	// check if artwork has a duplicate name
	user.artwork.forEach((element) => {
		if (element.name === req.body.name) {
			flag = true;
		}
	});

	let newArt;
	// if name is not duplicate, then create new ArtModel with artwork object
	// save the document
	// add the artwork to the users artwork property
	if (!flag) {
		newArt = new ArtModel(artwork);
		await newArt.save();
		user.artwork.push(newArt);
	}

	//save the document
	await user.save();
	res.status(201).send({ flag: flag });
}

async function renderArtwork(req, res) {
	// render create artwork page 
	res.render("pages/createArtwork");
}

async function createWorkshop(req, res) {
	// find user
	let user = await UserModel.findOne({ _id: req.session.user._id });

	let flag = false;
	
	// check if workshop has duplicate name
	user.workshops.forEach((element) => {
		if (element.name === req.body.name) {
			flag = true;
		}
	});

	// if name is not duplicate, then add workshop
	// to user's workshop property
	if (!flag) {
		user.workshops.push(req.body);
	}

	// save the document
	await user.save();
	res.status(200).send({ flag: flag });
}

async function renderWorkshop(req, res) {
	// render the create workshop page
	res.render("pages/createWorkshop");
}

async function addUserFollowing(req, res, next) {
	// create objectid for artist id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artist = await UserModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	let userFollowing = doc.following;
	let flagUser = false;

	// check if user does not already follow this artist
	userFollowing.forEach((element) => {
		if (element._id.equals(artist._id)) {
			flagUser = true;
		}
	});

	// if user does not follow this artist
	// add artist to user's following
	if (!flagUser) {
		userFollowing.push(artist);
		doc.following = userFollowing;
	}

	// save the document
	await doc.save();
	next();
}

async function addArtistFollowers(req, res) {
	// create objectid for artist id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artist = await UserModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	let artistFollowers = artist.followers;
	let flagArtist = false;

	// check if user is a follower of the artist
	artistFollowers.forEach((element) => {
		if (element._id.equals(doc._id)) {
			flagArtist = true;
		}
	});

	// if user is not a follower
	// update the artists followers
	if (!flagArtist) {
		artistFollowers.push(doc);
		artist.followers = artistFollowers;
	}

	// save the document
	await artist.save();

	res.status(201).send();
}

async function removeArtistFollowers(req, res) {
	// create objectid for artist id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artist = await UserModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	let artistFollowers = artist.followers;
	let array = [];

	// add all of the followers except the user's
	artistFollowers.forEach((element) => {
		if (!element._id.equals(doc._id)) {
			array.push(element);
		}
	});

	// update artist followers
	artist.followers = array;

	// save the document
	await artist.save();

	res.status(200).send();
}

async function removeUserFollowing(req, res, next) {
	// create objectid for artist id
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artist = await UserModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	let userFollowing = doc.following;
	let array = [];
	
	// add all artist except for the artist that is being unfollowed
	userFollowing.forEach((element) => {
		if (!element._id.equals(artist._id)) {
			array.push(element);
		}
	});

	// update following
	doc.following = array;

	// save the document
	await doc.save();

	next();
}

async function addWorkshopArtist(req, res) {
	// create objectid for artist and user
	let oId;
	let userId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
		userId = mongoose.Types.ObjectId(req.session.user._id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let artist = await UserModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });

	let workshop;
	let newUsers;

	// find requested workshop
	artist.workshops.forEach((element) => {
		if (req.body.name === element.name) {
			workshop = element;
			newUsers = element.users;
			return;
		}
	});

	let flag = false;

	// if workshop is not found, status 404
	if (!workshop) {
		res.status(404).send("Unknown workshop.");
	} else {
		// check if user is already enrolled
		newUsers.forEach((x) => {
			if (x._id.equals(userId)) {
				flag = true;
			}
		});

		// if user is not enrolled
		// then add user to the workshop's enrolled users
		if (!flag) {
			newUsers.push(doc);
		}

		workshop.users = newUsers;
	}


	// save the document
	await artist.markModified("workshops");
	await artist.save();

	res.status(201).json({ message: flag });
}

async function changeUserType(req, res) {
	// find user and update the account type
	let user = await UserModel.findOne({ _id: req.session.user._id });
	user.artist = !user.artist;
	await user.save();
	res.status(201).send();
}

async function removeLike(req, res) {
	// create objectid for artpieceid
	let oId;
	try {
		oId = mongoose.Types.ObjectId(req.body.id);
	} catch {
		res.status(404).send("Unknown ID");
	}

	let flag = false;
	let artpiece = await ArtModel.findOne({ _id: oId });
	let doc = await UserModel.findOne({ _id: req.session.user._id });


	let array = [];
	// add all liked artworks except for the requested artpiece
	doc.liked.forEach((element) => {
		if (!element._id.equals(artpiece._id)) {
			array.push(element);
			flag = true;
		}
	});

	// if user has no liked artworks, or a new array has been created
	// update the user's like artworks and adjust artwork rating
	if (flag || array.length == 0) {
		doc.liked = array;
		if (artpiece.rating > 0) {
			artpiece.rating -= 1;
		}
	}

	// save the documents
	await doc.save();
	await artpiece.save();

	res.status(201).send();
}

async function verify(req, res, next) {
	let user = await UserModel.findOne({ _id: req.session.user._id });

	if (!user.artist) {
		res.render("pages/error", { code: 401, error: "Do not have permission" });
		res.status(401);
		return;
	}
	next();
}

export default router;
