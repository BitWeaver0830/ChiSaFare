window.addEventListener("load", function () {
	var header_noLogin = `
<div class="py-5"></div>
        
        <nav class="custom-nav navbar navbar-expand-lg bg-darkPurple d-flex">
        <a href="index.html">
            <img class="nav-logo" src="./images/logo-mobile.png" alt="">
        </a>
            <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span> <img src="./images/icon-menu-white.svg" class="custom-icon"/> </span>
            </button>
            <div class="collapse navbar-collapse bg-darkPurple justify-content-between pt-5 px-3 pb-4 p-lg-0" id="navbarNav">
                <a class="" href="#"></a>
                <a class="" href="#"></a>
                <a class="nav-link my-3 my-lg-0" href="ricerca-servizi.html"><h4>Ricerca Servizi</h4></a>
                <a class="nav-link my-3 my-lg-0" href="chi-siamo.html"><h4>Chi siamo</h4></a>
                <a class="nav-link cta cta-borded me-4 my-1" href="login.html"><h4>Accedi</h4></a>
            </div>
        </nav>
`

	var header_logged = `


        <div class="py-5"></div>
        
        <nav class="custom-nav navbar navbar-expand-lg bg-darkPurple d-flex">
         
            <a href="index.html">
            <img class="nav-logo" src="./images/logo-mobile.png" alt="">
            </a>
            <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span> <img src="./images/icon-menu-white.svg" class="custom-icon"/> </span>
            </button>
            <div class="collapse navbar-collapse bg-darkPurple justify-content-between pt-5 px-3 pb-4 p-lg-0" id="navbarNav">
                <a class="" href="#"></a>
                <a class="" href="#"></a>

                ${
									localStorage.getItem("userType") == "professional"
										? ""
										: '<a class="nav-link my-3 my-lg-0" href="ricerca-servizi.html"><h4>Ricerca Servizi</h4></a>'
								}
                
                
                ${
									localStorage.getItem("userType") == "professional"
										? '<a class="nav-link my-3 my-lg-0" href="area-social.html"><h4>Area Social</h4></a>'
										: ""
								}
                
                <a class="nav-link my-3 my-lg-0" href="chat.html"><h4>Messaggi</h4></a>
                <div class="d-flex justify-content-end">

                <a id="profileRoute" href="" class="me-4">
                    <img src="./images/user-icon.svg" alt="" class="custom-icon-double ms-3">
                </a>
                </div>
            </div>
        </nav>
        `

	if (!localStorage.getItem("token")) {
		$("#header").html(header_noLogin)
	} else {
		$("#header").html(header_logged)
	}

	// FOOTER

	var footer_html = `
<!--  home footer -->
<section class="bg-darkPurple p-4">

    <div class="row">

                <div class="col-12 col-md-3">

                    <div>
                        <a href="/index.html">Home</a>
                    </div>
                    <div>
                        <a href="/chi-siamo.html">Chi Siamo</a>
                    </div>
                </div>

                 <div class="col-12 col-md-3">
                    <div>
                        <a href="/dashboard-personale.html">Profilo</a>
                    </div>
                    <div>
                        <a href="/ricerca-servizi.html">Ricerca Professionisti</a>
                    </div>
                </div>

    </div>
    <p class="text-center mt-3">Chi sa fare - 2023® P.Iva : 1019321011</p>

</section> <!-- fine home footer -->
`

	$("#footer").html(footer_html)

	$("#profileRoute").click(function (e) {
		e.preventDefault()
		if (!localStorage.getItem("token")) {
			window.location.href = "login.html"
		} else if (localStorage.getItem("userType") == "professional") {
			window.location.href = "dashboard-professional.html"
		} else if (localStorage.getItem("userType") == "user") {
			window.location.href = "dashboard-personale.html"
		}
	})
})
