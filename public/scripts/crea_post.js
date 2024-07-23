window.addEventListener("load", async function () {

	$('#form-crea_post input[type="file"]').on("change", function () {
        checkFile(this);
	});
	$("#form-crea_post").on("submit", function (e) {
		e.preventDefault();
		creaPost();
	});

});


function checkFile(elemento) {

	var file = elemento.files[0];

	var extension = file.name.split(".").pop().toLowerCase();

	var allowedExtensions = ["jpg", "jpeg", "png"];

	if (!allowedExtensions.includes(extension)) {
		alert("Formato file non valido");
		$(elemento).val("");
		return;
	}
}

function creaPost() {
	let image = $("#crea_post-imageUpload")[0].files[0];
	let copy = $("#crea_post-textarea").val();


	if (!copy || copy.length == 0) {
		alert("Devi inserire un testo");
		return;
	} else if (copy.length > 1000) {
		alert("Il testo deve essere lungo massimo 1000 caratteri");
		return;
	}

	if (!image) {
		alert("Devi inserire un'immagine");
		return;
	}

	let formData = new FormData();
	formData.append("image", image);
	formData.append("copy", copy);

	$.ajax({
		url: "/api/social/createPost",
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
			alert("Post creato con successo");
			window.location.reload();
		})
		.fail((err) => {
			alert("C'è stato un errore nella creazione del post");
			window.location.reload();
		});
}
