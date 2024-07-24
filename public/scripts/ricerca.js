$(document).ready(function () {
	getAteco();
	displayRange();

	ascoltaIndirizzo();

	$("#distance-range").on("change", function () {
		displayRange();
	});

	$("#form_ricerca_servizi_submit").on("click", function (e) {
		e.preventDefault();
		if (validazioneSubmit()) {
			inviaRicerca();
		}
	});

	$("#form_ricerca_servizi_submit").on("click", function (e) {
		e.preventDefault();
		if (validazioneSubmit()) {
			inviaRicerca();
		}
	});

	$("#search-text").keypress(function (e) {
		if (e.which === 13) {
			e.preventDefault();
			if (validazioneSubmit()) {
				inviaRicerca();
			}
		}
	});
});

function getAteco() {
	$.ajax({
		type: "GET",
		url: "/api/user/getAllAteco",
		contentType: "application/json",
	})
		.done((res) => {
			res.forEach((element) => {
				var template = `<option value="${element.split(" - ")[1]}">${element.split(" - ")[1]}</option>`;
				$("#select-categoria").append(template);
			});
		})
		.fail((res) => {
			console.log("Nessun Ateco trovato");
		});
}

function displayRange() {
	var template = `${$("#distance-range").val()} Km`;
	$("#distance").html(template);
}

function ascoltaIndirizzo() {
	var searchBox = document.getElementById("search-location");
	const suggestionsList = document.getElementById("search-suggestions");

	searchBox.addEventListener("keyup", function () {
		if (searchBox.value.endsWith(" ")) {
			var url = "https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + this.value;

			fetch(url)
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					suggestionsList.innerHTML = "";

					data.forEach((item) => {
						const listItem = document.createElement("li");
						listItem.textContent = item.display_name;
						listItem.addEventListener("click", () => {
							searchBox.value = item.display_name;
							suggestionsList.innerHTML = "";
						});
						suggestionsList.appendChild(listItem);
					});
				})
				.catch(function (error) {
					console.log("nada");
				});
		}
	});
}

function validazioneSubmit() {
	var indirizzo = document.getElementById("search-location");

	if (indirizzo.value == "") {
		alert("Inserisci un indirizzo");
		return false;
	}
	return true;
}

function inviaRicerca() {
	var indirizzo = $("#search-location").val();
	var testo = $("#search-text").val();
	var categoria = $("#select-categoria").val();
	var distanza = $("#distance-range").val();
	var recensione = $("#select-recensioni").val();
	var url = "risultati-ricerca.html?";

	if (categoria != "Default") url += `category=${categoria}&`;
	if (recensione != "Default") url += `reviewMin=${recensione}&`;

	url += `distance=${distanza}&`;
	url += `keyWords=${testo}&`;

	url += `address=${indirizzo}&`;

	window.location.href = url;
}
