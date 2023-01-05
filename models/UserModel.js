// Developped by Joshua Saikali
//Import the mongoose module
import pkg from "mongoose";

//mongoose modules -- you will need to add type": "module" to your package.json
const { Schema, model } = pkg;

//Define the Schema for a user
const userSchema = Schema({
	username: String,
	password: String,
	artist: Boolean,
	followers: Array,
	following: Array,
	reviews: Array,
	artwork: Array,
	liked: Array,
	workshops: Array,
	notifications: Array,
});

//Export the default so it can be imported
export default model("users", userSchema);
