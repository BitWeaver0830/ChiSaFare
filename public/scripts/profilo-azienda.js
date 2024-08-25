window.addEventListener("load", function () {
	fillPage();

	$("#leave-review").click(function (e) {
		e.preventDefault();
		if(localStorage.getItem("userType") != "user"){
			alert("Effettua il login come user per rilasciare una recensione");
			window.location.href = "login.html";
		} else {
			formAddReview();
		}
	});

	if (localStorage.getItem("userType") != "user") {
		$(".save-pro").css("visibility", "hidden");
	} else {
		checkUserStats();
	}
});

function checkUserStats() {
	$.ajax({
		url: "/api/user/getUser",
		type: "POST",
		contentType: "application/json",
		headers: {
			userID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
		},
	})
		.done((res) => {

			const urlParams = new URLSearchParams(window.location.search);
			var professionalID = urlParams.get("id");

			var saved = false;

			res.favouriteProfessionals.forEach((professionist) => {
				if (professionist.pID == professionalID) {
					$(".save-pro p").text("Rimuovi");
					saved = true;
					$(".save-pro").click(function (e) {
						e.preventDefault();
						unsavePro();
					});
				}
			});
			if (!saved) {
				$(".save-pro").click(function (e) {
					e.preventDefault();
					savePro();
				});
			}
		})
		.fail((err) => {
			alert("Errore");
		});
}

function fillPage() {
	const urlParams = new URLSearchParams(window.location.search);
	const idAzienda = urlParams.get("id");

	$.ajax({
		type: "GET",
		url: "/api/user/getProfessional",
		contentType: "application/json",
		headers: {
			professionalID: idAzienda,
		},
	})
		.done((res) => {
			if (res.profileStatus.status != "non attivo") {
				checkStaticData(res);

				checkImages(res);

				checkReviews(res.reviews);

				checkRequisiti(res);

				checkMap(res);
			} 
			else {
				html_template = `
        <div class="card mt-3 p-4">
            <h3>Professionista non attivo sulla piattaforma</h3>
        </div>
        `;
				$(".container").html(html_template);
			}
		})
		.fail((res) => {
			html_template = `
        <div class="card mt-3 p-4">
            <h3>Nessun Professionista trovato</h3>
        </div>
        `;
			$(".container").html(html_template);
		});
}

function checkStaticData(res) {
	$(".data-ragioneSociale").html(res.ragioneSociale);
	$(".data-category").html(res.category);
	$(".data-indirizzo").html(
		res.address + ", " + res.cap + ", " + res.city + ", " + res.province
	);
	$("#data-telefono").attr("href", "tel:" + res.number);
	$("#data-mail").attr("href", "mailto:" + res.email);

	if (res.intro != null && res.intro != "") {
		$("#data-intro").html(res.intro);
	} else {
		$("#data-intro").html(
			'<p class="semi-bold">Nessuna introduzione fornita</p>'
		);
	}

	$('.data-indicazioni').attr('href', `https://www.google.com/maps/search/?api=1&query=${$('.data-indirizzo').text().replace(/ /g, '+')}`);
	$('.data-indicazioni').attr('target', '_blank');
	$('#openChat').attr('href', `chat.html?id=${res._id}`);
}

function checkImages(res) {
	$(".data-profilePic").attr("src", "./images/default-profile-pic.png");
	if (res.profilePic != null && res.profilePic != "") {
		var path =res.profilePic;
		$(".data-profilePic").attr("src", path);
	}

	if (res.aboutUsCopy != null && res.aboutUsCopy != "") {
		$(".data-aboutUsCopy").html(res.aboutUsCopy);
	} else {
		$(".data-aboutUsCopy").html(
			'<p class="semi-bold">Nessuna descrizione fornita</p>'
		);
	}

	if (res.aboutUsGallery.length > 0) {
		for (var i = 0; i < res.aboutUsGallery.length; i++) {
			var path =res.aboutUsGallery[i];

			var images_template = `
			<div class="carousel-item ${i == 0 ? "active" : ""}">
				<img src="${path}" alt="">
			</div>
			`;

			$("#sudinoi-carousel .carousel-inner").append(images_template);
		}
	} else {
		$(".data-aboutUsGallery").html(
			'<p class="semi-bold">Nessuna immagine fornita</p>'
		);
	}

	if (res.specializationsGallery.length > 0) {
		for (var i = 0; i < res.specializationsGallery.length; i++) {
			var path = res.specializationsGallery[i];
			var images_template = `
			<div class="carousel-item ${i == 0 ? "active" : ""}">
				<img src="${path}" alt="">
			</div>
			`;
			$("#specializzazioni-carousel .carousel-inner").append(images_template);
		}
	} else {
		$(".data-specializationsGallery").html(
			'<p class="semi-bold">Nessuna immagine fornita</p>'
		);
	}
}

