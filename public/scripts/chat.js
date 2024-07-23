window.addEventListener('load', function() {

    window.scrollTo(0, document.body.scrollHeight);

    var socket = io('localhost:3000', {
        path: '/chat/'
    });
    socket.on('sendMessage', getMessages)

    var form = document.getElementById('sendMessages');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        sendMessage(socket);
    })

    getMessages()

});


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

    // Richiedo i messaggi già scambiati
    $.ajax(
        settings
        ).done((response) => {
        fillChat(response);
    });

}
function sendMessage(socket) {

    const urlParams = new URLSearchParams(window.location.search);
    var urlID = urlParams.get('id');

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
    }
}  

function fillChat(messages) {
    messagesArray = messages.messages;
    $('#messages').html('');

    for(let i = 0; i < messagesArray.length; i++){
        $('#messages').append(`
        <div class="d-flex align-content-center my-2">
        ${ messagesArray[i].from == localStorage.getItem('userID') ? '<p class="mb-0 semi-bold">Inviato:</p>' : '' }
        ${ messagesArray[i].from != localStorage.getItem('userID') ? '<p class="mb-0 semi-bold">Ricevuto:</p>' : '' }
        <p class="ms-3 mb-0">  ${messagesArray[i].date.split('T')[0]} alle ${messagesArray[i].date.split('T')[1].split('+')[0]} </p>
        </div>
        <p>  ${messagesArray[i].text} </p>
        `)
    }
    window.scrollTo(0, document.body.scrollHeight);

}