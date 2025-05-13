const mail = require('./mail');
const pService = require('../../services/professional.service');
const dayjs = require('dayjs');

const EXPIRY_DAYS = [30, 15, 7, 0];

async function sendAlertExpiredEmails() {
    try {
        const professionals = await pService.getAllProfessional();

        professionals.forEach(p => {
            const visuraDiff = dayjs(p.visuraExp).diff(dayjs(), 'day');
            const insuranceDiff = dayjs(p.insuranceExp).diff(dayjs(), 'day');

            // Check subscription expiry if profileStatus exists
            if (p.profileStatus?.get('exp')) {
                const subscriptionDiff = dayjs(p.profileStatus.get('exp')).diff(dayjs(), 'day');
                checkExpiryDays(subscriptionDiff, p.email, 'iscrizione');
            }

            // Check visura expiry
            checkExpiryDays(visuraDiff, p.email, 'visura');

            // Check insurance expiry
            checkExpiryDays(insuranceDiff, p.email, 'assicurazione');
        });
    } catch (error) {
        console.error('Error sending expiry alerts:', error);
    }
}

function checkExpiryDays(diff, email, type) {
    if (EXPIRY_DAYS.includes(diff)) {
        mail.sendAlertExpiredEmail(email, type, diff);
    }
}

module.exports = {
    sendAlertExpiredEmails
};