// Developped by Joshua Saikali
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import pug from "pug";
import fs from "fs";

const app = express();

// importing routers 
import accountsRouter from "./routes/accounts.js";
import profileRouter from "./routes/profile.js";
import usersRouter from "./routes/users.js";
import artworkRouter from "./routes/artwork.js";

mongoose.connect("mongodb://127.0.0.1/data");
mongoose.set("strictQuery", false);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	session({
		secret: "some secret here",
		resave: true,
		saveUninitialized: true,
	})
);

app.set("views", "./views");
app.set("view engine", "pug");

// retrieves and sends client the background image
app.get("/gallery2.jpg", (req, res) => {
	fs.readFile("gallery2.jpg", function (err, data) {
		if (err) {
			res.status(500);
			res.send(err);
			res.end();
			return;
		}
		res.status(200);
		res.setHeader("Content-Type", "image/jpg");
		res.end(data);
	});
});

// if user is not logged in then send register page, else redirect to home
app.get("/", (req, res) => {
	if (!req.session.loggedin) {
		res.render("pages/register");
		res.status(200);
	} else {
		res.redirect("/home");
		res.status(200);
	}
});


// render home page
app.get("/home", auth, async (req, res) => {
	res.render("pages/home");
});

// all routers
app.use("/", accountsRouter);
app.use("/artwork", auth, artworkRouter);
app.use("/users", auth, usersRouter);
app.use("/myprofile", auth, profileRouter);


// verifies that user is logged in
async function auth(req, res, next) {
	if (!req.session.loggedin) {
		res.render("pages/error", {
			code: 401,
			error: "Not logged in",
		});
		res.status(401);
		return;
	}
	next();
}


// handles all unknown requests renders error page
app.all("*", (req, res) => {
	res.status(404);
	res.render("pages/error", { code: 404, error: "Page not found..." });
});

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
	console.log("connected to database");

	app.listen(3000);
	console.log("Listening on port http://localhost:3000");
});
