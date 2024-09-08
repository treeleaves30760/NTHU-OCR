// content.js
console.log("驗證碼自動填充擴展已加載");

// 檢查文檔是否仍在加載
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCaptchaFill);
} else {
	initCaptchaFill();
}

function initCaptchaFill() {
	console.log("開始執行驗證碼填入功能");

	// 找到驗證碼圖片和輸入欄位
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

		// 創建一個canvas元素來處理圖像
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		// 載入驗證碼圖片
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function () {
			console.log("驗證碼圖片已載入");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			// 保存原始圖像數據
			const originalImageData = canvas.toDataURL();

			// 預處理圖像並保存每個步驟的結果
			const preprocessedImages = preprocessImageSteps(canvas);

			// 保存所有圖像數據到 Chrome storage
			chrome.storage.local.set(
				{
					captchaImages: [originalImageData, ...preprocessedImages],
				},
				function () {
					console.log("圖像數據已保存到 Chrome storage");
				}
			);

			// 使用預處理後的圖片進行OCR識別
			const finalProcessedImage =
				preprocessedImages[preprocessedImages.length - 1];
			console.log("開始OCR識別 使用處理後的圖片");
			Tesseract.recognize(finalProcessedImage, "eng", {
				logger: (m) => console.log("Tesseract進度:", m),
				tessedit_char_whitelist: "0123456789",
				// tessedit_pageseg_mode: "7", // 將圖像視為單行文本
				tessedit_ocr_engine_mode: 2, // 使用 LSTM OCR 引擎
				preserve_interword_spaces: "0", // 不保留單詞間的空格
				tessedit_font_name: "Microsoft+", // 使用適合數字的字體
				classify_bln_numeric_mode: "1", // 啟用數字識別模式
			})
				.then(({ data: { text } }) => {
					console.log("OCR識別結果:", text);

					// 清理識別的文本，只保留數字
					let captchaText = text.replace(/[^0-9]/g, "");
					console.log("清理後的驗證碼:", captchaText);

					// 填入驗證碼
					captchaInput.value = captchaText;
					console.log("填入驗證碼:", captchaText);

					// 觸發事件
					captchaInput.dispatchEvent(
						new Event("input", { bubbles: true })
					);
					captchaInput.dispatchEvent(
						new Event("change", { bubbles: true })
					);
					console.log("觸發input和change事件");

					// 最終檢查
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

function preprocessImageSteps(canvas) {
	const steps = ["灰度處理", "二值化處理"];
	const processedImages = [];

	steps.forEach((step, index) => {
		const processedCanvas = document.createElement("canvas");
		processedCanvas.width = canvas.width;
		processedCanvas.height = canvas.height;
		const ctx = processedCanvas.getContext("2d");
		ctx.drawImage(canvas, 0, 0);

		preprocessImage(processedCanvas, index + 1);
		processedImages.push(processedCanvas.toDataURL());
	});

	return processedImages;
}

function preprocessImage(canvas, step) {
	const ctx = canvas.getContext("2d");
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	switch (step) {
		case 1: // 灰度處理
			for (let i = 0; i < data.length; i += 4) {
				const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
				data[i] = data[i + 1] = data[i + 2] = avg;
			}
			break;
		case 2: // 二值化處理
			const threshold = 170;
			for (let i = 0; i < data.length; i += 4) {
				const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
				const value = avg > threshold ? 255 : 0;
				data[i] = data[i + 1] = data[i + 2] = value;
			}
			break;
	}

	ctx.putImageData(imageData, 0, 0);
}
