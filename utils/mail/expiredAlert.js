const mail = require('./mail');
const pService = require('../../services/professional.service');
const dayjs = require('dayjs');


async function sendAlertExpiredEmails(){
    const professionals = await pService.getAllProfessional()
    professionals.forEach(p=>{
        let visuraDiff = dayjs(p.visuraExp).diff(dayjs(),'day');
        let insuranceDiff = dayjs(p.insuranceExp).diff(dayjs(),'day');
        if(p.profileStatus.get('exp')){
            let subscriptionDiff = dayjs(p.profileStatus.get('exp')).diff(dayjs(),'day');
            switch (subscriptionDiff) {
                case 30:
                    mail.sendAlertExpiredEmail(p.email,'iscrizione',30);
                    break;
                case 15:
                    mail.sendAlertExpiredEmail(p.email,'iscrizione',15);
                    break;
                case 7:
                    mail.sendAlertExpiredEmail(p.email,'iscrizione',7);
                    break;
                case 0:
                    mail.sendAlertExpiredEmail(p.email,'iscrizione',0);
                default:
                    break;
            }
        }
        switch (visuraDiff) {
            case 30:
                mail.sendAlertExpiredEmail(p.email,'visura',30);
                break;
            case 15:
                mail.sendAlertExpiredEmail(p.email,'visura',15);                
                break;
            case 7:
                mail.sendAlertExpiredEmail(p.email,'visura',7);                
                break;
            case 0:
                mail.sendAlertExpiredEmail(p.email,'visura',0);
            default:
                break;
        }
        switch (insuranceDiff) {
            case 30:
                mail.sendAlertExpiredEmail(p.email,'assicurazione',30);
                break;
            case 15:
                mail.sendAlertExpiredEmail(p.email,'assicurazione',15);
                break;
            case 7:
                mail.sendAlertExpiredEmail(p.email,'assicurazione',7);
                break;
            case 0:
                mail.sendAlertExpiredEmail(p.email,'assicurazione',0);
            default:
                break;
        }
        
    })
}

module.exports = {
    sendAlertExpiredEmails
}