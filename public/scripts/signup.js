window.addEventListener('load', function () {

    $("#confirm_password").on("change", validatePassword);


    $("#form-signup").submit(function (e) {
        e.preventDefault();

        var name = $("#name").val();
        var lastname = $("#lastname").val();
        var email = $("#email").val();
        var password = $("#password").val();

        var securityQuestion = $("#securityQuestion").val();
        var securityAnswer = $("#securityAnswer").val();

        const formData = { name, lastname, email, password, securityQuestion, securityAnswer };

        $.ajax({
            url: '/api/user/signUp',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
        }).done((res) => {

            html_success = `<h4>Registrazione completata</h4>
            <p class="">Verrai reindirizzato tra pochi secondi, e potrai effettuare il login</p>
            `;
            $('.sign-up .card').html(html_success);

            setTimeout(function () { window.location.href = "login.html" }, 1000);


        }).fail((res) => {
            $('.errorBox').html(res.responseJSON.message);
        });

    });


});

function validatePassword() {
    var password = document.getElementById("password")
        , confirm_password = document.getElementById("confirm_password");

    confirm_password.setCustomValidity('');
    if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Le password non coincidono");
    }
}