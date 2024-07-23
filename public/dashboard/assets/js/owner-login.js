$(document).ready(function () {


const urlParams = new URLSearchParams(window.location.search);
var token = urlParams.get('token');

$.ajax({
    type: "POST",
    url: "/api/admin/ownerLogin",
    headers: {
       "loginToken": token,
    }
})
.done((res) => {
    
    html_template = `
<div class="p-5">
    <div class="text-center">
        <h4 class="text-dark mb-4">Benvenuto Capo</h4>
    </div>
    <div class="message-box">
        <p class="text-dark text-center">Stai per essere reindirizzato</p>
    </div>
</div>
`;

    $('.content-box').html(html_template);
    
    localStorage.setItem("dashboard-token", res.token);
    localStorage.setItem("id", res.aID);
    localStorage.setItem("type", "owner");

    setTimeout(function(){
        window.location.href = "owner-dashboard.html";
    }, 2000);

})
.fail((res) => {
    alert("Errore. Per favore ripeti la procedura di login.");
    window.location.href = "admin-login.html";
});


});
