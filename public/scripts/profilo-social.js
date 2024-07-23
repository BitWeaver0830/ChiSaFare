window.addEventListener("load", async function () {
	let data = await retrieveDataProfessional();
	fillPage(data);
});

function retrieveDataProfessional() {
	return new Promise((resolve, reject) => {
		const urlParams = new URLSearchParams(window.location.search);
		const idAzienda = urlParams.get("id");

		$.ajax({
			type: "GET",
			url: "/api/user/getProfessional",
			contentType: "application/json",
			headers: {
				professionalID: idAzienda,
			},
		})
			.done((res) => {
				resolve(res);
			})
			.fail((err) => {
				alert("Errore nel caricamento dei dati, effettua nuovamente il login");
				localStorage.clear();
				window.location.href = "/login.html";
			});
	});
}

function fillPage(data) {


	let path_profilePic = data.profilePic;
	
	if (path_profilePic) {
		$(".data-profilePic").attr(
			"src",
			path_profilePic
		);
	}

	if(data._id == localStorage.getItem("userID")){
		$('#followPro').hide();
	} else {
		$('.redirect-modifica-profilo').hide();
		$('#form-crea_post').hide();


		if(data.followingProfessionals.includes(localStorage.getItem("userID"))){
			$('#followPro p').text("Unfollow");
			$('#followPro').attr("seguito", "true");
		} else {
			$('#followPro').attr("seguito", "false");
		}

		$('#followPro').on("click", function(e){
			e.preventDefault();
			if($(this).attr("seguito") == "false"){
				followProfessional(data._id);
				
			} else {
				unfollowProfessional(data._id);
			};
		});

	}

	$(".redirect-modifica-profilo").attr(
		"href",
		`/modifica-profilo.html?id=${data._id}`
	);

	$(".data-ragioneSociale").text(data.ragioneSociale);
	
	$("#data-numberPosts").text(data.posts.length);
	$("#data-numberFollowing").text(data.followedProfessionals.length);
	$("#data-numberFollower").text(data.followingProfessionals.length);

}

function followProfessional(id){

	pID = localStorage.getItem("userID");

	$.ajax({
		type: "POST",
		url: "/api/social/setFollowedProfessional",
		headers:{
			professionalID: id,
			pID: pID,
			token: localStorage.getItem("token")
		},
	}).done((res) => {
		alert("Hai iniziato a seguire il professionista");
		location.reload();
	}).fail((err) => {
		alert("Errore nel follow del professionista, effettua nuovamente il login");
	});

}

function unfollowProfessional(id){

	pID = localStorage.getItem("userID");

	$.ajax({
		type: "POST",
		url: "/api/social/removeFollowedProfessional",
		headers:{
			professionalID: id,
			pID: pID,
			token: localStorage.getItem("token")
		},
	}).done((res) => {
		alert("Hai smesso di a seguire il professionista");
		location.reload();
	}).fail((err) => {
		alert("Errore nel follow del professionista, effettua nuovamente il login");
	});
}