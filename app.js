import DogsPerHourBot from "./config.js";
import "dotenv/config";
import axios from "axios";

function createBufferFromImageData(imageData) {
	return Buffer.from(imageData);
}

async function uploadMedia(imageUrl) {
	try {
		const { data: imageData } = await axios.get(imageUrl, {
			responseType: "arraybuffer"
		});
		const mediaId = await DogsPerHourBot.v1.uploadMedia(
			createBufferFromImageData(imageData),
			{ mimeType: "image/jpeg" }
		);
		const response = await DogsPerHourBot.v2.tweet("", {
			media: { media_ids: [mediaId] }
		});
		return { isSuccess: true, response };
	} catch (uploadError) {
		switch (uploadError.code) {
			case "ECONNRESET":
				console.log("Error uploading media: Connection reset");
				break;
			case "ETIMEDOUT":
				console.log("Error uploading media: Connection timed out");
				break;
			default:
				console.log(`Error uploading media: ${uploadError}`);
		}
		return { isSuccess: false, error: uploadError };
	}
}

async function postRandomDogImageToTwitter() {
	try {
		const randomDogApiResponse = await axios.get(
			"https://dog.ceo/api/breeds/image/random"
		);
		const { isSuccess, error } = await uploadMedia(
			randomDogApiResponse.data.message
		);
		if (isSuccess) {
			console.log("Dog image posted to Twitter");
		} else {
			throw error;
		}
	} catch (error) {
		console.log(`Error: ${error}`);
		postRandomDogImageToTwitter();
	}
}

postRandomDogImageToTwitter();
setInterval(() => {
	postRandomDogImageToTwitter();
}, 3600000);
