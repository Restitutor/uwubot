/**
 * ANIMALS - Gets important pictures of important animals
 */

const Flickr = require("flickrapi");
const serverConfig = require("../server_config.js");

let helpStrings = [
	"**Animals**",
	"  *Gets important pictures of important animals*",
	"  Usage:",
	"    `!shoob`",
	"    `!pangolin`",
	"    `!corgi`",
	"    `!duck`",
	"    `!goose`",
	"    `!seal`",
	"    `!opossum`",
	"    `!bun`",
	"    `!capy`",
	"    `!axolotl`",
	"    `!fennec`",
	"    `!tardi`",
	"    `!shibe`",
	"    `!cat`"
];
let help = helpStrings.join("\n");

//** Command handlers
let commandHandlers = {};

commandHandlers.shoob = function(message, args) {
	flickrHandler("samoyed", message);
};

commandHandlers.opossum = function(message, args) {
	flickrHandler("opossums", message);
};

commandHandlers.bun = function(message, args) {
	flickrHandler("bunny+rabbit", message);
};

commandHandlers.corgi = function(message, args) {
	flickrHandler("corgi+dog", message);
};

commandHandlers.fennec = function(message, args) {
	flickrHandler("fennec foxes", message);
};

commandHandlers.capy = function(message, args) {
	flickrHandler("capybara", message);
};

commandHandlers.axolotl = function(message, args) {
	flickrHandler("axolotl", message);
};

commandHandlers.tardi = function(message, args) {
	flickrHandler("tardigrade water bear", message);
};

commandHandlers.cat = function(message, args) {
	flickrHandler("cat", message);
};

commandHandlers.shibe = function(message, args) {
	flickrHandler("shiba inu+dog", message);
};

commandHandlers.duck = function(message, args) {
	flickrHandler("16694458@N00", message, true);
};

commandHandlers.pangolin = function(message, args) {
	flickrHandler("974702@N22", message, true);
};

commandHandlers.seal = function(message, args) {
	flickrHandler("18035618@N00", message, true);
};

commandHandlers.goose = function(message, args) {
	flickrHandler("979023@N22", message, true);
};

function flickrHandler(term, message, group = false) {
	let flickrOptions = {};
	serverConfig.getServerConfig(message.guild.id).then(function(config) {
		if (!("animals" in config.moduleConfig)) {
			console.error("Malfunction in animals module: No Flickr config found.");
			return; // this doesn't actually return from the function, just from this .then()
		}

		flickrOptions.api_key = config.moduleConfig.animals.flickrApikey;
		flickrOptions.secret = config.moduleConfig.animals.flickrSecretkey;
	})
	.catch(function(error) {
		console.error(error);
		return;
	});

	if (Object.keys(flickrOptions).length === 0) {
		// check if the flickrOptions object has been populated. if not, bail
		return;
	}

	if (group) {
		var result = flickrRandomPhotoByGroup(term, flickrOptions);
	} else {
		var result = flickrRandomPhotoBySearch(term, flickrOptions);
	}

	result.then(function(picture) {
		message.channel.send(picture);
	})
	.catch(function(error) {
		console.log(error);
	});
};

function flickrRandomPhotoBySearch(term, flickrOptions) {
	return new Promise(function(resolve, reject) {
		try {
			Flickr.tokenOnly(flickrOptions, function(error, flickr) {
				flickr.photos.search({
					text: term,
					page: 1,
					per_page: 120,
					sort: "relevance"
				}, function(err, result) {
					if (err) {
						reject(error);
					} else {
						let picture = randomProperty(result.photos.photo);
						let pictureUrl = "https://farm" + picture.farm + ".staticflickr.com/" + picture.server + "/" + picture.id + "_" + picture.secret + ".jpg";
						resolve(pictureUrl);
					}
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

function flickrRandomPhotoByGroup(groupid, flickrOptions) {
	return new Promise(function(resolve, reject) {
		try {
			Flickr.tokenOnly(flickrOptions, function(error, flickr) {
				flickr.groups.pools.getPhotos({
					group_id: groupid
				}, function(err, result) {
					if (err) {
						reject(false);
					} else {
						let picture = randomProperty(result.photos.photo);
						let pictureUrl = "https://farm" + picture.farm + ".staticflickr.com/" + picture.server + "/" + picture.id + "_" + picture.secret + ".jpg";
						resolve(pictureUrl);
					}
				});
			});
		} catch (err) {
			reject(err);
		}
	});
};

function randomProperty(obj) {
	let keys = Object.keys(obj)
	return obj[keys[keys.length * Math.random() << 0]];
};

//** Module Exports

module.exports = {
	"help": help,
	"commandHandlers": commandHandlers
};

let scriptName = __filename.split(/[\\/]/).pop().split(".").shift();
console.info(`${scriptName} module loaded.`);