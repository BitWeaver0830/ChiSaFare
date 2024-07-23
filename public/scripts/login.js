window.addEventListener("load", function () {
  if (localStorage.getItem("token") != null) {
    window.location.href = "dashboard-personale.html";
  }

  $("#form-login").submit(function (e) {
    e.preventDefault();

    var email = $("#email").val();
    var password = $("#password").val();

    const formData = { email, password };

    $.ajax({
        url: "/api/user/login",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json",
        dataType: "json",
    })
      .done((userRes) => {
        
        localStorage.setItem("token", userRes.token);
        localStorage.setItem("userID", userRes.userID);
        localStorage.setItem("userType", "user");

        window.location.href = "dashboard-personale.html";
        })
        .fail((userRes) => {
        
        $.ajax({
            url: "/api/professional/login",
            type: "POST",
            data: JSON.stringify(formData),
            contentType: "application/json",
            dataType: "json",
        })
            .done((profRes) => {
            
                localStorage.setItem("token", profRes.token);
                localStorage.setItem("userID", profRes.pID);
                localStorage.setItem("userType", "professional");

                window.location.href = "dashboard-professional.html";
                

            })
            .fail((profRes) => {

            failedLogin();
            });
        });
    });
});

function failedLogin() {
    var err_html = `<p class="mt-3 text-danger semi-bold">Username o password errati.</p>`;

    $(".error-login").html(err_html);
}
