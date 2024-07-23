const logger = require('../winston/winston');
const SibApiV3Sdk = require('@getbrevo/brevo');

const mail = process.env.MAIL_owner
const transactionalMail = process.env.MAIL_TRANSACTIONAL
const address = process.env.ADDRESS
const api_key = process.env.BREVO_API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

apiKey.apiKey = api_key;

function send(email,subject,text,html, params){
    if (html) {
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.params = params;
    } else {
        sendSmtpEmail.htmlContent = text;
    }
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = { "email": transactionalMail, "name": "Chi Sa Fare" };
    sendSmtpEmail.to = [
      { "email": email, "name": "Iscritto" }
    ];
    sendSmtpEmail.replyTo = { "email": mail, "name": "Amministratore" };

    apiInstance.sendTransacEmail(sendSmtpEmail)
        .then(function (data) {
            logger.info('API called successfully. Returned data: ' + JSON.stringify(data));
        }, function (error) {
            console.error(error);
            logger.error('API called but faild. Error: ' + JSON.stringify(error));
        });
}

function sendSignUp(email){
    send(email,'Conferma avvenuta registrazione','Ciao, benvenuto in Chisafare.it!')
}

function sendSignUpStaff(email){
    send(email, 'benvenuto nello staff','benvenuto nello staff!');
}

function sendResetPassUser(email,resetToken){
    send(email,'Password reset', 'Ciao, ecco il tuo link per il reset (user):\n https://' + address + '/set-password.html?token='+resetToken);
}

function sendResetPassProfessional(email,resetToken){
    send(email,'Password reset', 'Ciao, ecco il tuo link per il reset (professional):\n https://' + address + '/professional-set-password.html?token='+resetToken);
}

function sendResetPassAdmin(email,resetToken){
    send(email,'Password reset', 'Ciao, ecco il tuo link per il reset (admin):\n https://' + address + '/dashboard/admin-setPassword.html?token='+resetToken);
}

function sendResetPassBC(email,resetToken){
    send(email,'Password reset', 'Ciao, ecco il tuo link per il reset (commercialista):\n https://' + address + '/dashboard/setPassword.html?token='+resetToken);
}

function sendPassUpdated(email){
    send(email,'Password update correctly',"Contratulations, your password has been updated: don't forgot again pls!");
}

function sendRemoved(email){
    send(email,'succesfully removed','Feel free to come back anytime, see you again!');
}

function sendProfessionalSignUpLink(email,token, profID){
    send(email,'signup link ', 'Ciao, ecco il tuo link per procedere con la registrazione:\n https://' + address + '/professionalSignUp.html?token='+token+"&id="+profID)
}

function sendSignupTokenStaff(email, setToken){
    send(email,'welcome into staff','Welcome into staff, click this link to signUp: https://' + address + '/dashboard/staff-register.html?signupToken='+ setToken);
}

function ownerSendLoginToken(email,loginToken){
    send(email,'login token','Ciao BOSS, ecco il tuo link da usare entro 10 minuti per procedere con il login:\n  https://' + address + '/dashboard/ownerLogin.html?token='+loginToken);
}

function sendRemovedStaff(email){
    send(email, 'Hey, you have been removed from staff members',"You have been removed from staff member: what have you done??!!");
}

function sendAlertExpiredEmail(email,expiredItem,days){
    send(email,'Hey la tua '+expiredItem+' scade tra '+days+' giorni, wake up!!');
}


module.exports = {
    sendSignUp,
    sendSignUpStaff,
    sendResetPassUser,
    sendResetPassProfessional,
    sendResetPassAdmin,
    sendResetPassBC,
    sendPassUpdated,
    sendRemoved,
    sendSignupTokenStaff,
    ownerSendLoginToken,
    sendRemovedStaff,
    sendProfessionalSignUpLink,
    sendAlertExpiredEmail
}

