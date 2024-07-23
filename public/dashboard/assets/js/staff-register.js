$(document).ready(function () {
    
    $("#RepeatPasswordInput").on("change", validatePassword);


    $("#signupForm").submit(function(e){
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        var signUpToken = urlParams.get('signupToken');
    
        if (signUpToken != null) {
            
            var email = $("#InputEmail").val();
            var password = $("#PasswordInput").val();
            var securityQuestion = $("#securityQuestions").val();
            var securityAnswer = $("#securityAnswer").val();
    
            if(email != "" && email != null &&
            password != "" && password != null &&
            securityQuestion != "" && securityQuestion != null &&
            securityAnswer != "" && securityAnswer != null ){

                var data = { email: email, password: password, securityQuestion: securityQuestion, securityAnswer: securityAnswer, signUpToken: signUpToken };
                
                $.ajax({
                    type: "POST",
                    url: "/api/admin/staffSignUp",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    headers:{
                        signUpToken: signUpToken,
                    }
                })
                .done((res) => {
                    alert("Registrazione avvenuta con successo. Verrai reindirizzato alla pagina di login.");
                    window.location.href = "admin-login.html";

                }).fail((res) => {
                    alert("Errore. Per favore ripeti la procedura di registrazione.");
                });


            } else {
                alert("Per favore inserisci tutti i campi");
            }

        }else{
            alert("Errore. Il tuo token non è più valido. Per favore richiedi nuovamente l'invito.");
            window.location.href = "admin-login.html";
        }
    });

});

function validatePassword(){
    var password = document.getElementById("PasswordInput")
    , confirm_password = document.getElementById("RepeatPasswordInput");
    
    confirm_password.setCustomValidity('');
    
    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Le password non coincidono");
    } 
}