$(document).ready(function () {
	$("#dateStart").change(function () {
		var today = new Date();
		if ($("#dateStart").val() > today.toISOString().slice(0, 10)) {
			$("#dateStart").val(today.toISOString().slice(0, 10));
		}
		if ($("#dateStart").val() > $("#dateEnd").val()) {
			$("#dateEnd").val($("#dateStart").val());
		}
	});

	$("#dateEnd").change(function () {
		var today = new Date();
		if ($("#dateEnd").val() > today.toISOString().slice(0, 10)) {
			$("#dateEnd").val(today.toISOString().slice(0, 10));
		}
		if ($("#dateStart").val() > $("#dateEnd").val()) {
			$("#dateStart").val($("#dateEnd").val());
		}
	});

	$("#generateReport").click(function () {
		var dateStart = $("#dateStart").val();
		var dateEnd = $("#dateEnd").val();

		if (dateStart != "" || dateEnd != "") {
		generateReport(dateStart, dateEnd);
        } else {
			alert("Inserire una data valida");
		}
	});
});

function generateReport(dateStart, dateEnd) {
	$.ajax({
		url: "/api/dashboard/getAndGenerateReport",
		type: "GET",
		contentType: "application/json",
		headers: {
			from: dateStart,
			to: dateEnd,
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((response) => {
			console.log(response);


  const filePath = response.path;
  
  const downloadLink = document.createElement('a');
  
  downloadLink.href = filePath;
  
  downloadLink.download = 'report.csv';
  
  downloadLink.click();
  
  
		})
		.fail((error) => {
			alert("Errore nella generazione del report");
			console.log(error);
		});
}
