window.addEventListener("load", async function () {

	let posts = await retrivePosts();

	$('#form-crea_post input[type="file"]').on("change", function () {
		checkFile(this);
	});
	$("#form-crea_post").on("submit", function (e) {
		e.preventDefault();
		creaPost();
	});

	await processPosts(posts).then(() => {
		setLikeButtons();
		$(".comment-button").on("click", function () {
			insertComment($(this));
		});
	});

	$(".post-actions").css("cursor", "pointer");
	$(".data-commentsNumber").css("cursor", "pointer");

	$(".data-commentsNumber").click(function () {
		retriveComments($(this));
	});
});

function checkFile(elemento) {
	var file = elemento.files[0];
	var extension = file.name.split(".").pop().toLowerCase();
	var allowedExtensions = ["jpg", "jpeg", "png"];

	if (!allowedExtensions.includes(extension)) {
		alert("Formato file non valido");
		$(elemento).val("");
		return;
	}
}

function creaPost() {
	let image = $("#crea_post-imageUpload")[0].files[0];
	let copy = $("#crea_post-textarea").val();

	if (!copy) {
		alert("Devi inserire un testo");
		return;
	} else if (copy.length > 1000) {
		alert("Il testo deve essere lungo massimo 1000 caratteri");
		return;
	}

	if (!image) {
		alert("Devi inserire un'immagine");
		return;
	}

	let formData = new FormData();
	formData.append("image", image);
	formData.append("copy", copy);

	$.ajax({
		url: "/api/social/createPost",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		headers: {
			token: localStorage.getItem("token"),
			pID: localStorage.getItem("userID"),
		},
	})
		.done((res) => {
			alert("Post creato con successo");
			window.location.reload();
		})
		.fail((err) => {
			alert("C'è stato un errore nella creazione del post");
			window.location.reload();
		});
}

function retrivePosts() {
	return new Promise((resolve, reject) => {
		const urlParams = new URLSearchParams(window.location.search);
		const idAzienda = urlParams.get("id");
		
		$.ajax({
			url: "/api/social/getOwnPosts",
			type: "POST",
			headers: {
				token: localStorage.getItem("token"),
				pID: idAzienda,
				professionalFromPost: idAzienda,
			},
			data: JSON.stringify({ from: 1 }),
		})
			.done((res) => {
				resolve(res);
			})
			.fail((err) => {
				if(err.status == 406){
					alert("La tua sessione è scaduta, effettua nuovamente il login.");
					localStorage.clear();
					window.location.href = "/login.html";
				} else{
					alert("C'è stato un errore nel caricamento dei post");
					window.location.reload();
				}
			});
	});
}

async function processPosts(posts) {
	
	const promises = posts.sort((a, b) => {
		new Date(a.date) - new Date(b.date)
	}).map(async (post) => {
		const template = await createPostTemplate(post);
	});

	await Promise.all(promises);
}

