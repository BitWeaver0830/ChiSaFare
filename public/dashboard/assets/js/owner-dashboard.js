$(document).ready(function () {
	initialize();

	fillGraphs();

	$("#dateFrom").change(function () {
		if ($("#dateFrom").val() > $("#dateTo").val()) {
			$("#dateTo").val($("#dateFrom").val());
		}
		console.log($("#dateFrom").val());
		fillGraphs();
	});

	$("#dateTo").change(function () {
		if ($("#dateFrom").val() > $("#dateTo").val()) {
			$("#dateFrom").val($("#dateTo").val());
		}
		console.log($("#dateFrom").val());
		fillGraphs();
	});
});

function initialize() {
	var today = new Date();
	var lastWeek = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() - 7
	);

	var endDate =
		today.getFullYear() +
		"-" +
		(today.getMonth() + 1).toLocaleString("it-IT", {
			minimumIntegerDigits: 2,
		}) +
		"-" +
		today.getDate().toLocaleString("it-IT", { minimumIntegerDigits: 2 });

	var startDate =
		lastWeek.getFullYear() +
		"-" +
		(lastWeek.getMonth() + 1).toLocaleString("it-IT", {
			minimumIntegerDigits: 2,
		}) +
		"-" +
		lastWeek.getDate().toLocaleString("it-IT", { minimumIntegerDigits: 2 });

	document.getElementById("dateFrom").value = startDate;
	document.getElementById("dateTo").value = endDate;

}

function dateForLabels(response) {
	var labels = response.map(function (item) {
		var value = String(item.date);
		var year = value.split("-")[0];
		var month = value.split("-")[1];
		var day = value.split("-")[2];
		return day + "/" + month + "/" + year;
	});
	return labels;
}

function fillGraphs() {
	profPerDay();
	profTot();
	earnPeriod();
	earnAnnual();
	totalToPay();
	atecoPerformanceChart();
	commPeriod();
	commTot();
}

function profPerDay() {
	var dateFrom = $("#dateFrom").val();
	var dateTo = $("#dateTo").val();

	$.ajax({
		type: "GET",
		url: "/api/dashboard/getProfessionalsPerDate",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
			from: dateFrom,
			to: dateTo,
		},
	})
		.done((response) => {
			var labels = dateForLabels(response);
			var values = response.map(function (item) {
				return item.count;
			});

			var chartConfig = {
				type: "line",
				data: {
					labels: labels,
					datasets: [
						{
							label: "Valori",
							data: values,
							backgroundColor: "rgba(0, 123, 255, 0.5)",
							borderColor: "rgba(0, 123, 255, 1)",
							borderWidth: 1,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
				},
			};

			var chartElement = $("#profPerDayChart");

			var chart = new Chart(chartElement, chartConfig);

			$("#profPeriodInfo").text(
				values.reduce((partialSum, a) => partialSum + a, 0)
			);
		})
		.fail((err) => {
			alert("Errore nei professionisti per giorno");
			console.log(err);
		});
}

function profTot() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAllProfessionals",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((response) => {
			$('#profTotInfo').text(response.length);

			var notActive =[]
			response.map(function (item) {
				if(item.profileStatus.status == "non attivo"){
					notActive.push(item)
				}
			});
			
			$('#profNotActiveInfo').text(notActive.length);
			ListproNotActive(notActive);
		})
		.fail((err) => {
			alert("Errore nei professionisti totali");
			console.log(err);
		});
}

function earnPeriod() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAllIncomeInInterval",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
			from: $("#dateFrom").val(),
			to: $("#dateTo").val(),
		},
	})
		.done((response) => {
			$("#earnPeriodInfo").text("€" + response.amount);
		})
		.fail((err) => {
			alert("Errore nei guadagni per periodo");
			console.log(err);
		});
}

function earnAnnual() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAnnualIncome",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((response) => {
			$("#earnAnnualInfo").text("€" + response.amount);
		})
		.fail((err) => {
			alert("Errore nei guadagni annuali");
			console.log(err);
		});
}

function totalToPay() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAmountToPay",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((response) => {
			$("#totalToPay").text("€" + response.amount);
		})
		.fail((err) => {
			alert("Errore nel totale da pagare");
			console.log(err);
		});
}

function atecoPerformanceChart() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getMostPerformantAteco",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	})
		.done((response) => {


			var values = response.map(function (item) {
				return item.professionals;
			});

			var labels = response.map((item) => {
				return item.code + " - " + item.detail;
			});


			const chartConfig = {
				labels: labels,
				datasets: [
					{
						data: values,
						backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
						borderColor: ["#ffffff", "#ffffff", "#ffffff"],
					},
				],
				options: {
					maintainAspectRatio: true,
					legend: {
						display: false,
						labels: {
							fontStyle: "normal",
						},
						title: {
							fontStyle: "normal",
						},
					},
				},

			};

			const ctx = document.getElementById('atecoPerformanceChart').getContext('2d');
			new Chart(ctx, {
  			type: 'doughnut',
  			data: chartConfig
});
		})
		.fail((err) => {
			alert("Errore nelle performance Ateco");
			console.log(err);
		});
}

function commPeriod() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAllBusinessConsultants",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
			from: $("#dateFrom").val(),
			to: $("#dateTo").val(),
		},
	}).done((response) => {
		$("#commPeriodInfo").text(response.count);
	}).fail((err) => {
		alert("Errore nei commercialisti per periodo");
		console.log(err);
	});
}

function commTot() {
	$.ajax({
		type: "GET",
		url: "/api/dashboard/getAllBusinessConsultants",
		contentType: "application/json",
		headers: {
			aID: localStorage.getItem("id"),
			token: localStorage.getItem("dashboard-token"),
		},
	}).done((response) => {
		$("#commTotalInfo").text(response.count);
	}).fail((err) => {
		alert("Errore nei commercialisti per periodo");
		console.log(err);
	});
}

function ListproNotActive(notActive) {


	
	var table = $("#proNotActiveList");
	table.empty();
	table.append(`
	<thead>
		<tr>
			<th>Ragione Sociale</th>
			<th>P.Iva</th>
			<th>Address</th>
			<th>Category</th>
		</tr>
	</thead>`);
	table.append("<tbody>");



	notActive.forEach((professional) => {
		table.append(`
		<tr>
		<td>${professional.ragioneSociale}</td>
		<td>${professional.pIva}</td>
		<td>${professional.address}</td>
		<td>${professional.category}</td>
		</tr>
		`);

	});

}
