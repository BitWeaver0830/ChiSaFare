window.addEventListener("load", function () {
	gestisciFiltri();

	fillStaticFields();

    ascoltaIndirizzo();

    displayRange();
    
    $("#form_ricerca_servizi_submit").on("click", function (e) {
        e.preventDefault();
        effettuaQuery();
    });

    $("#distance-range").on("change", function () {
		displayRange();
	});
});

async function fillStaticFields() {
	const urlParams = new URLSearchParams(window.location.search);

	var distance = urlParams.get("distance");
	var reviewMin = urlParams.get("reviewMin");
	var keyWords = urlParams.get("keyWords");
	var category = urlParams.get("category");
	var address = urlParams.get("address");

	await getAteco();
	setCategory(category);

	setRange(distance);
	setRecensioni(reviewMin);

	$("#search-text").val(keyWords);
	$("#search-location").val(address);

	effettuaQuery();
}

function setRecensioni(reviewMin) {
	if (reviewMin) {
		$("#select-recensioni option").each((item) => {
			if ($("#select-recensioni option")[item].value == reviewMin) {
				$("#select-recensioni option")[item].selected = true;
			}
		});
	}
}

function setCategory(category) {
	if (category) {
		$("#select-categoria option").each((item) => {
			if ($("#select-categoria option")[item].value == category) {
				$("#select-categoria option")[item].selected = true;
			}
		});
	}
}

function getAteco() {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "GET",
			url: "/api/user/getAllAteco",
			contentType: "application/json",
		})
			.done((res) => {
				res.forEach((element) => {
					var template = `<option value="${element.split(" - ")[1]}">${
						element.split(" - ")[1]
					} </option>`;
					$("#select-categoria").append(template);
				});
				resolve();
			})
			.fail((res) => {
				console.log("Nessun Ateco trovato");
				reject();
			});
	});
}

function setRange(distance) {
	if (distance) {
		$("#distance-range").val(distance);
	}
	var template = `${$("#distance-range").val()} Km`;
	$("#distance").html(template);
}

function gestisciFiltri() {
	$("#close-filter").click((e) => {
		e.preventDefault();
		$(".filtri").hide();
	});

	$("#open-filter").click((e) => {
		e.preventDefault();
		$(".filtri").show();
	}); 
}

function fetchLocation(address) {
    return new Promise((resolve, reject) => {

	var geocodeUrl = "https://nominatim.openstreetmap.org/search?format=json&q=" + address;

	fetch(geocodeUrl)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
            resolve({lat: data[0].lat, lon: data[0].lon});
		})
		.catch(function (error) {
			alert("Problema con l'indirizzo inserito");
            reject();
		});
    });

}

async function effettuaQuery() {

    var distance = $("#distance-range").val();
    var keyWords = $("#search-text").val();
    var address = $("#search-location").val();
    var reviewMin = $("#select-recensioni").val();
    var category = $("#select-categoria").val();

    if(distance == null || distance == "" || keyWords == null || keyWords == "" || address == null || address == ""){
        alert("Ricerca non valida");
        return;
    }
    if(category == "Default"){
        category = "";
    }
    if(reviewMin > 5 || reviewMin < 0 || reviewMin == "Default"){
        reviewMin = "";
    }

    var coordinates = await fetchLocation(address);
    var lat = coordinates.lat;
    var lon = coordinates.lon;
  
    $.ajax({
        type: "GET",
        url:"/api/user/getAllActiveProfessionals",
        contentType:"application/json",
        headers: {
            distance: distance,
            lat: lat,
            lon: lon,
            keyWords: keyWords,
            reviewMin: reviewMin,
            category: category,
            tags: keyWords,
        },
    })
        .done((res) => {
            fillResults(res);
          
        })
        .fail((res) => {
            console.log("9999999999999110",res)
            fillResults([]);
          
        });
}

function fillResults(professionals){

    var template = `<h4 class="p-4">
        Non ci sono professionisti che corrispondono ai criteri di ricerca
        </h4>`;
    $(".risultati-ricerca").html(template);


    if(professionals.length == 0){
        return;
    } else {
        $(".risultati-ricerca").html("");
        professionals.forEach((professional) => {
                $(".risultati-ricerca").append(createResult(professional));
        });
    }
}

function createResult(professional){

    var template = `
    <div class="risultato-ricerca">
    
                    <div class="d-flex justify-content-center align-items-center ">
                        <div class="risultato-image-container d-flex justify-content-center">
                            <a href="profilo.html?id=${professional._id}">
                            <img src="${ professional.profilePic ? professional.profilePic : "./images/default-profile-pic.png"}" alt="Image"></a>
                            <!-- QUI CI VA L'IMMAGINE DELL'AZIENDA -->
                        </div>
                    </div>

                        <div class="risultato-text-container py-4 px-lg-3">
                            <div>
                                <h4 class="risultato-nomeAzienda mb-2">${professional.ragioneSociale}</h4>
                                <p class="risultato-posizioneAzienda text-grey semi-bold mb-2">${professional.city + "," + professional.address + " - " + professional.distance + "Km"}</p>
                                
                                <div class="d-flex">`;

                                var count = 0, avg = 0;

                                professional.reviews.forEach((review) => {
                                    if (review.vote != null) {
                                        avg += review.vote;
                                        count++;
                                    }
                                });

                                if(count > 0){
                                    avg = avg / count;
                                    avg = Math.round(avg * 10) / 10;
                                } else {
                                    avg = 0;
                                }

                                for(var i = 0; i < 5; i++){
                                    if(i + 0.5 < avg){
                                        template += `<img src="./images/icon-star-full.svg" alt="" class="custom-icon-double">`;
                                    } else {
                                        template += `<img src="./images/icon-star.svg" alt="" class="custom-icon-double">`;
                                    }
                                }

                                template += `
                                </div>
                            </div>

                            <p class="risultato-copyAzienda">${
                                (professional.intro == null) ? "Non è ancora stata inserita alcuna descrizione" :professional.intro}</p>
                            <div class="risultato-button-container">

                                <a href="tel:${professional.number}" class="cta cta-purple">
                                    <p class="semi-bold  my-2 my-md-0 me-md-3">Chiama</p>
                                </a>
                                <a href="mailto:${professional.email}" class="cta-double cta-purple">
                                    <p class="semi-bold  my-2 my-md-0 mx-md-3">Invia un messaggio</p>
                                </a>
                                <a href="profilo.html?id=${professional._id}" class="cta cta-borded-purple   my-2 my-md-0 ms-md-3">
                                    <p>Altro</p>
                                </a>

                            </div>
                        </div>

                </div>`;

    return template;

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

function displayRange() {
	var template = `${$("#distance-range").val()} Km`;
	$("#distance").html(template);
}