async function createPostTemplate(postData) {
	try {
		const profData = await getProfessionalData(postData.professionalID);

		let template = `
      <!-- POST -->
      <div class="post py-4 px-2 px-md-3">

          <div class="post-header d-flex justify-content-between align-items-center">

              <div class="d-flex align-items-center">

                  <div class="crea_post-image me-3"> 
                      <img class="data-profilePic" src="${profData.profilePic ? profData.profilePic : "./images/default-profile-pic.png"}" alt="">
                  </div>

                      <div class="d-flex">
                          <p class="data-ragioneSociale post-name bold me-2">${profData.ragioneSociale}</p>
                          <div class="d-flex">
                              <p class="semi-bold text-grey  me-1">·</p>`;

		
		let now = new Date();
		let postDate = new Date(postData.date);
		var differenzaInMillisecondi = now - postDate;
		var differenzaInOre = differenzaInMillisecondi / 3600000;

		let stringDate = "";

		if (Math.floor(differenzaInOre) < 1) {
			stringDate = "Meno di un ora fa";
		} else if (Math.floor(differenzaInOre) < 24) {
			stringDate = Math.floor(differenzaInOre) + " ore fa";
		} else if (Math.floor(differenzaInOre) < 48) {
			stringDate = "Ieri";
		} else {
			stringDate = Math.floor(differenzaInOre / 24) + " giorni fa";
		}

		template += `
                              <p class="data-postCreatedAt post-createdAt text-grey ">${stringDate}</p>
                          </div>
                      </div>

              </div>

          </div> <!-- fine post Header -->

          <div class="post-copy my-3">
              <p class="data-postCopy">${postData.copy}</p>
          </div>

          <div class="post-image">
              <img class="data-postPhoto" src="${
								postData.image
							}" alt="">
          </div>

          <div class="post-stats d-flex justify-content-between text-grey my-3">
              <p class="data-likeNumber">${
								postData.likes.length > 0
									? "Piace a " + postData.likes.length + " persone."
									: "Ancora nessun Mi Piace"
							}</p>
              <p postID="${postData._id}" class="data-commentsNumber" >${
			postData.comments.length > 0
				? "Commenti " + postData.comments.length + ""
				: "Ancora nessun commento"
		}</p>
          </div>

          <div class="post-actions d-flex justify-content-between grey-text mt-3">
              `;

		let like = false;

		postData.likes.forEach((likeID) => {
			if (likeID == localStorage.getItem("userID")) {
				like = true;
			}
		});

		template += `
                  <div class="like-button ${
										like ? "liked" : ""
									} d-flex" postID="${postData._id}">
                  </div>


                  <div class="comment-button d-flex" postID="${postData._id}" >
                      <img src="./images/icon-comment-outline.svg" alt="" class="custom-icon">
                      <p class="bold ms-2">Commenta</p>
                  </div>

          </div>
          <div postID="${postData._id}" class="post-comments mt-3">
          </div>
      </div><!-- fine post -->
      
      <div class="my-3">
          <hr class="solid">
      </div>`;

		$("#feed").append(template);
	} catch (error) {
		alert("C'è stato un errore nel caricamento dei post");
	}
}

function getProfessionalData(professionalID) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: "/api/user/getProfessional",
			type: "GET",
			headers: {
				professionalID: professionalID,
			},
		})
			.done((profData) => {
				resolve(profData);
			})
			.fail((err) => {
				reject(err);
			});
	});
}

function setLikeButtons() {
	$(".like-button").each((index, element) => {
		let template_html = "";
		if ($(element).hasClass("liked")) {
			template_html = `
            <img src="./images/icon-like-outline.svg" alt="" class="custom-icon">
            <p class="bold ms-2">Piaciuto</p>`;
		} else {
			template_html = `
            <img src="./images/icon-like-outline.svg" alt="" class="custom-icon">
            <p class="bold ms-2">Mi piace</p>`;
		}
		element.innerHTML = template_html;
	});

	let buttons = document.getElementsByClassName("like-button");
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].removeEventListener("click", () =>
			console.log("evento rimosso")
		);
	}

	$(".like-button")
		.not(".liked")
		.click((event) => {
			event.preventDefault();
			addLike(event.currentTarget);
		});

	$(".liked").click((event) => {
		event.preventDefault();
		removeLike(event.currentTarget);
	});
}

function addLike(target) {
	let id = target.getAttribute("postID");
	target.classList.add("liked");

	$.ajax({
		url: "/api/social/addLike",
		type: "POST",
		headers: {
			pID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
			postID: id,
		},
	})
		.done((res) => {
			setLikeButtons();
		})
		.fail((err) => {});
}

function removeLike(target) {
	let id = target.getAttribute("postID");
	target.classList.remove("liked");

	$.ajax({
		url: "/api/social/removeLike",
		type: "POST",
		headers: {
			pID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
			postID: id,
		},
	})
		.done((res) => {
			setLikeButtons();
		})
		.fail((err) => {});
}

