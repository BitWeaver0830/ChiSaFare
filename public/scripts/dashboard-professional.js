window.addEventListener("load", function () {

  checkLogin();

  $("#logout").click(function (e) {logout(e);});

  $('#profile-user').click(function (e) {
    e.preventDefault();
    window.location.href = `modifica-profilo.html?id=${localStorage.getItem("userID")}`;
  });

  $('#profile-social').click(function (e) {
    e.preventDefault();
    window.location.href = `profilo-social.html?id=${localStorage.getItem("userID")}`;
  });

  $('#profile-user-chat').click(function (e) {
    e.preventDefault();
    window.location.href = `chat.html`;
  });

  fetchUnreadCountAndUpdateBadge();

});

function logout(e){
  e.preventDefault();

  $.ajax({
    url: "/api/professional/logout",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    headers: {
      pID: localStorage.getItem("userID"),
      token: localStorage.getItem("token"),
    },
  })
    .done((res) => {
      localStorage.clear();

      window.location.href = "index.html";
    })

      .fail((res) => {
        alert("Errore nella richiesta, sarai reindirizzato alla homepage.");
        localStorage.clear();
        window.location.href = "index.html";
      });
}



function checkLogin(){
  if (localStorage.getItem("token") == null) {
    window.location.href = "login.html";
  }
}

function fetchUnreadCountAndUpdateBadge() {
  $.ajax({
      url: "/api/chat/getTotalUnreadCount",
      type: "GET",
      headers: {
        pID: localStorage.getItem("userID"),
        token: localStorage.getItem("token"),
        uID: localStorage.getItem('userID'), 
        professionalID: localStorage.getItem('userID'), 
      },
      dataType: "json"
  })
  .done(function (data) {
      const unreadCount = data.unreadCount;
      const badgeElement = $('#unread-count-badge');

      // Update the badge with the unread count
      badgeElement.text(unreadCount);

      // Optionally hide the badge if count is 0
      if (unreadCount === 0) {
          badgeElement.hide();
      } else {
          badgeElement.show();
      }
  })
  .fail(function () {
      console.error('Error fetching unread count');
  });
}