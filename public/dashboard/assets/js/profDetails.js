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
	$("#ateco_azienda").val(professionist.ateco);

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

	// fillAteco(professionist.ateco);
}

function getAteco(keyword) {
    const apiUrl = keyword ? `/api/user/getAllAteco?search=${keyword}` : '/api/user/getAllAteco';

    $.ajax({
        type: "GET",
        url: apiUrl,
        contentType: "application/json",
    })
    .done((res) => {
        const inputField = document.getElementById('ateco_azienda');
        const optionsList = document.getElementById('select-categoria-options');
        const searchText = inputField.value.toLowerCase();
        const filteredData = res.filter(option => option.toLowerCase().includes(searchText));

        optionsList.innerHTML = '';

        if (filteredData.length > 0) {
            filteredData.forEach(option => {
                const li = document.createElement('li');
                li.textContent = option;
                li.addEventListener('click', function() {
                    inputField.value = option;
                    optionsList.innerHTML = ''; 
                    optionsList.style.display = 'none'; 
                });
                optionsList.appendChild(li);
            });
            optionsList.style.display = 'block'; 
        } else {
            optionsList.style.display = 'none'; 
        }
    })
    .fail((res) => {
        console.log("Nessun Ateco trovato");
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('ateco_azienda');
    const optionsList = document.getElementById('select-categoria-options');

    inputField.addEventListener('click', function() {
        getAteco('');
    });

    inputField.addEventListener('input', function() {
        const keyword = this.value; 
        
				getAteco(keyword); 
				adjustOptionsListHeight();
    });

		function adjustOptionsListHeight() {
        const optionCount = optionsList.getElementsByTagName('li').length;
        const maxHeight = optionCount > 5 ? '150px' : 'auto';
        
        optionsList.style.maxHeight = maxHeight;
    }

    document.addEventListener('click', function(event) {
			if (!inputField.contains(event.target) && !optionsList.contains(event.target)) {
					optionsList.style.display = 'none';
			}
		});
});


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
  var email = $("#email_azienda").val();
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
            email:email,
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
