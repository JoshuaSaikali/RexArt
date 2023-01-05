// Developped by Joshua Saikali

function register() {
	let name = document.getElementById("name").value;
	let pass = document.getElementById("pass").value;
	let newUser = {
		username: name,
		password: pass,
		artist: false,
		followers: [],
		following: [],
		reviews: [],
		artwork: [],
		liked: [],
		workshops: [],
		notifications: [],
	};
	fetch("http://localhost:3000/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newUser),
	})
		.then((response) => {
			if (!response.ok) {
				document.getElementById("name").value = "";
				document.getElementById("pass").value = "";
				document.getElementById("error").innerHTML =
					"That username is taken. Please use a different username.";
			} else {
				location.href = "http://localhost:3000/home";
			}
		})
		.catch((error) => console.log(error));
}

function login() {
	let name = document.getElementById("name").value;
	let pass = document.getElementById("pass").value;

	fetch("http://localhost:3000/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username: name, password: pass }),
	})
		.then((response) => {
			if (!response.ok) {
				document.getElementById("error").innerHTML =
					"Username or password is incorrect.. Please try again.";
			} else {
				location.href = "http://localhost:3000/home";
			}
		})
		.catch((error) => console.log(error));
}

async function searchQuery() {
	let artwork = document.getElementById("query-wname").value;
	let artist = document.getElementById("query-aname").value;
	let year = document.getElementById("query-year").value;
	let category = document.getElementById("query-category").value;

	let query = "";
	let params = [];
	if (artwork) {
		params.push("name=" + artwork);
	}
	if (artist) {
		params.push("username=" + artist);
	}
	if (year) {
		params.push("year=" + year);
	}
	if (category) {
		params.push("category=" + category);
	}

	query = params.join("&");

	location.href = "http://localhost:3000/artwork?" + query;
}

function addToFavorite() {
	let id = location.href.slice(30);
	fetch("http://localhost:3000/myprofile/favorites", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function unlike() {
	let id = event.target.getAttribute("id");
	fetch("http://localhost:3000/myprofile/favorites", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function addReview() {
	let id = location.href.slice(30);
	let review = document.getElementById("review").value;
	fetch("http://localhost:3000/myprofile/reviews", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id, review: review }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function deleteReview() {
	let id = event.target.getAttribute("id");
	let reviewId = event.target.getAttribute("value");
	fetch("http://localhost:3000/myprofile/reviews", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id, reviewId: reviewId }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function followArtist() {
	let id = event.target.getAttribute("value");
	fetch("http://localhost:3000/myprofile/follow", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function unfollowArtist() {
	let id = event.target.getAttribute("value");
	fetch("http://localhost:3000/myprofile/follow", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id }),
	})
		.then((response) => {
			location.reload();
		})
		.catch((error) => console.log(error));
}

function enroll() {
	let id = event.target.getAttribute("value");
	let workshopName = event.target.getAttribute("id");
	fetch("http://localhost:3000/myprofile/workshop", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id, name: workshopName }),
	})
		.then((response) => {
			if (response.ok) {
				location.reload();
				response.json().then((data) => {
					if (data.message == true) {
						alert("Already Enrolled!");
					} else {
						alert("Enrolled Successfully!");
					}
				});
			}
		})
		.catch((error) => console.log(error));
}

function changeAccountType() {
	fetch("http://localhost:3000/myprofile", {
		method: "POST",
	})
		.then((response) => {
			if (response.ok) {
				location.reload();
			}
		})
		.catch((error) => console.log(error));
}

function createNewWorkshop() {
	let name = document.getElementById("workshop-name").value;
	let desc = document.getElementById("workshop-desc").value;
	let flag = false;
	if (name.trim() === "" || desc.trim() === "") {
		alert("Please enter all of the fields..");
		flag = true;
	}
	let workshop = {
		name: name,
		description: desc,
		users: [],
	};
	if (!flag) {
		fetch("http://localhost:3000/myprofile/workshop", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(workshop),
		})
			.then((response) => {
				response.json().then((data) => {
					if (data.flag) {
						alert("Duplicate workshop name. Try a new name.");
					} else {
						createNotification("has created a new workshop. Go check it out!");
						alert("Successfully created workshop");
						location.reload();
					}
				});
			})
			.catch((error) => console.log(error));
	}
}

function createNewArtwork() {
	let name = document.getElementById("artwork-name").value;
	let year = document.getElementById("artwork-year").value;
	let cat = document.getElementById("artwork-category").value;
	let desc = document.getElementById("artwork-desc").value;
	let url = document.getElementById("artwork-url").value;

	let flag = false;
	if (
		name.trim() === "" ||
		desc.trim() === "" ||
		year.trim() === "" ||
		cat.trim() === "" ||
		url.trim() === ""
	) {
		alert("Please enter all of the fields..");
		flag = true;
	}

	let artwork = {
		name: name,
		year: year,
		description: desc,
		category: cat,
		image: url,
	};
	if (!flag) {
		fetch("http://localhost:3000/myprofile/artwork", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(artwork),
		})
			.then((response) => {
				response.json().then((data) => {
					if (data.flag) {
						alert("Duplicate artwork name. Try a new name.");
					} else {
						alert("Successfully created artwork");
						createNotification("has added a new Artwork. Go check it out!");
						location.href = "http://localhost:3000/artwork?name=" + name;
					}
				});
			})
			.catch((error) => console.log(error));
	}
}

function createNotification(message) {
	console.log("called");
	fetch("http://localhost:3000/myprofile/notifications", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ content: message }),
	}).catch((error) => console.log(error));
}
