const mailjet = require('node-mailjet')

const MJ_ENABLE = parseInt(config.mailJet.enable)
const MJ_APIKEY_PUBLIC = config.mailJet.apiKeyPublic
const MJ_APIKEY_PRIVATE = config.mailJet.apiKeyPrivate


/**
 * Send mail via Mailjet
 *  Input format:
 *    {
 *    from: {
 *        name: 'Info',
 *        email: 'info@example.com',
 *      },
 *      to: {
 *        name: 'Sample',
 *        email: 'sample@example.com',
 *      },
 *      subject: 'Sample Message from server',
 *      text: 'This is a message from server',
 *      html: '<h1>This is a message from server</h1>',
 *    }
 *
 * @param {Object} input
 * @return {void}
 */
async function send(input) {
  if (MJ_ENABLE !== 1) {
    console.log(input)
    return
  }
  console.log('sent mail by MJ')
  await mailjet.connect(
    MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE,
  ).post('send', {
    version: 'v3.1',
  }).request({
    Messages: [{
      From: {
        Email: input.from.email,
        Name: input.from.name,
      },
      To: Array.isArray(input.to) ? input.to.map((item) => {
        return {
          Email: item.email,
          Name: item.name,
        }
      }) : [{
        Email: input.to.email,
        Name: input.to.name,
      }],
      Subject: input.subject,
      TextPart: input.text,
      HTMLPart: input.html,
    }],
  })
}

module.exports = {
  send,
}
