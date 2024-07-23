window.addEventListener("load", function () {
    if (localStorage.getItem("token") == null) {
		window.location.href = "login.html";
	}
});