function checkReviews(reviews) {
	if (reviews.length > 0) {
		reviews_html = ``;
		let count = reviews.length > 2 ? 2 : reviews.length;
		for (var i = 0; i < count; i++) {
			reviews_html += `
            <div class="d-flex flex-column border-bottom border-2 my-3">
							<p class="mx-1 fw-bold">${reviews[i].user ? reviews[i].user.name + " " + reviews[i].user.lastname : "Deleted User"}</p>
							<div class="d-flex align-items-center my-2">
									<img src="./images/icon-star-dark.svg" alt="" class="custom-icon">
									<p class="mx-1">${reviews[i].vote}/5</p>
									<p class="ms-2 data-review">${reviews[i].text}</p>
							</div>
            </div>`;
		}
		reviews_html += `
			<a href="" type="button" data-bs-toggle="modal" data-bs-target="#recensioniModal">
					<p class="text-decoration-underline">Vedi tutte le recensioni</p>
			</a>`
		$(".data-reviews").html(reviews_html);

		reviews_html = ``;
		reviews.forEach((review) => {
			reviews_html += `
				<div class="d-flex flex-column border-bottom border-2 my-3">
					<p class="mx-1 fw-bold">${review.user ? review.user.name + " " + review.user.lastname : "Deleted User"}</p>
					<div class="d-flex align-items-center my-2">
							<img src="./images/icon-star-dark.svg" alt="" class="custom-icon">
							<p class="mx-1">${review.vote}/5</p>
							<p class="ms-2 data-review">${review.text}</p>
					</div>
				</div>`;
		});
		$("#recensioniModal .recensioni-div").html(reviews_html);
	} else {
		$(".data-reviews").html('<p class="semi-bold">Nessuna recensione</p>');
		$(".data-averageReviews").html("0");
	}
}

function checkRequisiti(res) {
	if (new Date(res.durcExp) > Date.now()) {
		$(".data-durc").attr("src", "./images/icon-requisiti-yes.svg");
	} else {
		$(".data-durc").attr("src", "./images/icon-requisiti-no.svg");
	}
	if (new Date(res.visuraExp) > Date.now()) {
		$(".data-visura").attr("src", "./images/icon-requisiti-yes.svg");
	} else {
		$(".data-visura").attr("src", "./images/icon-requisiti-no.svg");
	}
	if (new Date(res.insuranceExp) > Date.now()) {
		$(".data-assicurazione").attr("src", "./images/icon-requisiti-yes.svg");
	} else {
		$(".data-assicurazione").attr("src", "./images/icon-requisiti-no.svg");
	}
}

function checkMap(res) {
	if (
		res.latitude != null &&
		res.latitude != "" &&
		res.longitude != null &&
		res.longitude != ""
	) {
		loadMap(
			res.latitude,
			res.longitude,
			res.address + ", " + res.city + ", " + res.province
		);
	} else {
		if (
			res.address != null &&
			res.address != "" &&
			res.cap != null &&
			res.cap != "" &&
			res.city != null &&
			res.city != "" &&
			res.province != null &&
			res.province != ""
		) {
			var address =
				res.address + ", " + res.cap + ", " + res.city + ", " + res.province;
			var geocodeUrl =
				"https://nominatim.openstreetmap.org/search?format=json&q=" + address;
			fetch(geocodeUrl)
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					if (data.length > 0) {
						loadMap(data[0].lat, data[0].lon, address);
					} else {
						$("#map").html(
							'<p class="semi-bold">Non è possibile localizzare l\'indirizzo</p>'
						);
					}
				})
				.catch(function (error) {
					$("#map").html(
						'<p class="semi-bold">Non è possibile localizzare l\'indirizzo</p>'
					);
				});
		} else {
			$("#map").html(
				'<p class="semi-bold">Non è possibile localizzare l\'indirizzo</p>'
			);
		}
	}
}

