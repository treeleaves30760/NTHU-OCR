// Check if the document is still loading
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCaptchaFill);
} else {
	initCaptchaFill();
}

function initCaptchaFill() {
	console.log("開始執行驗證碼填入功能");

	// Find the captcha image and input field for both websites
	const captchaImg =
		document.querySelector('img[src^="auth_img.php"]') ||
		document.querySelector("#captcha_image");
	const captchaInput =
		document.querySelector('input[name="passwd2"]') ||
		document.querySelector("#captcha_code");

	console.log("驗證碼圖片元素:", captchaImg);
	console.log("驗證碼輸入框元素:", captchaInput);

	if (captchaImg && captchaInput) {
		console.log("找到驗證碼圖片和輸入框");

		// Create a canvas element to process the image
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		// Load the captcha image
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function () {
			console.log("驗證碼圖片已載入");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			// Use Tesseract.js for OCR recognition
			console.log("開始OCR識別");
			Tesseract.recognize(canvas.toDataURL(), "eng", {
				logger: (m) => console.log("Tesseract進度:", m),
			})
				.then(({ data: { text } }) => {
					console.log("OCR識別結果:", text);

					// Clean up the recognized text, keep only numbers
					let captchaText = text.replace(/[^0-9]/g, "");
					console.log("清理後的驗證碼:", captchaText);

					// Ensure we don't exceed the maxlength (if specified)
					const maxLength = captchaInput.getAttribute("maxlength");
					if (maxLength) {
						captchaText = captchaText.substring(
							0,
							parseInt(maxLength)
						);
						console.log("調整長度後的驗證碼:", captchaText);
					}

					// Fill in the captcha using different methods
					captchaInput.value = captchaText;
					console.log("使用value屬性填入驗證碼");

					captchaInput.setAttribute("value", captchaText);
					console.log("使用setAttribute填入驗證碼");

					captchaInput.defaultValue = captchaText;
					console.log("使用defaultValue填入驗證碼");

					// Trigger events
					captchaInput.dispatchEvent(
						new Event("input", { bubbles: true })
					);
					captchaInput.dispatchEvent(
						new Event("change", { bubbles: true })
					);
					console.log("觸發input和change事件");

					// Final check
					console.log("最終驗證碼輸入框的值:", captchaInput.value);
				})
				.catch((error) => {
					console.error("驗證碼識別失敗:", error);
				});
		};
		img.src = captchaImg.src;
		console.log("設置驗證碼圖片來源:", img.src);
	} else {
		console.log("未找到驗證碼圖片或輸入框");
	}
}
