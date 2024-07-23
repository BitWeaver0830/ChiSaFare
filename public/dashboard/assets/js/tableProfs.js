$(document).ready(async function () {
	// CONTROLLO TABLE
	var data = await fetchProfessional();
	addNavigator(data);
	fillTable(data);

	// GESTIONE RICERCA
	$("#localSearch").on("keyup", () => {
		search(data);
	});

	// GESTIONE NAVIGATOR
	$(".pagination li").on("click", function () {
		$(".pagination li").removeClass("active");
		$(this).addClass("active");
		fillTable(data);
	});

	// GESTIONE CLICK SU RIGA
	$(".rowClickable").on("click", function () {
		var profID = $(this).attr("profID");
		window.location.href = "profDetails.html?id=" + profID;
	});

	// AGGIUNGERE PROFESSIONISTA
	getAteco(); 
	$("#add-pro").on("submit", function (e) {
		e.preventDefault();
		addProfessional();
	});
});

function fetchProfessional() {
	return new Promise(function (resolve, reject) {
		var url =
			"/api/businessConsultant/getAllProfessionals";

		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			headers: {
				bcID: localStorage.getItem("id"),
				token: localStorage.getItem("dashboard-token"),
			},
		})
			.done(function (data) {
				resolve(data);
			})
			.fail(function (error) {
				alert("Errore nel caricamento dei dati");
				reject(error);
			});
	});
}

function addNavigator(data) {
	var number = data.counter;
	if (number == 0) {
		$("#tableNavigator").html("");
		var emptyTemplate = `
		<p>Nessun Professionista Trovato</p>
		`;
		$("#dataTable").html(emptyTemplate);
		return;
	}
	let neededPages = Math.floor(number / 5)  + (number % 5 > 0 ?  1 : 0);
	let template = `<li class="page-item active"><a class="page-link" href="#">1</a></li>`;

	for (let i = 2; i <= neededPages; i++) {
		template += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`;
	}
	$(".pagination").html(template);
	$(".pagination li").on("click", function () {
		$(".pagination li").removeClass("active");
		$(this).addClass("active");
		fillTable(data);});
	}


function fillTable(data) {
	var template_html = "";

	var currentPage = $(".pagination .active a").text();
	var startIndex = (currentPage - 1) * 5;
	var endIndex;
	if (startIndex + 5 > data.counter) {
		endIndex = data.counter;
	} else {
		endIndex = startIndex + 5;
	}

	var paginatedData = data.professionals.slice(startIndex, endIndex);

	$(".allResults").text(data.counter);
	$(".currentResultsRange").text(`${startIndex + 1} - ${endIndex}`);

	paginatedData.forEach((element) => {
		template_html += `

	<tr class="rowClickable" profID="${element._id}">
		<td>${element.ragioneSociale}</td>
		<td>${element.category}</td>
		<td>Professionista</td>
		<td>${element.city + ", " + element.province}</td>
		<td>${element.pIva}</td>
		<td>${element.profileStatus.status}</td>
	</tr>`;
	}); 

	$("#profTableBody").html(template_html);
}

function getAteco() {
	$.ajax({
		type: "GET",
		url: "/api/user/getAllAteco",
		contentType: "application/json",
	})
		.done((res) => {
			res.forEach((element) => {
				var template = `<option value="${element}">${element}</option>`;
				$("#ateco_azienda").append(template);
			});
		})
		.fail((res) => {
			console.log("Nessun Ateco trovato");
		});
}

function validateForm() {
	var cap = document.getElementById("cap_azienda");

	cap.setCustomValidity("");
	if (cap.value.length != 5) {
		cap.setCustomValidity("CAP non valido");
		return false;
	}
	return true;
}

async function retriveData() {
	if (!validateForm()) {
		return {};
	}
	var ragioneSociale = $("#ragione_sociale").val();
	var pIva = $("#p_Iva").val();
	var address = $("#indirizzo_azienda").val();
	var ateco = $("#ateco_azienda").val();
	var city = $("#citta_azienda").val();
	var province = $("#provincia_azienda").val();
	var cap = $("#cap_azienda").val();
	var email = $("#email_azienda").val();
	var visuraExp = $("#date-visura").val();
	var durcExp = $("#date-durc").val();
	var insuranceExp = $("#date-assicurazione").val();

	var completeAddress = address + ", " + city + ", " + province + ", " + cap;
	console.log(completeAddress);

	var data = {};

	var geocodeUrl =
		"https://nominatim.openstreetmap.org/search?format=json&q=" +
		completeAddress;

	await fetch(geocodeUrl)
		.then(function (response) {
			console.log(response);
			return response.json();
		})
		.then(function (res) {
			if (res.length > 0) {
				var latitude = res[0].lat;
				var longitude = res[0].lon;

				data = {
					ragioneSociale,
					pIva,
					address,
					ateco,
					city,
					province,
					cap,
					email,
					visuraExp,
					durcExp,
					insuranceExp,
					latitude,
					longitude,
					tags:selectedTags,
				};
			} else {
				alert("Geolocalizzazione fallita, il professionista sarà aggiunto senza coordinate salvate");
				data = {
					ragioneSociale,
					pIva,
					address,
					ateco,
					city,
					province,
					cap,
					email,
					visuraExp,
					durcExp,
					insuranceExp,
					tags:selectedTags,
				};
			}
		})
		.catch(function (error) {
			console.log("Geocoding failed:", error);
			data = {
				ragioneSociale,
				pIva,
				address,
				ateco,
				city,
				province,
				cap,
				email,
				visuraExp,
				durcExp,
				insuranceExp,
			};
		});

	return data;
}

async function addProfessional() {
	var data = await retriveData();
	if (Object.keys(data).length == 0) {
		alert("Niente di restituito");
		return;
	}

	$.ajax({
		type: "POST",
		url: "/api/businessConsultant/signUpProfessional",
		contentType: "application/json",
		data: JSON.stringify(data),
		headers: {
			bcID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((res) => {
			window.location.href = "professionisti.html";
		})
		.fail((err) => {
			switch (err.responseJSON.status) {
				case 400:
					$(".messageBox").html(
						"Errore nella richiesta: " + err.responseJSON.message
					);
					break;
				default:
					break;
			}
		});

}

function search(data) {
	var searchQuery = $("#localSearch").val();
	console.log(searchQuery);

	if (searchQuery == "") {
		addNavigator(data);
		fillTable(data);
		return;
	}

	let results = { professionals: [] };

	data.professionals.forEach((element) => {
		if (
			element.ragioneSociale.toUpperCase().includes(searchQuery.toUpperCase()) ||
			element.category.toUpperCase().includes(searchQuery.toUpperCase()) ||
			element.city.toUpperCase().includes(searchQuery.toUpperCase()) ||
			element.pIva.toUpperCase().includes(searchQuery.toUpperCase()) ||
			element.profileStatus.status.toUpperCase().includes(searchQuery.toUpperCase())
		) {
			results.professionals.push(element);
		}
	});

	results.counter = results.professionals.length;

	addNavigator(results);
	fillTable(results);

}
