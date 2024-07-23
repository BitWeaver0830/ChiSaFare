$(document).ready(async function () {
	fillCaterogySelect()

	let professionals = await getProfessionals()
	let businessConsultants = await getBCs()
	let users = await getUsers()

	let data = []

	data = data.concat(professionals, businessConsultants, users)
	addNavigator(data)
	fillTable(data)

	$("#ricerca-categoria").on("change", function () {
		console.log($("#ricerca-categoria").val())

		if ($("#ricerca-categoria").val() == "all") {
			data = []
			data = data.concat(professionals, businessConsultants, users)
		} else if ($("#ricerca-categoria").val() == "businessConsultant") {
			data = businessConsultants
		} else if ($("#ricerca-categoria").val() == "users") {
			data = users
		} else if ($("#ricerca-categoria").val() == "professionisti") {
			data = professionals
		}
		addNavigator(data)
		fillTable(data)
	})

	$(".rowClickable").on("click", function () {
		var id = $(this).attr("proID")
		var proToShow = data.find((element) => {
			return element._id == id
		})
		fillPreviewModal(proToShow)
	})
})

function fillCaterogySelect() {
	var selectTemplate = ""

	if (
		localStorage.getItem("type") == "staff" ||
		localStorage.getItem("type") == "owner"
	) {
		selectTemplate += `
        <optgroup label="Staff">
            <option value="all" selected="">All</option>
            <option value="businessConsultant">Commercialisti</option>
            <option value="users">Users</option>
        </optgroup>
        `
	}
	selectTemplate += `
    <optgroup label="Commercialisti">
    <option value="professionisti">Professionisti</option>
    </optgroup>
    `

	$("#ricerca-categoria").html(selectTemplate)
}

async function getProfessionals() {
	var professionals = []

	await $.ajax({
		url: "/api/dashboard/getAllProfessionals",
		type: "GET",
		contentType: "application/json",
		headers: {
			token: localStorage.getItem("dashboard-token"),
			aID: localStorage.getItem("id"),
		},
	})
		.done((response) => {
			response.forEach((professional) => {
				profObject = {}
				profObject._id = professional._id
				profObject.type = "Professionista"
				profObject.ragioneSociale = professional.ragioneSociale
				profObject.pIva = professional.pIva
				profObject.email = professional.email
				profObject.number = professional.number
				profObject.address = professional.address
				profObject.city = professional.city
				profObject.cap = professional.cap
				profObject.province = professional.province
				profObject.category = professional.category
				profObject.profileStatus = professional.profileStatus
				profObject.durcExp = professional.durcExp
				profObject.insuranceExp = professional.insuranceExp
				profObject.visuraExp = professional.visuraExp
				professionals.push(profObject)
			})
		})
		.fail((xhr) => {
			console.log(xhr)
		})

	return professionals
}

async function getBCs() {
	var bcs = []

	await $.ajax({
		url: "/api/dashboard/getAllBusinessConsultantsDetailed",
		type: "GET",
		contentType: "application/json",
		headers: {
			token: localStorage.getItem("dashboard-token"),
			aID: localStorage.getItem("id"),
		},
	})
		.done((response) => {
			response.bc.forEach((businessConsultant) => {
				bcObject = {}
				bcObject._id = businessConsultant._id
				bcObject.type = "Commercialista"
				bcObject.name = businessConsultant.name
				bcObject.lastname = businessConsultant.lastname
				bcObject.email = businessConsultant.email
				bcObject.pIva = businessConsultant.pIva
				bcObject.iban = businessConsultant.iban
				bcObject.address = businessConsultant.address
				bcObject.city = businessConsultant.city
				bcObject.province = businessConsultant.province
				bcObject.selfCertified = businessConsultant.selfCertified
				bcObject.signUpDate = businessConsultant.signUpDate
				bcs.push(bcObject)
			})
		})
		.fail((err) => {
			alert("Errore nel caricamento dei dati dei commercialisti")
			console.log(err)
		})

	bcs.sort((a, b) => {
		return new Date(b.signUpDate) - new Date(a.signUpDate)
	})

	return bcs
}

async function getUsers() {
	var users = []

	await $.ajax({
		url: "/api/dashboard/getAllUsersDetailed",
		type: "GET",
		contentType: "application/json",
		headers: {
			token: localStorage.getItem("dashboard-token"),
			aID: localStorage.getItem("id"),
		},
	})
		.done((response) => {
			response.users.forEach((user) => {
				userObject = {}
				userObject._id = user._id
				userObject.type = "Utente"
				userObject.name = user.name
				userObject.lastname = user.lastname
				userObject.email = user.email
				userObject.signUpDate = user.signUpDate
				users.push(userObject)
			})
		})
		.fail((err) => {
			alert("Errore nel caricamento dei dati degli utenti")
			console.log(err)
		})

	users.sort((a, b) => {
		return new Date(b.signUpDate) - new Date(a.signUpDate)
	})

	return users
}

