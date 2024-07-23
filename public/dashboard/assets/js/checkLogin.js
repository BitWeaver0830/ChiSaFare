$(document).ready(function () {
	if (localStorage.getItem("dashboard-token") == null) {
		window.location.href = "login.html";
	}

	if(localStorage.getItem("type") != "owner"){
			$("#list-dashboard").hide();
	}

	if(localStorage.getItem("type") == "staff")$("#accordionSidebar").hide();

	if( 
		localStorage.getItem("name") != null &&
		localStorage.getItem("name") != "" &&
		localStorage.getItem("lastname") != null &&
		localStorage.getItem("name") != "" ){
		$("#username").text(localStorage.getItem("name") + " " + localStorage.getItem("lastname"));
		}
		else if(localStorage.getItem("type") == "staff"){
			$("#username").text("Staff");
		} else{
			$("#username").text("Amministratore");
		}
	$("#name").text(localStorage.getItem("name"));

	$("#logout").click(function () {
		logout();
	});

});

function logout() {
	id = localStorage.getItem("id");
	token = localStorage.getItem("dashboard-token");
	var url = "";
	

	switch (localStorage.getItem("type")) {
		case "owner":
			url = "/api/admin/ownerLogout";
			$.ajax({
				type: "POST",
				url: url,
				headers: {
					aID: id,
					token: token,
				},
			})
				.done((res) => {
					localStorage.clear();
					window.location.href = "admin-login.html";
				})
				.fail((res) => {
                    console.log(res);
                    alert("Errore (Da owner). Sarai disconesso comunque.");
					localStorage.clear();
					window.location.href = "admin-login.html";
				});
			break;

		case "staff":
			url = "/api/admin/staffLogout";
			$.ajax({
				type: "POST",
				url: url,
				headers: {
					aID: id,
					token: token,
				},
			})
				.done((res) => {
					localStorage.clear();
					window.location.href = "admin-login.html";
				})
				.fail((res) => {
					alert("Errore (Da Admin). Sarai disconesso comunque.");
					localStorage.clear();
					window.location.href = "admin-login.html";
				});
			break;

		case "businessConsultant":
			url = "/api/businessConsultant/logout";
			$.ajax({
				type: "POST",
				url: url,
				headers: {
					bcID: id,
					token: token,
				},
			})
				.done((res) => {
					localStorage.clear();
					window.location.href = "login.html";
				})
				.fail((res) => {
					localStorage.clear();
					alert("Errore. Sarai disconesso comunque.");
					window.location.href = "login.html";
				});
			break;

		default:
			console.log(localStorage.getItem("type"));
			alert("Errore. Sarai disconesso comunque.");
			localStorage.clear();
			window.location.href = "login.html";
			break;
	}
}
