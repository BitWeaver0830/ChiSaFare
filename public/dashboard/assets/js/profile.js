$(document).ready(async function () {
  var data = null;

  if(localStorage.getItem("type") != "owner"){
    data = await listConsultant();
  } else {
    data = await fetchAdmin();
  }

  if (data && data.email) {
		fillStatic(data);
	} else if (data && data.length > 0) {
		fillStatic(data[0]);
	} else {
		alert("Amministratore non esiste");
		window.location.href = "login.html";
	}

	$("#updatePro").on("submit", function (e) {
		updatePro(e);
	});
});

function fetchAdmin() {
	return new Promise(function (resolve, reject) {
		var url = "/api/admin/getAdmin";

		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			headers: {
				aID: localStorage.getItem("id"),
				token: localStorage.getItem("dashboard-token"),
			},
		})
			.done(function (data) {
				resolve(data);
			})
			.fail(function (error) {
				alert("Errore nel caricamento dei dati");
				reject(error);
			});
	});
}

function listConsultant() {
  return new Promise(function (resolve, reject) {
    var url = "/api/businessConsultant/getBusinessConsultant";

    $.ajax({
      method: "GET",
      url: url,
      contentType: "application/json",
      headers: {
        bcID: localStorage.getItem("id"),
        token: localStorage.getItem("dashboard-token"),
      },
    })
      .done(function (data) {
        resolve(data);
      })
      .fail(function (err) {
				alert("Errore nel caricamento dei dati");
				reject(err);
      });
  });
}

function fillStatic(admin) {

	var $name = $("#bc-name");
	if (admin.name)
		$name.val(admin.name);
	else
		$name.closest('.col').hide();
	
	var $lastname = $("#bc-lastname");
	if (admin.lastname)
		$lastname.val(admin.lastname);
	else
		$lastname.closest('.col').hide();

	var $address = $("#bc-address");
	if (admin.address)
		$address.val(admin.address);
	else
		$address.closest('.col').hide();

	var $city = $("#bc-city");
	if (admin.city)
		$city.val(admin.city);
	else
		$city.closest('.col').hide();

	var $province = $("#bc-province");
	if (admin.province)
		$province.val(admin.province);
	else
		$province.closest('.col').hide();

	var $email = $("#bc-email");
	if (admin.email)
		$email.val(admin.email);
	else
		$email.closest('.col').hide();

	var $pIva = $("#bc-pIva");
	if (admin.iva)
		$pIva.val(admin.iva);
	else
		$pIva.closest('.col').hide();

	var $iban = $("#bc-iban");
	if (admin.iban)
		$iban.val(admin.iban);
	else
		$iban.closest('.col').hide();

}
