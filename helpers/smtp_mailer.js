const {
  createTransport
} = require('nodemailer')

const SMTP_HOST = config.smtpMailer.SMTPHost
const SMTP_PORT = config.smtpMailer.SMTPPort
const TRANSPORTER = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.smtpMailer.emailToSend,
    pass: config.smtpMailer.emailToSendPassword,
  }
})

async function send(options) {
  if (config.smtpMailer.enable != 1) {
    // eslint-disable-next-line no-console
    console.log(options.text)
    return
  }
  try {
    // eslint-disable-next-line no-console
    console.log('sent mail by SMTP')
    // eslint-disable-next-line no-unused-vars

    await TRANSPORTER.sendMail({
      ...options,
      to: options.to.email || options.to
    })
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

module.exports = {
  send,
}
