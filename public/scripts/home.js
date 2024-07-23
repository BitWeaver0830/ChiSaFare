window.addEventListener("load", function () {
    if (localStorage.getItem("token")) {
        $(".login-button").hide();
        // Hide the "Accedi" button if the user is logged in
        const accediButton = document.querySelector('.nav-item .nav-link .d-inline.me-2.text-gray-600.small');
        if (accediButton) {
            accediButton.parentElement.style.display = 'none'; 
        }
        $("#profileRoute").click(function (e) {
            e.preventDefault();
            if (localStorage.getItem('userType') == 'professional') {
                window.location.href = "dashboard-professional.html";
            } else if (localStorage.getItem('userType') == 'user') {
                window.location.href = "dashboard-personale.html";
            }
        });
    } else {
        $('#profileRoute').hide();
    }
    ascoltaIndirizzo();
    $(this.window).keypress(function (e) {
        if (e.which === 13) {
            e.preventDefault();
            if (validazioneSubmit()) {
                inviaRicerca();
            }
        }
    });
    $('#home-search').on("submit", function (e) {
        e.preventDefault();
        if (validazioneSubmit()) {
            inviaRicerca();
        }
    });
    $("#search-location").keypress(function (e) {
        if (e.which === 13) {
            e.preventDefault();
            if (validazioneSubmit()) {
                inviaRicerca();
            }
        }
    });
});
function ascoltaIndirizzo() {
    var searchBox = document.getElementById("search-location");
    const suggestionsList = document.getElementById("search-suggestions");
    searchBox.addEventListener("keyup", function () {
        if (searchBox.value.endsWith(" ")) {
            var url = "https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + this.value;
            fetch(url)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    suggestionsList.innerHTML = "";
                    data.forEach((item) => {
                        const listItem = document.createElement("li");
                        listItem.textContent = item.display_name;
                        listItem.addEventListener("click", () => {
                            searchBox.value = item.display_name;
                            suggestionsList.innerHTML = "";
                        });
                        suggestionsList.appendChild(listItem);
                    });
                })
                .catch(function (error) {
                    console.log("nada");
                });
        }
    });
}
function validazioneSubmit() {
    var indirizzo = document.getElementById("search-location");
    var testo = document.getElementById("search-categoria");
    if (indirizzo.value == "") {
        alert("Inserisci un indirizzo");
        return false;
    }
    if (testo.value == "") {
        alert("Inserisci un termine di ricerca");
        return false;
    }
    return true;
}
function inviaRicerca() {
    var indirizzo = $("#search-location").val();
    var testo = $("#search-categoria").val();
    var url = "risultati-ricerca.html?";
    url += `keyWords=${testo}&`;
    url += `address=${indirizzo}&`;
    window.location.href = url;
}