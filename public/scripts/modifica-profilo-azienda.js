window.addEventListener("load", async function () {
	data = await retrieveData();

	fillPage(data);

	$("#newProfilePic").on("change", function () {
		changeProfilePic(this.files[0], data._id);
	});

	$("#form-contatto").on("submit", function (e) {
		e.preventDefault();
		updateDatiContatto();
	});

	$("#form-aboutUs").on("submit", function (e) {
		e.preventDefault();
		updateAboutUs();
	});

	$('#form-gallery-aboutUs input[type="file"]').on("change", function () {
		checkFile(this);
	});

	$("#form-gallery-aboutUs").on("submit", function (e) {
		e.preventDefault();
		uploadAboutUsGallery();
	});

    $('#form-gallery-secondary input[type="file"]').on("change", function () {
		checkFile(this);
	});

	$("#form-gallery-secondary").on("submit", function (e) {
		e.preventDefault();
		uploadSpecializationGallery();
	});

	$(".data-aboutUsPhotos .update-photo-input").on("change", function () {
		const idx = parseInt($(this).attr("data-gallery-index"));
		uploadAboutUsGallery(idx);
	});
	
	$(".data-specializationGallery .update-photo-input").on("change", function () {
		const idx = parseInt($(this).attr("data-gallery-index"));
		uploadSpecializationGallery(idx);
	});

	$(".data-aboutUsPhotos .remove-photo-btn").on("click", function () {
		const idx = parseInt($(this).attr("data-gallery-index"));
		removeAboutUsGallery(idx);
	});
	
	$(".data-specializationGallery .remove-photo-btn").on("click", function () {
		const idx = parseInt($(this).attr("data-gallery-index"));
		removeSpecializationGallery(idx);
	});
});

function retrieveData() {
	return new Promise((resolve, reject) => {
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
				resolve(res);
			})
			.fail((err) => {
				alert("Errore nel caricamento dei dati, effettua nuovamente il login");
				localStorage.clear();
				window.location.href = "/login.html";
			});
	});
}

function fillPage(data) {
	$(".data-ragioneSociale").text(data.ragioneSociale);

	if(data.profilePic){
	$(".data-profilePic").attr("src",data.profilePic);
	} else {
		$(".data-profilePic").attr("src","./images/default-profile-pic.png");
	}

	$("#data-intro").text(data.intro);
	$("#data-number").val(data.number);

	$("#data-aboutUs").val(data.aboutUsCopy);

	for (let i = 0; i < 6; i++) {
		if (data.aboutUsGallery[i]) {
			path = data.aboutUsGallery[i];
			photoTemplate = `
				<div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
					<label for="image-gallery-${i}">
						<img class="img-fluid m-0" id="data-gallery-${i + 1}" src="${path}" alt=""/>
						<div class="photo-actions">
							<button class="remove-photo-btn btn btn-sm btn-danger rounded-circle" data-gallery-index="${i}"><i class="fas fa-trash-alt" style="font-size: 0.75rem"></i></button>
						</div>
					</label>
					<input type="file" class="update-photo-input" id="image-gallery-${i}" data-gallery-index="${i}">
					<p>adsfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffs</p>
				</div>
				`;
		} else {
			photoTemplate = `
				<div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
					<label for="image-gallery-${i}">
						<img class="img-fluid no-photo m-0" id="data-gallery-${i + 1}" src="../images/placeholder.png" alt=""/>
					</label>
					<input type="file" class="update-photo-input" id="image-gallery-${i}" data-gallery-index="${i}">
				</div>`;
		}
		$(".data-aboutUsPhotos").append(photoTemplate);
	}
	// let inputAndSave_aboutUS = `
  //   <input type="file" id="data-aboutUsPhotos-input" multiple>
  //   <input type="submit" class="text-decoration-underline" value="Salva">`;
	// $(".data-aboutUsPhotos").append(inputAndSave_aboutUS);


	for (let i = 0; i < 6; i++) {
		if (data.specializationsGallery[i]) {
			path = data.specializationsGallery[i];
			photoTemplate = `
				<div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
					<label for="image-special-${i}">
						<img class="img-fluid m-0" id="data-gallery-${i + 1}" src="${path}" alt=""/>
						<div class="photo-actions">
							<button class="remove-photo-btn btn btn-sm btn-danger rounded-circle" data-gallery-index="${i}"><i class="fas fa-trash-alt" style="font-size: 0.75rem"></i></button>
						</div>
					</label>
					<input type="file" class="update-photo-input" id="image-special-${i}" data-gallery-index="${i}">
					<p>adsfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffs</p>
				</div>`;
		} else {
			photoTemplate = `
				<div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
					<label for="image-special-${i}">
						<img class="img-fluid m-0 no-photo" id="data-special-gallery-${i + 1}" src="../images/placeholder.png" alt=""/>
					</label>
					<input type="file" class="update-photo-input" id="image-special-${i}" data-gallery-index="${i}">
				</div>`;
		}
		$(".data-specializationGallery").append(photoTemplate);
	}
	// let inputAndSave_specializzazioni = `
  //   <input type="file" id="data-specializationPhotos-input" multiple>
  //   <input type="submit" class="text-decoration-underline" value="Salva">`;
	// $(".data-specializationGallery").append(inputAndSave_specializzazioni);
}

function changeProfilePic(file, id) {
	let allowedExtensions = ["jpg", "jpeg", "png"];
	let fileExtension = file.name.split(".").pop().toLowerCase();

	if (!allowedExtensions.includes(fileExtension)) {
		alert("Formato file non valido");
		$("#newProfilePic").val("");
		return;
	}

	var formData = new FormData();
	formData.append("profilePic", file);

	$.ajax({
		url: "/api/professional/uploadProfilePic",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		headers: {
			pID: id,
			token: localStorage.getItem("token"),
		},
	})
		.done((res) => {
			alert("Immagine profilo aggiornata con successo");
			window.location.reload();
		})
		.fail((err) => {

		});
}

