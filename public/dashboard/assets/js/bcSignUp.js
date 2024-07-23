$(document).ready(function () {
	$("#bcSignUp").on("submit", function (e) {
		e.preventDefault();

		$.ajax({
			type: "POST",
			url: "/api/businessConsultant/signUp",
			data: new FormData(e.target),
			processData: false, 
			contentType: false, 
		})
			.done(function (data) {
				alert("Registrazione Avvenuta con successo");
				window.location.href = "/dashboard/login.html";
			})
			.fail(function (err) {
            if(err.responseJSON.status == 400){
              $('#messageBox').html(`<p class="text-danger">Alcuni dati sono incompleti</p>`)
            } else if(err.responseJSON.status == 406){
              $('#messageBox').html(`<p class="text-danger">Impossibile registrare. Professionista probabilmente già registrato</p>`)
            }
			});
	});
});
