window.addEventListener("load", function () {

    $("#confirm_password").on("change", validatePassword);

    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    $("#form-setPassword").submit(function (e) {
        e.preventDefault();

        var password = $("#password").val();

        const data = { password, resetToken };

        $.ajax({
            url: "/api/professional/setPassword",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
          })
            .done((res) => {
                var html_template = `
                <h4>Password aggiornata correttamente</h4>
                <p class="mt-3">Verrai reindirizzato alla pagina di login</p>`;
                $(".card").html(html_template);

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1000);
                
            })
            .fail((res) => {
                var html_template = `
                <h4>Errore nell'aggiornamento della password</h4>
                <p class="mt-3">Verrai reindirizzato alla pagina di ripristino, per favore ripeti la procedura</p>`;
                $(".card").html(html_template);

                setTimeout(function () {
                    window.location.href = "professional-reset-password.html";
                }, 1000);
            });
        });



    });




function validatePassword(){
    var password = document.getElementById("password")
    , confirm_password = document.getElementById("confirm_password");

    if(password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Le password non coincidono");
    } else {
        confirm_password.setCustomValidity('');
    }
}