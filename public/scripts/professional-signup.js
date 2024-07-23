$(document).ready(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    var token = urlParams.get('token');
    var id = urlParams.get('id');

    if(token == null) {
        alert("Token non presente o scaduto. Assicurati di aver seguito il link ricevuto via email, o che la tua richiesta non sia scaduta.")
        window.location.href = "index.html";
    }

    $("#form-signup").submit(function (event) {
        event.preventDefault();
        if(validate()) {
            register(token,id);
        }
    });

});

function validate(){
    var number = document.getElementById("number").value;
    if(number == "" || number == null) {
        alert("Inserisci un numero di telefono!");
        return false;
    }

    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm_password").value;
    if(password != confirmPassword) {
        alert("Le password non coincidono!");
        return false;
    }

    var securityQuestion = document.getElementById("securityQuestion").value;
    if(securityQuestion == "" || securityQuestion == null) {
        alert("Inserisci una domanda di sicurezza!");
        return false;
    }

    var securityAnswer = document.getElementById("securityAnswer").value;
    if(securityAnswer == "" || securityAnswer == null) {
        alert("Inserisci una risposta alla domanda di sicurezza!");
        return false;
    }

    var intro = document.getElementById("intro").value;
    if(intro == "" || intro == null ) {
        alert("Inserisci una breve introduzione su di te!");
        return false;
    }

    return true;
}

function register(signUpToken,id){

    var number = document.getElementById("number").value;
    var password = document.getElementById("password").value;
    var securityQuestion = document.getElementById("securityQuestion").value;
    var securityAnswer = document.getElementById("securityAnswer").value;
    var intro = document.getElementById("intro").value;

    var data = { signUpToken, number, password, securityQuestion, securityAnswer, intro };

    $.ajax({
        type: "POST",
        url: "/api/professional/signUp",
        data: JSON.stringify(data),
        contentType: "application/json",
    }).done( (response) => {
        console.log(response);
        alert("Registrazione avvenuta con successo! Ora attivare il profilo ed effettuare il login.");
        window.location.href = "professionalActivate.html?id="+id;
    }).fail((error) => {
        console.log(error);
        alert("Errore durante la registrazione. Per favore riprova nuovamente dal link nella tua mail.");
    });

}