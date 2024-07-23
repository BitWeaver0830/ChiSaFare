$(document).ready(function () {
	addStaff();
	$("#listStaffModal").on("shown.bs.modal", function (e) {
		listStaff();
	});
});

function addStaff() {
	$("#addStaffSubmit").click(function () {
		if (validateEmail()) {
			var staffMail = $("#addStaffEmail").val();
			const data = { staffMail };
			$.ajax({
				method: "POST",
				url: "/api/admin/setStaff",
				contentType: "application/json",
				data: JSON.stringify(data),
				headers: {
					aID: localStorage.getItem("id"),
					token: localStorage.getItem("dashboard-token"),
				},
			})
				.done(function (data) {
					alert("Professionista invitato con successo");
					$("#addStaffEmail").val("");
					$("#addStaffModal").modal("hide");
				})
				.fail(function (data) {
					alert("Errore, impossibile aggiungere professionista");
				});
		} else {
			alert("Email non valida");
		}
	});
}

function validateEmail() {
	var email = $("#addStaffEmail").val();
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

	if (emailReg.test(email)) {
		return true;
	} else {
		return false;
	}
}

function listStaff() {
	var url = "/api/admin/getAllStaff";

	$.ajax({
		method: "POST",
		url: url,
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done(function (data) {
			fillTable(data);
		})
		.fail(function (err) {
			console.log(err);
		});
}

function fillTable(data) {
	var table = $("#listStaffTable");
	table.empty();
	table.append("<thead><tr><th >Email</th><th >Elimina</th></tr></thead>");
	table.append("<tbody>");
	for (var i = 0; i < data.length; i++) {
		table.append(
			`<tr><td>${data[i].email}</td><td><button class='btn btn-danger deleteStaff' staffID="${data[i]._id}">Elimina</button></td></tr>`
		);
	}
	table.append("</tbody>");

    $(".deleteStaff").click(function () {
        var staffID = $(this).attr("staffID");
        deleteStaff(staffID);
    });
}

function deleteStaff(sID){

    $.ajax({
        method: "POST",
        url: "/api/admin/removeStaff",
        contentType: "application/json",
        data: JSON.stringify({sID}),
        headers: {
            aID: localStorage.getItem("id"),
            token: localStorage.getItem("dashboard-token"),
        },
    }).done(function (data) {
        alert("Professionista eliminato con successo");
        listStaff();
    }).fail(function (err) {
        alert("Errore, per favore riprovare");
        location.reload();
    });

}