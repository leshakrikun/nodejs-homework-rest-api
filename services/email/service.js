const Mailgen = require('mailgen')

class EmailService {
  constructor(env, sender) {
    this.sender = sender
    switch (env) {
      case 'development':
        this.link = 'https://c05c-2a00-1210-a-1fdb-f9d4-2791-2c8c-411.ngrok.io'
        break
      case 'production':
        this.link = 'link for production'
        break
      default:
        this.link = 'http://127.0.0.1:3000'
        break
    }
  }

  createTemplateEmail(name, verificationToken) {    
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Mailgen',
        link: this.link,
      },
    })

    const email = {
      body: {
        name,
        intro:
          "Welcome to Contacts service! We're very excited to have you on board.",
        action: {
          instructions:
            'To get started with Contacts, please click here:',
          button: {
            color: '#22BC66', 
            text: 'Confirm your account',
            link: `${this.link}/api/users/verify/${verificationToken}`,
          },
        },
      },
    }   
    return mailGenerator.generate(email)
  }

  async sendVerifyEmail(email, name, verificationToken) {
    const emailHTML = this.createTemplateEmail(name, verificationToken)
    const msg = {
      to: email,
      subject: 'Verify your email',
      html: emailHTML,
    }
    try {
      const result = await this.sender.send(msg)
        console.log(result)
      return true
    } catch (error) {
        console.log(error.message)
      return false
    }
  }
}

module.exports = EmailService




