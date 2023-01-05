// Developped by Joshua Saikali
import express from "express";
import UserModel from "../models/UserModel.js";

let router = express.Router();

// routes for /register
router.get("/register", renderRegister);
router.post("/register", userRegistration);

// routes for /login and logout
router.post("/login", login);
router.get("/logout", logout);

function logout(req, res) {
	// if user is logged in then redirect to home page
	if (req.session.loggedin) {
		req.session.loggedin = false;
		req.session.user = undefined;
		res.redirect("http://localhost:3000/");
		res.status(200);
	} else {
		// if user is not logged in then render error page
		// which tells the user the error
		res.render("pages/error", {
			code: 401,
			error: "You cannot log out because you aren't logged in.",
		});
		res.status(401);
	}
}

async function login(req, res) {
	// if user is logged in then show error page
	// display error and redirects user to home page
	if (req.session.loggedin) {
		res.render("pages/error", {
			code: 401,
			error: "Already logged in.",
		});
		res.status(401).send("Already logged in.");
		return;
	}

	// if user is not logged in then verify information
	let username = req.body.username;
	const searchResult = await UserModel.findOne({ username: username });

	//does the user exist?
	if (searchResult == null) {
		res.status(404).send("User Not Found");
		return;
	}

	//the user exists. Lets authenticate them
	if (searchResult.password === req.body.password) {
		req.session.loggedin = true; // now that particular user session has loggedin value, and it is set to true
		//We set the username associated with this session
		//On future requests, we KNOW who the user is
		//We can look up their information specifically
		//We can authorize based on who they are
		req.session.user = searchResult;
		res.status(201).send("Logged in");
	} else {
		res.status(401).send("Not authorized. Invalid password.");
	}
}

function renderRegister(req, res) {
	// if user is not logged in then render registration page
	// if not redirect them to home page
	if (!req.session.loggedin) {
		res.render("pages/register");
		res.status(200);
	} else {
		res.redirect("/home");
		res.status(200);
	}
}

async function userRegistration(req, res) {
	// check for username
	let newUser = req.body;
	try {
		// find user with the username
		const searchResult = await UserModel.findOne({
			username: newUser.username,
		});
		// if user is not found, then you can create the account
		if (searchResult == null) {

			// create new UserModel with the new user
			await UserModel.create(newUser);
			
			// update the session properties
			req.session.user = await UserModel.findOne({
				username: newUser.username,
			});
			req.session.loggedin = true;
			req.session.artist = false;

			res.status(201).send();
		} else {
			res.status(404).json({ error: "Exists" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Error registering" });
	}
}

export default router;
