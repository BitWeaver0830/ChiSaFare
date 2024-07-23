window.addEventListener("load", function () {

  checkLogin();

  $("#logout").click(function (e) {logout(e);});

  $("#deleteAccount").click(function (e) {deleteAccount(e);});

});

function logout(e){
  e.preventDefault();

  $.ajax({
    url: "/api/user/logout",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    headers: {
      userID: localStorage.getItem("userID"),
      token: localStorage.getItem("token"),
    },
  })
    .done((res) => {
      localStorage.clear();

      window.location.href = "index.html";
    })
    .fail((res) => {
      alert("Errore nella richiesta, per favore aggiorna la pagina.");
    });
}

function deleteAccount(e){
  e.preventDefault();

  $.ajax({
    url: "/api/user/deleteAccount",
    type: "POST",
    contentType: "application/json",
    headers: {
      userID: localStorage.getItem("userID"),
      token: localStorage.getItem("token"),
    },
  }).done((res) => {
      localStorage.clear();

      html_template = `<h3>Account eliminato correttamente</h3>
      <p class="mt-3">Verrai reindirizzato alla pagina principale</p>`;
      $('.container').html(html_template);
      setTimeout(function () {
      window.location.href = "index.html";}, 1000);
    })
    .fail((res) => {
      console.log(res);
      alert("Errore nella richiesta, per favore aggiorna la pagina.");
    });
}

function checkLogin(){
  if (localStorage.getItem("token") == null) {
    window.location.href = "login.html";
  }
}