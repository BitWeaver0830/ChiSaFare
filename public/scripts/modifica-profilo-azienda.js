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

	for (let i = 0; i < 5; i++) {
		if (data.aboutUsGallery[i]) {
			path = data.aboutUsGallery[i];
			photoTemplate = `
            <div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
                <img class="img-fluid my-3 my-md-0" id="data-aboutUsPhotos-${
									i + 1
								}" src="${path}" alt=""/>

            </div>`;
		} else {
			photoTemplate = `
            <div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
                <img class="img-fluid my-3 my-md-0 no-photo" id="data-aboutUsPhotos-${
									i + 1
								}" src="../images/placeholder.png" alt=""/>
            </div>`;
		}
		$(".data-aboutUsPhotos").append(photoTemplate);
	}
	let inputAndSave_aboutUS = `
    <input type="file" id="data-aboutUsPhotos-input" multiple>
    <input type="submit" class="text-decoration-underline" value="Salva">`;
	$(".data-aboutUsPhotos").append(inputAndSave_aboutUS);


	for (let i = 0; i < 5; i++) {
		if (data.specializationsGallery[i]) {
			path = data.specializationsGallery[i];
			photoTemplate = `
            <div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
                <img class="img-fluid my-3 my-md-0" id="data-specializationPhotos-${
									i + 1
								}" src="${path}" alt=""/>

            </div>`;
		} else {
			photoTemplate = `
            <div class="photo-container col-12 col-md-6 col-lg-4 p-2 d-flex justify-content-center">
                <img class="img-fluid my-3 my-md-0 no-photo" id="data-specializationPhotos-${
									i + 1
								}" src="../images/placeholder.png" alt=""/>
            </div>`;
		}
		$(".data-specializationGallery").append(photoTemplate);
	}
	let inputAndSave_specializzazioni = `
    <input type="file" id="data-specializationPhotos-input" multiple>
    <input type="submit" class="text-decoration-underline" value="Salva">`;
	$(".data-specializationGallery").append(inputAndSave_specializzazioni);
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
    if (files.length > 5) {
        alert("Puoi selezionare solo fino a 5 elementi.");
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

function uploadAboutUsGallery() {

    let files = $('#form-gallery-aboutUs input[type="file"]')[0].files;

    let formData = new FormData();
	
    for (var i = 0; i < 5; i++) {
      if (files[i]) {
        formData.append('aboutUsGallery', files[i]);
      }
    }
    
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
    
}

function uploadSpecializationGallery() {

    let files = $('#form-gallery-secondary input[type="file"]')[0].files;

    let formData = new FormData();
	
    for (var i = 0; i < 5; i++) {
      if (files[i]) {
        formData.append('specializationsGallery', files[i]);
      }
    }
    
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
    
}