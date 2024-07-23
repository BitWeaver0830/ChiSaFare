$(document).ready(function () {

    $("#form-login").submit(function (e) {
        e.preventDefault();

        var email = $("#email").val();
        var password = $("#password").val();
    

        $.ajax({
            type:"POST",
            url:"/api/admin/ownerSendLoginToken",
            headers:{
                "email":email,
                "password":password,
            }
        })
        .done((urlRes) =>{
            window.location.href = urlRes;
        })
        .fail((ownerRes) => {
            
            $.ajax({
                type:"POST",
                url:"/api/admin/staffLogin",
                headers:{
                    "email":email,
                    "password":password,
                }
            })
            .done((staffRes) =>{
                var html_template = `
                <div class="p-5">
                <h1 class="text-dark">Success!</h1>
                <p class="text-dark">Stai per essere reindirizzato.</p>
                </div>`;
                $('.content-box').html(html_template);

                localStorage.setItem("dashboard-token", staffRes.token);
                localStorage.setItem("id", staffRes.aID);
                localStorage.setItem("type", "staff");

                setTimeout(function(){
                    window.location.href = "table.html";
                }, 2000);

            }).fail((staffRes) => {
                alert("Errore. Per favore ripeti la procedura di login.");
                window.location.href = "admin-login.html";
            });
            

        });
    
    });


});