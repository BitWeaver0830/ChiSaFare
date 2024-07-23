$(document).ready(async function () {
	var data = await fetchProfessional();
	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get("id");

	if (id == null || id == "") {
		alert("Errore nel caricamento dei dati");
		window.location.href = "professionisti.html";
	}

	var professionist;
	data.professionals.forEach((element) => {
		if (element._id == id) {
			professionist = element;
		}
	});

	if (professionist) {
		fillStatic(professionist);
	} else {
		alert("Il professionista non esiste o non è collegato a te");
		window.location.href = "professionisti.html";
	}

	$("#updatePro").on("submit", function (e) {
		updatePro(e);
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

function fillStatic(professionist) {

	$(".ragione_sociale").text(professionist.ragioneSociale);
	$("#status").text(`(${professionist.profileStatus.status})`);
	$("#ragione_sociale").val(professionist.ragioneSociale);
	$("#p_Iva").val(professionist.pIva);
	$("#indirizzo_azienda").val(professionist.address);
	$("#citta_azienda").val(professionist.city);
	$("#cap_azienda").val(professionist.cap);
	$("#provincia_azienda").val(professionist.province);
	$("#email_azienda").val(professionist.email);

	if (professionist.tags && Array.isArray(professionist.tags)) {
		const tagsString = professionist.tags.join(", ");
		$("#selectedTags").val(professionist.tags);
	} else {
		$("#selectedTags").val(professionist.tags);
	}

	$("#date-visura").val(
		professionist.visuraExp ? professionist.visuraExp.split("T")[0] : ""
	);
	$("#date-durc").val(
		professionist.durcExp ? professionist.durcExp.split("T")[0] : ""
	);
	$("#date-assicurazione").val(
		professionist.insuranceExp ? professionist.insuranceExp.split("T")[0] : ""
	);

	fillAteco(professionist.ateco);
}

function fillAteco(ateco) {
	$.ajax({
		type: "GET",
		url: "/api/user/getAllAteco",
		contentType: "application/json",
	})
		.done((res) => {
			res.forEach((element) => {
				var template = `<option value="${element}"`;
				if (element == ateco) template += ` selected`;
				template += `>${element}</option>`;
				$("#ateco_azienda").append(template);
			});
		})
		.fail((res) => {
			console.log("Nessun Ateco trovato");
		});
}

async function getCoordinates(address) {
	try {
		const geocodeUrl =
			"https://nominatim.openstreetmap.org/search?format=json&q=" +
			encodeURIComponent(address);
		const response = await fetch(geocodeUrl);
		const data = await response.json();
		if (data.length > 0) {
			const coordinates = [data[0].lat, data[0].lon];
			return coordinates;
		} else {
			console.log("Geocoding failed: No results found");
			alert("Indirizzo non trovato il professionista sarà aggiunto senza indirizzo. Modificalo in seguito.");
			return [];
		}
	} catch (error) {
		console.log("Geocoding failed:", error);
		return null;
	}
}

async function updatePro(event) {
	event.preventDefault();

	var ragioneSociale = $("#ragione_sociale").val();
	var address = $("#indirizzo_azienda").val();
	var city = $("#citta_azienda").val();
	var cap = $("#cap_azienda").val();
	var province = $("#provincia_azienda").val();
	var visuraExp = $("#date-visura").val();
	var durcExp = $("#date-durc").val();
	var insuranceExp = $("#date-assicurazione").val();
  var ateco = $("#ateco_azienda").val();
	var tags = selectedTags;
  var category = ateco.split(" - ")[1];

  var coordinates = await getCoordinates(
		address + " " + city + " " + province + " " + cap
	);

  var latitude = coordinates[0];
  var longitude = coordinates[1];

	const data = {
		fields: {
            ragioneSociale:ragioneSociale,
            address:address,
            city:city,
            cap:cap,
            province:province,
            visuraExp:visuraExp,
            durcExp:durcExp,
            insuranceExp:insuranceExp,
			latitude:latitude,
			longitude:longitude,
            ateco:ateco,
            category:category,
			tags:tags
		},
	};


	var url = "/api/businessConsultant/updateProfessional";

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        headers: {
            bcID: localStorage.getItem("id"),
            token: localStorage.getItem("dashboard-token"),
            pIva: $("#p_Iva").val(),}
    }).done(function (data) {
        alert("Dati aggiornati con successo");
    }).fail(function (error) {
        alert("Errore nell'aggiornamento dei dati");
        console.log(error);
    });
}
