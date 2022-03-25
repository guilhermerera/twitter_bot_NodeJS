import DogsPerHourBot from "./config.js";
import "dotenv/config";
import axios from "axios";
import http from "http";

function postDogsPerHour() {
	axios
		.get("https://dog.ceo/api/breeds/image/random")
		.then((res) => axios.get(res.data.message, { responseType: "arraybuffer" }))
		.then((res) => {
			DogsPerHourBot.v1
				.uploadMedia(Buffer.from(res.data), {
					mimeType: "image/jpeg"
				})
				.then((mediaID) => {
					DogsPerHourBot.v2.tweet("", { media: { media_ids: [mediaID] } });
					console.log("Dog Posted");
				})
				.catch((err) => {
					console.log(`error: ${err}`);
					postDogsPerHour();
				});
		});
}
postDogsPerHour();
setInterval(() => {
	postDogsPerHour();
}, 3600000);

http.createServer(function (request, response) {}).listen(process.env.PORT);