function retriveComments(target) {
	$.ajax({
		url: "/api/social/getComments",
		type: "POST",
		dataType: "json",
		headers: {
			pID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
			postID: $(target).attr("postID"),
		},
	})
		.done((res) => {
			showComments(res, target);
		})
		.fail((err) => {
			alert("C'è stato un errore nel caricamento dei commenti");
		});
}

async function showComments(commentsObj, target) {
	let comments = commentsObj.comments.slice().sort((a, b) => {
		return new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate);
	});

	let postID = $(target).attr("postID");

	let template = "";
	if (comments.length <= 0) {
		template = "<p class='text-grey'>Ancora nessun commento</p>";
	} else {
		for (let i = 0; i < comments.length; i++) {
			$.ajax({
				url: "/api/user/getProfessional",
				type: "GET",
				dataType: "json",
				headers: {
					professionalID: comments[i].professionalID,
				},
			})
				.done((res) => {
					if (comments[i].professionalID == localStorage.getItem("userID")) {
						template += `
                        <a class="deleteModal" commentID="${comments[i]._id}" postID="${postID}">
                        `;
					}
					template += `
            <div pID="${comments[i].professionalID}" class="comment d-flex my-3">
                <p class="bold">${res.ragioneSociale}</p>
                <p class="ms-3">${comments[i].text}</p>
            </div>`;

					if (comments[i].professionalID == localStorage.getItem("userID")) {
						template += `</a>`;
					}

					$(".post-comments").each((index, element) => {
						if (element.getAttribute("postID") == postID) {
							$(element).html(template);
						}
					});

					$(".deleteModal").click((event) => {
						event.preventDefault();
						$("#deleteCommentModal").modal("show");
						$("#confermaEliminazione").attr(
							"commentID",
							event.currentTarget.getAttribute("commentID")
						);
						$("#confermaEliminazione").attr(
							"postID",
							event.currentTarget.getAttribute("postID")
						);
						$("#confermaEliminazione").click((event) => {
							event.preventDefault();
							eliminaCommento(
								event.currentTarget.getAttribute("commentID"),
								event.currentTarget.getAttribute("postID")
							);
						});
					});
				})
				.fail((err) => {
					alert("C'è stato un errore nel caricamento dei commenti");
					location.reload();
				});
		}
	}
}

function insertComment(target) {
	let postID = $(target).attr("postID");

	let template = `
    <form class="" id="comment-form">
        <div class="w-100">
            <input type="text" class="form-control" id="comment-input" placeholder="Scrivi un commento...">
        </div>
        <div class="w-100 d-flex justify-content-end mt-2">
            <button type="submit" class="btn btn-secondary">Commenta</button>
        </div>
    </form>`;

	$(".post-comments").html("");

	$(".post-comments").each((index, element) => {
		if (element.getAttribute("postID") == postID) {
			$(element).html(template);
		}
	});

	$("#comment-form").submit((event) => {
		event.preventDefault();
		if ($("#comment-input").val() == "") {
			alert("Inserisci un commento");
			return;
		} else {
			let text = $("#comment-input").val();

			$.ajax({
				url: "/api/social/addComment",
				type: "POST",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({ text: text }),
				headers: {
					pID: localStorage.getItem("userID"),
					token: localStorage.getItem("token"),
					postID: postID,
				},
			})
				.done((res) => {
					$(".post-comments").html("");
				})
				.fail((err) => {
					alert("C'è stato un errore nell'inserimento del commento");
					$(".post-comments").html("");
				});
		}
	});
}

function eliminaCommento(commentID, postID) {
	$.ajax({
		url: "/api/social/removeComment",
		type: "POST",
		headers: {
			pID: localStorage.getItem("userID"),
			token: localStorage.getItem("token"),
			postID: postID,
			commentID: commentID,
		},
	})
		.done((res) => {
			$("#deleteCommentModal").modal("hide");
			alert("Commento eliminato con successo");
			location.reload();
		})
		.fail((err) => {
			$("#deleteCommentModal").modal("hide");
		});
}
