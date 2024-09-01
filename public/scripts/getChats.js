window.addEventListener("load", async function () {
	let data = await getChatsDestinatari();

    fillAnteprime(data);
    selectChat();

    const urlParams = new URLSearchParams(window.location.search);
    const urlID = urlParams.get('id');

    if(urlID){
        initializeChat();
    } else {
        fillEmptyChat();
    }

    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;

});

function fillEmptyChat(){
    let template=`
    <div class="w-100 h-100 d-flex justify-content-center align-items-center">
        <h3>Seleziona una chat per iniziare a chattare</h3>
    </div>
    `;
    $('#chatDiv').html(template);
}

function getChatsDestinatari() {
	return new Promise((resolve, reject) => {
		settings = {
			url: "/api/chat/getDestinatari",
			method: "GET",
			timeout: 0,
			dataType: "json",
		};

		if (localStorage.getItem("userType") == "user") {
			settings.headers = {
				uID: localStorage.getItem("userID"),
			};
		} else {
			settings.headers = {
				pID: localStorage.getItem("userID"),
			};
		}

		$.ajax(settings)
			.done(function (response) {
				resolve(response);
			})
			.fail(function (err) {
				alert("Errore nel recupero delle chat, per favore ripeti il login");
				window.location.href = "/login";
				reject();
			});
	});
}

function fillAnteprime(data) {

    data.forEach(element => {

        let template_html = `
        <a class="openChat" id="${element._id}" href="">
            <div class="anteprima-messaggio my-3 position-relative">
                ${element.unreadCount > 0 ? 
                    `<span id="unread-count-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        ${element.unreadCount}
                    </span>`
                    : ""
                }
                <div class="d-flex align-content-center">

                    <div class="preview-image">
                        <img src="${element.profilePic != null ? element.profilePic : "./images/default-profile-pic.png"}" alt="">
                    </div>

                    <div class="d-flex align-items-center ms-3">`;
                    if(element.ragioneSociale != null && element.ragioneSociale != ""){
                        template_html += `<h5>${element.ragioneSociale}</h5>`;
                    } else {
                        template_html += `<h5>${element.name} ${element.lastname}</h5>`;
                    }
                    template_html += `
                    </div>

                </div>
            </div>
        </a>`;

        $('#anteprime-messaggi').append(template_html);
        
    });

    $('.openChat').click(function (e) {
        e.preventDefault();
        let id = $(this).attr('id');
        window.location.href = "/chat.html?id=" + id;
        initializeChat();
    });
}

function selectChat(){
        
    const urlParams = new URLSearchParams(window.location.search);
    const urlID = urlParams.get('id');

    $('.openChat').removeClass('active');
    $('.openChat').each(function(){
        if($(this).attr('id') == urlID){
            $(this).addClass('active');
        }
    });
}

function initializeChat(){

    var socket = io();

    socket.on('sendMessage', getMessages)
    var form = document.getElementById('sendMessages');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        sendMessage(socket);
    })
    getMessages()
}


function addMessages(message) {
    $('#messages').append(`
        <h4> from: ${message.from}</h4>
        <h4> to: ${message.to} </h4>
        <p>  ${message.text} </p>
        <p>  ${message.date} </p>
        `)
}

function getMessages() {

    const urlParams = new URLSearchParams(window.location.search);
    var urlID = urlParams.get('id');

    var settings = {};
    if(localStorage.getItem('userType') == "user"){
        settings = {
            "url": "/api/chat/getChat",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "userID": localStorage.getItem('userID'),
                "token": localStorage.getItem('token'),
                "uID": localStorage.getItem('userID'),
                "pID": urlID
            },
        };
    }else{
        settings = {
            "url": "/api/chat/getChat",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "professionalID": localStorage.getItem('userID'),
                "token": localStorage.getItem('token'),
                "uID": urlID,
                "pID": localStorage.getItem('userID')
            },
        };
    }

    $.ajax(
        settings
        ).done((response) => {
        fillChat(response);
    });

}


function sendMessage(socket) {

    const urlParams = new URLSearchParams(window.location.search);
    var urlID = urlParams.get('id');

    var form = document.getElementById('sendMessages');
    var input = document.getElementById('input');

    if (input.value) {
        if(localStorage.getItem('userType') == "user"){
            socket.emit('sendMessage', {
                userID: localStorage.getItem('userID'),
                professionalID: urlID,
                message: {
                    from: localStorage.getItem('userID'),
                    to: urlID,
                    text: form.input.value
                }
            })
        }else{
            socket.emit('sendMessage', {
                userID: urlID,
                professionalID: localStorage.getItem('userID'),
                message: {
                    from: localStorage.getItem('userID'),
                    to: urlID,
                    text: form.input.value
                }
            })
        }

        input.value = '';

        var objDiv = document.getElementById("messages");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}  

function fillChat(messages) {
    messagesArray = messages.messages;
    $('#messages').html('');

    for(let i = 0; i < messagesArray.length; i++){
        const isInviato = messagesArray[i].from == localStorage.getItem('userID');
        $('#messages').append(`
        <div class="d-flex align-content-center justify-content-${ isInviato ? "end" : "start" } my-2 me-4">
        ${ isInviato ? '<p class="mb-0 semi-bold">Inviato:</p>' : '<p class="mb-0 semi-bold">Ricevuto:</p>' }
        <p class="ms-3 mb-0">  ${messagesArray[i].date.split('T')[0]} alle ${messagesArray[i].date.split('T')[1].split('+')[0]} </p>
        </div>
        <p class="d-flex justify-content-${ isInviato ? "end" : "start" } me-4">  ${messagesArray[i].text} </p>
        `)
    }
    
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}