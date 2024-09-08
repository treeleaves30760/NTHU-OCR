// popup.js
document.addEventListener("DOMContentLoaded", function () {
	chrome.storage.local.get(["captchaImages"], function (result) {
		if (result.captchaImages && result.captchaImages.length > 0) {
			showPreprocessingSteps(result.captchaImages);
		} else {
			document.getElementById("images").innerHTML =
				"<p>暫無可顯示的驗證碼圖像。</p>";
		}
	});
});

function showPreprocessingSteps(imageDataArray) {
	const container = document.getElementById("images");
	container.innerHTML = ""; // 清除之前的內容

	const steps = ["原始圖像", "灰度處理", "二值化處理"];

	imageDataArray.forEach((imageData, index) => {
		const imageContainer = document.createElement("div");
		imageContainer.className = "image-container";

		const title = document.createElement("h3");
		title.textContent = steps[index];
		imageContainer.appendChild(title);

		const img = new Image();
		img.src = imageData;
		img.style.maxWidth = "100%";
		imageContainer.appendChild(img);

		container.appendChild(imageContainer);
	});
}
