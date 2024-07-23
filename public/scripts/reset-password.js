window.addEventListener("load", function () {
  $("#email").on("change", validateEmail);
  $("#form-reset").submit(function (e) {getSecurityQuestion(e)});
});

function getSecurityQuestion(e) {
    e.preventDefault();

    var email = $("#email").val();

    const data = { email };

    $.ajax({
      url: "/api/user/getSecurityQuestion",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "json",
    })
      .done((res) => {
        answerSecurityQuestion(res.securityQuestion);
      })
      .fail((res) => {
        noEmailFound();
      });
}

function noEmailFound() {
  var err_html = `<p class="errorText">Nessun Utente trovato</p>`;

  $(".errorBox").html(err_html);
}

function validateEmail() {
  var email = document.getElementById("email");
  email.setCustomValidity("");
  if (!email.checkValidity()) {
    email.setCustomValidity("Inserisci un indirizzo email valido.");
  }
}

function answerSecurityQuestion(question) {
    var email = $("#email").val();
  var form_html = `
    <h4>Reimposta la Password</h4>
    <form id="form-securityQuestion" class="d-flex flex-column align-items-center" action="">
        <h5>Rispondi alla domanda di sicurezza per continuare</h5>
        <p id="question" class="mt-3 semi-bold">${question}</p>
            <label for="rispostaSegreta" class="mt-3">
                <input id="rispostaSegreta" type="text" name="rispostaSegreta" placeholder="Risposta segreta" required>
                </label>
            <button id="btn-securityQuestion" class="cta cta-purple mt-3" type="submit"><p>Login</p></button>
            </form>

                <div class="errorBox"></div>
    `;
  $(".card").html(form_html);
  $(".card").addClass("animated");

  setTimeout(function() {
    $(".card").removeClass("animated");
  }, 1000);

  $("#form-securityQuestion").submit(function (ev) {
    validateSecurityAnswer(ev, question, email);
  });
}

function validateSecurityAnswer(e, question, mail) {
    e.preventDefault();
    
    var email = mail;
    var securityQuestion = question;
    var securityAnswer = $("#rispostaSegreta").val();
    
    const data = { email, securityAnswer, securityQuestion};
    
    $.ajax({
        url: "/api/user/resetPassword",
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
    })
        .done((res) => {
            resetConfirmation();

        })
        .fail((res) => {
            var err_html = `<p class="errorText">Risposta non valida</p>`;

            $(".errorBox").html(err_html);
        });
}

function resetConfirmation(){
    const html_message = `
    <h4>Password resettata con successo</h4>
    <p class="mt-3">La tua password è stata resettata con successo. Controlla la tua mail per proseguire.</p>
    <p class="mt-3">Sarai reindirizzato in al login in pochi istanti.</p>
    `;
    $(".card").html(html_message);
    setTimeout(function() {window.location.href = 'index.html'}, 1000);
}