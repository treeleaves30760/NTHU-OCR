// Check if the document is still loading
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCaptchaFill);
} else {
	initCaptchaFill();
}

function initCaptchaFill() {
	// Find the captcha image and input field
	const captchaImg = document.querySelector('img[src^="auth_img.php"]');
	const captchaInput = document.querySelector('input[name="passwd2"]');

	if (captchaImg && captchaInput) {
		// Create a canvas element to process the image
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		// Load the captcha image
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			// Use Tesseract.js for OCR recognition
			Tesseract.recognize(canvas.toDataURL(), "eng", {
				logger: (m) => console.log(m),
			})
				.then(({ data: { text } }) => {
					// Clean up the recognized text, keep only alphanumeric characters
					const captchaText = text
						.replace(/[^a-zA-Z0-9]/g, "")
						.substring(0, 6);

					// Fill in the captcha
					captchaInput.value = captchaText;
					console.log("驗證碼已填入:", captchaText);
				})
				.catch((error) => {
					console.error("驗證碼識別失敗:", error);
				});
		};
		img.src = captchaImg.src;
	}
}
