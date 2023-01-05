// Developped by Joshua Saikali
import pkg from "mongoose";
import ArtModel from "./models/ArtModel.js";
import UserModel from "./models/UserModel.js";

import artObjects from "./gallery.json" assert { type: "json" };
import userObjects from "./users.json" assert { type: "json" };

const { connect, connection } = pkg;

const loadData = async () => {
	await connect("mongodb://localhost:27017/data");

	await connection.dropDatabase();

	let artpieces = artObjects.map((art) => new ArtModel(art));
	let users = userObjects.map((user) => new UserModel(user));
	users.forEach((element) => {
		artpieces.forEach((x) => {
			if (x.artist === element.username) {
				element.artwork.push(x);
			}
		});
	});

	await ArtModel.create(artpieces);
	await UserModel.create(users);
};

loadData()
	.then((result) => {
		console.log("Closing database connection");
		connection.close();
	})
	.catch((err) => console.log(err));