function addNavigator(data) {
	var number = data.length
	if (number == 0) {
		$("#tableNavigator").html("")
		var emptyTemplate = `
		<p>Nessun Professionista Trovato</p>
		`
		$("#dataTable").html(emptyTemplate)
		return
	}

	let neededPages = Math.floor(number / 5) + 1
	let template = `<li class="page-item active"><a class="page-link" href="#">1</a></li>`

	for (let i = 2; i <= neededPages; i++) {
		template += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
	}
	$(".pagination").html(template)
	$(".pagination li").on("click", function () {
		$(".pagination li").removeClass("active")
		$(this).addClass("active")
		fillTable(data)
	})
}

function fillTable(data) {
	var template_html = ""

	var currentPage = $(".pagination .active a").text()
	var startIndex = (currentPage - 1) * 5
	var endIndex
	if (startIndex + 5 > data.length) {
		endIndex = data.length
	} else {
		endIndex = startIndex + 5
	}

	var paginatedData = data.slice(startIndex, endIndex)

	$(".allResults").text(data.length)
	$(".currentResultsRange").text(`${startIndex + 1} - ${endIndex}`)

	paginatedData.forEach((element) => {
		template_html += `

	<tr class="rowClickable" proID="${element._id}">`

		if (element.type == "Professionista") {
			template_html += `<td>${element.ragioneSociale}</td>`
		} else {
			template_html += `<td>${element.name + " " + element.lastname}</td>`
		}
		template_html += `<td>${element.type}</td>`

		if (element.city != null && element.province != null) {
			template_html += `<td>${element.city + ", " + element.province}</td>`
		} else {
			template_html += `<td>---</td>`
		}

		template_html += `<td>${element.email}</td>`

		if (element.type != "Utente") {
			template_html += `<td>${element.pIva}</td>`
		} else {
			template_html += `<td>---</td>`
		}
		template_html += `</tr>`
	}) 
	$("#tableBody").html(template_html)
}

function fillPreviewModal(user) {
	let template_html = ""

	if (user.type == "Utente") {
		template_html += `
		<div class="row">
			<div class="col-12">
				<h5 class="semi-bold">Nome</h5>
				<p>${user.name}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Cognome</h5>
				<p>${user.lastname}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Email</h5>
				<p>${user.email}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Data di registrazione</h5>
				<p>${new Date(user.signUpDate)}</p>
			</div>
		</div>
		`
	} else if (user.type == "Commercialista") {
		template_html += `
		<div class="row">
			<div class="col-12">
				<h5 class="semi-bold">Nome</h5>
				<p>${user.name}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Cognome</h5>
				<p>${user.lastname}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Email</h5>
				<p>${user.email}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Partita Iva</h5>
				<p>${user.pIva}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Iban</h5>
				<p>${user.iban}</p>
			</div>
						<div class="col-12">
				<h5 class="semi-bold">Città</h5>
				<p>${user.city}</p>
			</div>
						<div class="col-12">
				<h5 class="semi-bold">Indirizzo</h5>
				<p>${user.address}</p>
			</div>
						<div class="col-12">
				<h5 class="semi-bold">Provincia</h5>
				<p>${user.province}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Autocertificazione</h5>
				<a href="${user.selfCertified}" target="_blank">Scarica Autocertificazione</a>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Data di registrazione</h5>
				<p>${new Date(user.signUpDate)}</p>
			</div>
		</div>
		`
	} else if (user.type == "Professionista") {
		template_html += `
		<div class="row">
			<div class="col-12">
				<h5 class="semi-bold">Ragione Sociale</h5>
				<p>${user.ragioneSociale}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Partita Iva</h5>
				<p>${user.pIva}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Categoria</h5>
				<p>${user.category}</p>
			</div>
			<div class="col-12">
				<h5 class="semi-bold">Email</h5>
				<p>${user.email}</p>
			</div>
						<div class="col-12">
				<h5 class="semi-bold">Indirizzo</h5>
				<p>${user.address}</p>
			</div>

						<div class="col-12">
				<h5 class="semi-bold">Città</h5>
				<p>${user.city}</p>
			</div>
									<div class="col-12">
				<h5 class="semi-bold">CAP</h5>
				<p>${user.cap}</p>
			</div>

												<div class="col-12">
				<h5 class="semi-bold">Provincia</h5>
				<p>${user.province}</p>
			</div>

															<div class="col-12">
				<h5 class="semi-bold">Numero di telefono</h5>
				<p>${user.number}</p>
			</div>

			<div class="col-12">
				<h5 class="semi-bold">Status: ${user.profileStatus.status}</h5>
				<p>Scadenza registrazione:<br> ${new Date(user.profileStatus.exp)}</p>
			</div>

			<div class="col-12">
				<h5 class="semi-bold">Scadenza Assicurazione</h5>
				<p>${new Date(user.insuranceExp)}</p>
			</div>

			<div class="col-12">
				<h5 class="semi-bold">Scadenza Visura</h5>
				<p>${new Date(user.visuraExp)}</p>
			</div>

			<div class="col-12">
				<h5 class="semi-bold">Scadenza DURC</h5>
				<p>${new Date(user.durcExp)}</p>
			</div>
		</div>
		`
	} else {
		alert("Errore nel caricamento dei dati. La pagina verrà riaggiornata")
		location.reload()
	}

	$("#previewDataModal .modal-body").html(template_html)
	$("#previewDataModal").modal("show")
}
