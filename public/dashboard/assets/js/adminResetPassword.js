$(document).ready(function () {
    
    $('#requestSecurityQuestion').on("submit", function (e) {
        e.preventDefault();
        getSecurityQuestion();
    });


});

function getSecurityQuestion(){

    var email = $('#email').val();

    $.ajax({
        url: "/api/admin/getStaffSecurityQuestion",
        type: "GET",
        headers:{
            "email": email
        },
        dataType: "json"
    }).done((response) => {
        getNewForm(response.securityQuestion, email);
    }).fail((error) => {
        alert("Errore nel caricamento dei dati. Potrebbe non esserci alcun account associato a questo indirizzo.");
        console.log(error);
    });
}

function getNewForm(securityQuestion, email){

    var template_form = `
    <div class="text-center mb-3">
    <p id="securityQuestion" class="text-center text-dark">${securityQuestion}</p>
    </div>
    <div class="mb-3"><input class="form-control form-control-user" type="text" id="securityAnswer" aria-describedby="securityAnswer" placeholder="Risposta" name="securityAnswer"></div>
    <button id="submitSecurityAnswer" class="btn btn-primary d-block btn-user w-100" type="submit">Reset Password</button>
    `;

    $("#requestSecurityQuestion").html(template_form);


    $('#submitSecurityAnswer').on("click", function (e) {
        e.preventDefault();
        resetPassword(email);
    });
}

function resetPassword(email){

    $.ajax({
        url: "/api/admin/staffResetPassword",
        type: "POST",
        headers:{
            "email": email,
            securityAnswer: $('#securityAnswer').val(),
            securityQuestion: $('#securityQuestion').text()
        } ,  
    }).done((response) => {

        var template_answer = `
        <div class="text-center">
            <h4 class="text-dark mb-2">Password dimenticata</h4>
            <p class="text-dark mb-4">Password resettata con successo.<br>Ti Abbiamo inviato una mail per proseguire.</p>
        </div>
        `;


        $("#content").html(template_answer);

        setTimeout(function () {
            localStorage.clear();
            window.location.href = "admin-login.html";
        }, 3000);

    }).fail((error) => {
        $('.messageBox').html(`
        <p class="text-danger text-center">Errore nella risposta di sicurezza.</p>
        `);
    });


}