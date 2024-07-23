window.addEventListener("load", function () {
	fillPage();

});

function fillPage() {
	var photos = [
		"/data/media/1687429937718--logo-mobile.png",
		"/data/media/1687429937721--fattura.jpeg",
		"/data/media/1687429937723--Screenshot 2023-06-10 alle 10.45.05.png",
	];

	photos.forEach(function (photo) {
		let tmp_template = `
        <div class="carousel-item active">
            <a href="${photo}">
                <img src="${photo}" />
            </a>
        </div>
        `;
		$("#static-thumbnails").append(tmp_template);
	});
}