function updateDatiContatto() {
	let intro = $("#data-intro").val();
	let number = $("#data-number").val();

	let fields = { intro: intro, number: number };

	$.ajax({
		url: "/api/professional/updateFields",
		type: "POST",
		data: JSON.stringify({ fields: fields }),
		contentType: "application/json",
		headers: {
			token: localStorage.getItem("token"),
			pID: localStorage.getItem("userID"),
		},
	})
		.done((res) => {
			alert("Introduzione aggiornata con successo");
			window.location.reload();
		})
		.fail((err) => {
			alert(
				"Errore nell'aggiornamento dei dati. Qualche parametro è errato, oppure hai utilizzato una mail già esistente"
			);
		});
}

function updateAboutUs() {
	let aboutUsCopy = $("#data-aboutUs").val();

	let formData = new FormData();
	formData.append("aboutUsCopy", aboutUsCopy);

	$.ajax({
		url: "/api/professional/uploadAboutUs",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		headers: {
			token: localStorage.getItem("token"),
			pID: localStorage.getItem("userID"),
		},
	})
		.done((res) => {
			alert("Informazioni aggiornate con successo");
			window.location.reload();
		})
		.fail((err) => {
			alert(
				"Errore nell'aggiornamento dei dati. Qualche parametro è errato, o c'è stato un errore temporaneo"
			);
		});
}

function checkFile(elemento) {
    var files = elemento.files;
    if (files.length > 6) {
        alert("Puoi selezionare solo fino a 6 elementi.");
        $(elemento).val("");
        return;
    }

    var allowedExtensions = ["jpg", "jpeg", "png", "gif"];

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        var extension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert("Formato file non valido");
            $(elemento).val("");
            return;
        }
    }
}

// function uploadAboutUsGallery() {
function uploadAboutUsGallery(idx) {

    // let files = $('#form-gallery-aboutUs input[type="file"]')[0].files;
    let files = $('.data-aboutUsPhotos input[type="file"]')[idx].files;

    let formData = new FormData();
	
    // for (var i = 0; i < 6; i++) {
    //   if (files[i]) {
    //     formData.append('aboutUsGallery', files[i]);
    //   }
    // }

		formData.append('aboutUsGallery', files[0]);
    
    $.ajax({
        url: "/api/professional/removeAboutUs",
        type: "DELETE",
        processData: false,
        contentType: false,
        headers: {
            token: localStorage.getItem("token"),
            pID: localStorage.getItem("userID"),
						galleryId: idx,
						type: "about"
        },
    }).done((res) => {
			$.ajax({
        url: "/api/professional/uploadAboutUs",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            token: localStorage.getItem("token"),
            pID: localStorage.getItem("userID"),
        },
			}).done((res) => {
					alert("Galleria aggiornata con successo");
					window.location.reload();
			}).fail((err) => {
					alert("C'è stato un errore nell'aggiornamento della galleria");
					window.location.reload();
			});
    }).fail((err) => {
        alert("C'è stato un errore nell'aggiornamento della galleria");
        window.location.reload();
    });
    
}

function uploadSpecializationGallery(idx) {

    // let files = $('#form-gallery-secondary input[type="file"]')[0].files;
    let files = $('.data-specializationGallery input[type="file"]')[idx].files;

    let formData = new FormData();
	
    // for (var i = 0; i < 6; i++) {
    //   if (files[i]) {
    //     formData.append('specializationsGallery', files[i]);
    //   }
    // }

		formData.append('specializationsGallery', files[0]);
    
		$.ajax({
			url: "/api/professional/removeAboutUs",
			type: "DELETE",
			processData: false,
			contentType: false,
			headers: {
					token: localStorage.getItem("token"),
					pID: localStorage.getItem("userID"),
					specializationsGalleryId: idx,
					type: "specialization"
			},
		}).done((res) => {
			$.ajax({
				url: "/api/professional/uploadAboutUs",
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				headers: {
						token: localStorage.getItem("token"),
						pID: localStorage.getItem("userID"),
				},
			}).done((res) => {
					alert("Galleria aggiornata con successo");
					window.location.reload();
			}).fail((err) => {
					alert("C'è stato un errore nell'aggiornamento della galleria");
					window.location.reload();
			});
		}).fail((err) => {
				alert("C'è stato un errore nell'aggiornamento della galleria");
				window.location.reload();
		});
    
}

function removeAboutUsGallery(idx) {
    $.ajax({
        url: "/api/professional/removeAboutUs",
        type: "DELETE",
        processData: false,
        contentType: false,
        headers: {
            token: localStorage.getItem("token"),
            pID: localStorage.getItem("userID"),
						galleryId: idx,
						type: "about"
        },
    }).done((res) => {
			alert("Galleria rimossa con successo");
			window.location.reload();
    }).fail((err) => {
        alert("C'è stato un errore rimozione della galleria");
        window.location.reload();
    });
    
}

function removeSpecializationGallery(idx) {
    
		$.ajax({
			url: "/api/professional/removeAboutUs",
			type: "DELETE",
			processData: false,
			contentType: false,
			headers: {
					token: localStorage.getItem("token"),
					pID: localStorage.getItem("userID"),
					specializationsGalleryId: idx,
					type: "specialization"
			},
		}).done((res) => {
			alert("Galleria rimossa con successo");
			window.location.reload();
		}).fail((err) => {
				alert("C'è stato un errore rimozione della galleria");
				window.location.reload();
		});
    
}