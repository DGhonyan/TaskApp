const sgMail = require('@sendgrid/mail')
//require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendWelcomeMessage(email, name) {
  await sgMail.send({
    to: email,
    from:'david.ghonyan10@gmail.com',
    subject:'Welcome to my project',
    text:`Hello ${name}, how's your mom?`
  })
}

async function sendCancellationMessage(email, name) {
  await sgMail.send({
    to: email,
    from:'david.ghonyan10@gmail.com',
    subject:'Oh no',
    text:`Goodbye ${name}, fuck you`
  })
}

module.exports = {
  sendWelcomeMessage,
  sendCancellationMessage
}
