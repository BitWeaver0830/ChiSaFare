window.addEventListener('load', async function () {

    const urlParams = new URLSearchParams(window.location.search);

    var id = urlParams.get('id');

    const pIva = await getPIva(id);

    validate(pIva);
});

async function getPIva(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/user/getProfessional',
            type: 'GET',
            headers: {
                professionalID: id, 
            },
            dataType: 'json',
        }).done((res) => {
            resolve(res.pIva);
        }).fail((err) => {
            reject(err);
        });
    });
}

function validate(pIva) {
    $.ajax({
        url: '/api/professional/activate',
        type: 'POST',
        headers: {
            pIva: pIva,
        },
    }).done((res) => {
        alert("Account attivato con successo!");

        window.location.href = "login.html";
        
    }).fail((err) => {
        alert("Errore nell'attivazione dell'account");
        console.log(err)
    })
}