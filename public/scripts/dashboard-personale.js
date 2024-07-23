window.addEventListener("load", async function () {
	checkLogin();
	await fillPage();

	$("#logout").click(function (e) {
		logout(e);
	});

	$("#deleteAccount").click(function (e) {
		deleteAccount(e);
	});

	$(".removeProfessional").click(function (e) {
    e.preventDefault();
    removeProfessional( $(this).attr('pid') );});
    
});

function logout(e) {
	e.preventDefault();

	$.ajax({
		url: "/api/user/logout",
		type: "POST",
		contentType: "application/json",
		dataType: "json",
		headers: {
			userID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
		},
	})
		.done((userRes) => {
			localStorage.clear();
			alert("Logout effettuato con successo.");
			window.location.href = "index.html";
		})
		.fail((profRes) => {
			alert("Errore nella richiesta, sarai reindirizzato alla homepage.");
			localStorage.clear();
			window.location.href = "index.html";
		});
}

function deleteAccount(e) {
	e.preventDefault();

	$.ajax({
		url: "/api/user/deleteAccount",
		type: "POST",
		contentType: "application/json",
		headers: {
			userID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
		},
	})
		.done((userRes) => {
			localStorage.clear();

			html_template = `<h3>Account eliminato correttamente</h3>
      <p class="mt-3">Verrai reindirizzato alla pagina principale</p>`;
			$(".container").html(html_template);
			setTimeout(function () {
				window.location.href = "index.html";
			}, 1000);
		})
		.fail((userRes) => {
			alert("Errore nella richiesta, per favore aggiorna la pagina.");
		});
}

function checkLogin() {
	if (localStorage.getItem("token") == null) {
		window.location.href = "login.html";
	}
}

function fillPage() {
	return new Promise((resolve, reject) => {
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
				$("#userName").text(res.name);

				var favProfs_html = "";

				res.favouriteProfessionals.forEach((professional) => {
					favProfs_html += `
      <div class="my-3">
      <div class="d-flex align-items-center justify-content-between w-50">

        <a href="profilo.html?id=${professional.pID}" class="ms-2">
          <div class="w-100">
            <p class="semi-bold">${professional.ragioneSociale}</p>
            <p class="intro">${professional.intro}</p>
          </div>

        </a>
          <a pID="${professional.pID}" class="btn btn-danger removeProfessional ms-2 ">Rimuovi</a>

      </div>
    </div> <!-- fine Profs -->
      `;
				});

				if (favProfs_html == "") {
					favProfs_html = `<p class="">Non hai ancora salvato nessun professionista.</p>`;
				}

				$("#favouriteProfessionals").html(favProfs_html);
				resolve();
			})
			.fail((err) => {
				console.log(err);
				alert(
					"Errore nel caricamento pagina, per favore esegui nuovamente il login."
				);
				localStorage.clear();
				window.location.href = "login.html";
				reject();
			});
	});
}

function removeProfessional(professionalID) {
	console.log(professionalID);

  $.ajax({
    url: "/api/user/removeFavouiriteProfessional",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    headers: {
      userID: localStorage.getItem("userID"),
      token: localStorage.getItem("token"),
    },
    data: JSON.stringify({professionalID: professionalID,}),
  }).done((res) => {
    alert("Professionista rimosso con successo.");
    location.reload();
  }).fail((err) => {
    console.log(err);
    alert("Errore nella richiesta, per favore aggiorna la pagina.");
    location.reload();
  });
}
