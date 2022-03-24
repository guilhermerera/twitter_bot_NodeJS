import DogsPerHourBot from "./config.js";
import fetch from "node-fetch";
import { fileTypeFromFile } from "file-type";
import "dotenv/config";
import fs from "fs";
import Stream from "stream";
import http from "http";
import https from "https";

var downloadImageFromURL = (url, filename, callback) => {
	var client = http;
	if (url.toString().indexOf("https") === 0) {
		client = https;
	}

	client
		.request(url, function (response) {
			var data = new Stream.Transform();

			response.on("data", function (chunk) {
				data.push(chunk);
			});

			response.on("end", function () {
				fs.writeFileSync(filename, data.read());
			});
		})
		.end();
};

function postDogsPerHour() {
	fetch("https://dog.ceo/api/breeds/image/random")
		.then((res) => res.json())
		.then((dog) => {
			let dogImagePath = "./dogs/dog.jpg";
			downloadImageFromURL(dog.message, dogImagePath);
			setTimeout(() => {
				DogsPerHourBot.v1
					.uploadMedia(dogImagePath, {
						mimeType: fileTypeFromFile(dogImagePath).mime
					})
					.then((mediaID) => {
						DogsPerHourBot.v2.tweet("", { media: { media_ids: [mediaID] } });
						fs.unlink(dogImagePath, (err) => {
							if (err) throw err;
							console.log("File Deleted");
						});
					})
					.catch((err) => {
						console.log(err);
						postDogsPerHour();
					});
			}, 5000);
		});
}
postDogsPerHour();
setInterval(() => {
	postDogsPerHour();
}, 3600000);
