$(document).ready(function () {

    $("#form-login").submit(function (e) {
        e.preventDefault();

        var email = $("#email").val();
        var password = $("#password").val();
    
        data = {email, password};

        $.ajax({
            type:"POST",
            url:"/api/businessConsultant/login",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
        }).done(function(data){

            localStorage.setItem("type", "businessConsultant");
            localStorage.setItem("id", data.bcID);
            localStorage.setItem("dashboard-token", data.token);
            localStorage.setItem("name", data.name);
            localStorage.setItem("lastname", data.lastname);

            window.location.href = "/dashboard/professionisti.html";
        }).fail(function(err){
            console.log(err)
            alert("Errore nel login, per favore riprova o assicurati di essere registrato");
        });
    });
});