function loadMap(lat, long, address) {
	var coordinates = [lat, long];

	var map = L.map("map").setView(coordinates, 13);

	lat = parseFloat(lat);
	long = parseFloat(long);

	L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 18,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	}).addTo(map);

	var marker = L.marker([lat, long]).addTo(map).bindPopup(address).openPopup();
}

function formAddReview() {
	bodyModal_template = `
		<div class="p-2">
			<p class="semi-bold">Inserisci recensione</p>
			<form id="addReview">
				<div>
					<label for="reviewVote">Voto</label>
					<select name="reviewVote" id="reviewVote" class="modal-form-control" style="width: 3rem;">
						<option value="1">1/5</option>
						<option value="2">2/5</option>
						<option value="3">3/5</option>
						<option value="4">4/5</option>
						<option value="5">5/5</option>
					</select>
				</div>
				<div>
					<label for="reviewText">Testo</label>
					<textarea name="reviewText" id="reviewText" class="form-control" rows="5"></textarea>
				</div>
			</form>
		</div>`;

	$("#recensioniModal .modal-body").html(bodyModal_template);

	var footerModal_template = `
	<a type="button" class="cta cta-borded-purple me-2" data-bs-dismiss="modal">
	<p>Annulla</p>
</a>
<a id="publish-review" href="" type="button" class="cta cta-purple ms-2">
	<p>Pubblica Recensione</p>
</a>
	
	`;

	$("#recensioniModal .modal-footer").html(footerModal_template);

	$("#publish-review").click(function (e) {
		e.preventDefault();
		newReview();
	});
}

function newReview() {
	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get("id");

	var vote = $("#reviewVote").val();
	var text = $("#reviewText").val();

	if (text == "") {
		alert("Inserisci un testo per la recensione");
		return;
	} else if (id == "" || id == null) {
		alert("Errore");
		return;
	} else {
		var data = {
			professionalID: id,
			vote: vote,
			text: text,
		};

		$.ajax({
			url: "/api/social/addReview",
			type: "POST",
			data: JSON.stringify(data),
			headers: {
				token: localStorage.getItem("token"),
				userID: localStorage.getItem("userID"),
			},
			contentType: "application/json",
		})
			.done(function (res) {
				alert("Recensione inserita con successo");
				$("#recensioniModal").modal("hide");
				location.reload();
			})
			.fail((err) => {
				var message = JSON.parse(err.responseText);
				if (message.message == "Auth guard not passed") {
					alert(
						"Non sei autorizzato a rilasciare recensioni, effettua il login come user"
					);
					location.reload();
				}
			});
	}
}

function savePro() {

	const urlParams = new URLSearchParams(window.location.search);
	var professionalID = urlParams.get("id");
	data = { professionalID };

	var userID = localStorage.getItem("userID");
	var token = localStorage.getItem("token");

	$.ajax({
		url: "/api/user/setFavouiriteProfessional",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			token: token,
			userID: userID,
		},
		contentType: "application/json",
		dataType: "json",
	})
		.done((res) => {
			alert("Professionista salvato con successo");
			location.reload();
		})
		.fail((err) => {
			alert("Errore da salva");
		});
}

function unsavePro() {
	const urlParams = new URLSearchParams(window.location.search);
	var professionalID = urlParams.get("id");
	data = { professionalID };

	var userID = localStorage.getItem("userID");
	var token = localStorage.getItem("token");

	$.ajax({
		url: "/api/user/removeFavouiriteProfessional",
		type: "POST",
		data: JSON.stringify(data),
		headers: {
			token: token,
			userID: userID,
		},
		contentType: "application/json",
		dataType: "json",
	})
		.done((res) => {
			alert("Professionista rimosso con successo");
			location.reload();
		})
		.fail((err) => {
			alert("Errore da rimuovi");
		});
}
