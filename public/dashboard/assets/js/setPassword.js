$(document).ready(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    var resetToken = urlParams.get('token');

    if(!resetToken){
        alert("Errore. Non hai l'autorizzazione a ripristinare la password.");
        window.location.href = "login.html";}

    validatePassword();

    $('#setNewPassword').on("submit", function (e) {
        e.preventDefault();
        validatePassword();
        setPassword(resetToken);
    });

});

function validatePassword(){
    const password = document.getElementById("password"), 
    confirm_password = document.getElementById("confirm_password");

    password.setCustomValidity('');

    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Le password non coincidono");
    } else {
        confirm_password.setCustomValidity('');
    }
}

function setPassword(resetToken){

    var password = $('#password').val();

    $.ajax({
        url: "/api/businessConsultant/setPassword",
        type: "POST",
        data: JSON.stringify({resetToken, password}),
        contentType: "application/json",
        dataType: "json"
    }).done((response) => {
        alert("Password aggiornata con successo. Sarai reindirizzato al login.");
        window.location.href = "login.html";
    }).fail((error) => {
        alert("Errore nella richiesta. Il tuo token è scaduto, oppure il tuo account è stato disattivato.");
        window.location.href = "resetPassword.html";
    });


}