'use strict'

const Req = use('Request')
const Utils = use('Utils')
const Logger = use('Logger')
const Env = use('Env');
const SMTP_SERVER = Env.get('SMTP_SERVER')
const SMTP_PORT = Env.get('SMTP_PORT')
const MAIL_FROM = Env.get('MAIL_FROM')
const SMTP_EMAIL = Env.get('SMTP_EMAIL')
const SMTP_PASS = Env.get('SMTP_PASS')
const _send_from_users = eval(Env.get('send_from_users'));
const _smtp = JSON.parse(Env.get('smtp'))
const APP_URL = Env.get('APP_URL')
const fs = require('fs')
const pdf = require('html-pdf')
const Helpers = use('Helpers')
const rootPath = Helpers.appRoot()
const nodemailer = require('nodemailer');
const { file } = require('googleapis/build/src/apis/file');

const TOKEN_PATH = `${rootPath}/token/token-backup2.json`
const CREDENTIAL_FILE = `${rootPath}/backup2@einvoicepro.com.json`

const TOKEN_PATH2 = `${rootPath}/token/token2.json`
const CREDENTIAL_FILE2 = `${rootPath}/credential-einvoice-mail2.json`

const TOKEN_PATH3 = `${rootPath}/token/token3.json`
const CREDENTIAL_FILE3 = `${rootPath}/credential-einvoice-mail3.json`

const TOKEN_PATH4 = `${rootPath}/token/token4.json`
const CREDENTIAL_FILE4 = `${rootPath}/credential-einvoice-mail4.json`

const TOKEN_PATH5 = `${rootPath}/token/token5.json`
const CREDENTIAL_FILE5 = `${rootPath}/credential-einvoice-mail5.json`

const TOKEN_PATH6 = `${rootPath}/token/token6.json`
const CREDENTIAL_FILE6 = `${rootPath}/credential-einvoice-mail6.json`

const TOKEN_PATH7 = `${rootPath}/token/token-backup.json`
const CREDENTIAL_FILE7 = `${rootPath}/backup@einvoicepro.com.json`

const TOKEN_PATH8 = `${rootPath}/token/token-info.json`
const CREDENTIAL_FILE8 = `${rootPath}/info-einvoicepro.com.json`

const TOKEN_PATH_CUCKOO = `${rootPath}/token/invoicekt1@cuckoovina_token.json`
const CREDENTIAL_CUCKOO = `${rootPath}/invoicekt1@cuckoovina.json`

const TOKEN_PATH_BKVINA = `${rootPath}/token/thao.nguyen@bumkoo.co.kr_1_token.json`
const CREDENTIAL_BKVINA = `${rootPath}/thao.nguyen@bumkoo.co.kr_1.json`

let _cnt = 0
let _cntAJ = 0
let _cntSent = 0
class SendMailController {
    async test({ request, response }) {
        try {
            let mailOptions = {
                from: _smtp["daeyoung"].sender[0].email,
                to: "thai.nguyen@webcashgenuwin.com", // list of receivers, separate by comma(;)
                subject: "Thông báo hóa đơn điện tử", // Subject line
                text: '', // plain text body
                html: "<p>Nội dung html <br> Team e-invoice</p>", // html body
            }
            let smtp_info = {
                host: _smtp["daeyoung"].smtp_ip,
                port: _smtp["daeyoung"].smtp_port,
                secure: _smtp["daeyoung"].secure, // true for 465, false for other ports  
                //secureConnection: false, // TLS requires secureConnection to be false             
                //requireTLS: true,
                debug: true,
                logger: true,
                tls: {
                    ciphers: 'SSLv3', //using for openssl 3.0. You must install openssl 3.0 from source
                    //secureProtocol: "TLSv1_method",
                    //DEFAULT_MIN_VERSION: 'TLSv1',
                    //maxVersion: 'TLSv1.3',
                    //minVersion: 'TLSv1.2',
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: _smtp["daeyoung"].sender[0].email,
                    pass: _smtp["daeyoung"].sender[0].password
                }
            }
            //const result = await this.wrapedSendMail(mailOptions, TOKEN_PATH, CREDENTIAL_FILE, "", "")
            const result = await this.smtpSendMail(mailOptions, smtp_info, "", "")
            console.log(smtp_info)
            return response.send(Utils.response(true, 'test', result))
        } catch (e) {
            //Utils.Logger({ level: 'error', module: 'SendMailController', func: 'test', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async wrapedSendMailByApp(mailOptions, username, password, attachfile1, attachfile2) {
        return new Promise((resolve, reject) => {

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: username,      // 👉 thay bằng email Gmail của bạn
                  pass: password        // 👉 thay bằng App Password (16 ký tự)
                }
              });

            transporter.sendMail(mailOptions, async function (error, info) {
                const d = new Date();
                let dateText = d.toLocaleString();
                if (error) {
                    console.log(`error send mail[${dateText}]: from: ` + username + ', to: ' + mailOptions.to + ' >>> ' + JSON.stringify(error))
                    Utils.Logger({ level: 'error', module: 'SendMailController', func: 'wrapedSendMail', content: 'mail-from:' + mailOptions.from + ',mail-to:' + mailOptions.to + '. ' + JSON.stringify(error) })
                    resolve(false) // or use rejcet(false) but then you will have to handle errors
                } else {
                    let aMailTo = mailOptions.to.split(';')
                    for (let i = 0; i < aMailTo.length; i++) {
                        await Utils.InsertTable('sendmail_log', { mailfrom: mailOptions.from, mailto: aMailTo[i], subject: mailOptions.subject, body: mailOptions.html, attachfile1: attachfile1, attachfile2: attachfile2 })
                    }
                    console.log(`Email sent[${dateText}]: from: ` + username + ', to: ' + mailOptions.to)
                    resolve(true)
                }
            })
        })
    }

    async wrapedSendMail(mailOptions, p_token_path, p_credential_file, attachfile1, attachfile2) {
        return new Promise((resolve, reject) => {
            const credentials = JSON.parse(fs.readFileSync(p_credential_file))
            const tokens = JSON.parse(fs.readFileSync(p_token_path))
            const auth = {
                type: 'OAuth2',
                user: mailOptions.mail_auth_from,
                clientId: credentials.installed.client_id.toString(),
                clientSecret: credentials.installed.client_secret.toString(),
                refreshToken: tokens.refresh_token.toString(),
                accessToken: tokens.access_token.toString(),
                expires: tokens.expiry_date,
            }
            //console.log(auth)
            //console.log(mailOptions)
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                host: 'smtp.gmail.com',
                port: 465, //port 587
                secure: true, // true for 465, false for other ports
                auth: auth
            })

            transporter.sendMail(mailOptions, async function (error, info) {
                const d = new Date();
                let dateText = d.toLocaleString();
                if (error) {
                    console.log(`error send mail[${dateText}]: from: ` + auth.user + ', to: ' + mailOptions.to + ' >>> ' + JSON.stringify(error))
                    Utils.Logger({ level: 'error', module: 'SendMailController', func: 'wrapedSendMail', content: 'mail-from:' + mailOptions.from + ',mail-to:' + mailOptions.to + '. ' + JSON.stringify(error) })
                    resolve(false) // or use rejcet(false) but then you will have to handle errors
                } else {
                    let aMailTo = mailOptions.to.split(';')
                    for (let i = 0; i < aMailTo.length; i++) {
                        await Utils.InsertTable('sendmail_log', { mailfrom: mailOptions.from, mailto: aMailTo[i], subject: mailOptions.subject, body: mailOptions.html, attachfile1: attachfile1, attachfile2: attachfile2 })
                    }
                    console.log(`Email sent[${dateText}]: from: ` + auth.user + ', to: ' + mailOptions.to)
                    resolve(true)
                }
            })
        })
    }

    async smtpSendMail(mailOptions, p_smtp_info, attachfile1, attachfile2) {
        return new Promise((resolve, reject) => {
            //console.log(p_smtp_info)
            let transporter = nodemailer.createTransport(p_smtp_info)
            transporter.sendMail(mailOptions, async function (error, info) {
                const d = new Date();
                let dateText = d.toLocaleString();
                if (error) {
                    console.log(`error send mail[${dateText}]: from: ` + p_smtp_info.auth.user + ', to: ' + mailOptions.to + ' >>> ' + JSON.stringify(error))
                    //console.log(`error send mail[${dateText}]: from: ` + p_smtp_info.auth.user + ', to: ' + mailOptions.to + ' >>> ' + error)
                    //console.log(`error send mail[${dateText}]: from: `  + error)
                    //Utils.Logger({ level: 'error', module: 'SendMailController', func: 'wrapedSendMail', content: 'mail-from:' + mailOptions.from + ',mail-to:' + mailOptions.to + '. ' + JSON.stringify(error) })
                    resolve(false) // or use rejcet(false) but then you will have to handle errors
                } else {
                    /*let aMailTo = mailOptions.to.split(';')
                    for (let i = 0; i < aMailTo.length; i++) {
                        await Utils.InsertTable('sendmail_log', { mailfrom: mailOptions.from, mailto: aMailTo[i], subject: mailOptions.subject, body: mailOptions.html, attachfile1: attachfile1, attachfile2: attachfile2 })
                    }*/

                    console.log(`Email sent[${dateText}]: from: ` + p_smtp_info.auth.user + ', to: ' + mailOptions.to)
                    resolve(true)
                }
            })
        })
    }

    async sendMail({ request, response }) {
        try {
            let { mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            const sender_from = 'E-INVOICE WEBCASH VIETNAM <info@einvoicepro.com>'
			let mail_auth_from = 'info@einvoicepro.com'
            let m_token_path = TOKEN_PATH6
            let m_credentail_file = CREDENTIAL_FILE6
            _cnt++
            
            if(_cnt > 1 && _cnt <=5) _cnt=6//vo hieu hoa case 2,3,4,5

            if (_cnt == 1) {
                mail_auth_from = 'backup2@einvoicepro.com'
                m_token_path = TOKEN_PATH
                m_credentail_file = CREDENTIAL_FILE
            } else if (_cnt == 2) {
                mail_auth_from = 'genuwinsolution.einvoice2@gmail.com'
                m_token_path = TOKEN_PATH2
                m_credentail_file = CREDENTIAL_FILE2
            }else if (_cnt == 3) {
                mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                m_token_path = TOKEN_PATH4
                m_credentail_file = CREDENTIAL_FILE4
            } else if (_cnt == 4) {
                mail_auth_from = 'genuwinsolution.einvoice5@gmail.com'
                m_token_path = TOKEN_PATH5
                m_credentail_file = CREDENTIAL_FILE5
            }
             else if (_cnt == 5) {
                mail_auth_from = 'genuwinsolution.einvoice6@gmail.com'
                m_token_path = TOKEN_PATH6
                m_credentail_file = CREDENTIAL_FILE6
            } else if (_cnt == 6) {
                mail_auth_from = 'backup@einvoicepro.com'
                m_token_path = TOKEN_PATH7
                m_credentail_file = CREDENTIAL_FILE7
            } else {
                mail_auth_from = 'info@einvoicepro.com'
                m_token_path = TOKEN_PATH8
                m_credentail_file = CREDENTIAL_FILE8
                _cnt = 0
            }

            let pk = ""
            let mailOptions = null
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                }
            } else {
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                }
            }

            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                }
            }
			mailOptions.from=sender_from
            let result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
            if (!result) {
                //try second send
                if (mailOptions.mail_auth_from == 'backup2@einvoicepro.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice2@gmail.com'
                    m_token_path = TOKEN_PATH2
                    m_credentail_file = CREDENTIAL_FILE2
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice2@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                    m_token_path = TOKEN_PATH3
                    m_credentail_file = CREDENTIAL_FILE3
                // } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice3@gmail.com') {
                //     mailOptions.mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                //     m_token_path = TOKEN_PATH4
                //     m_credentail_file = CREDENTIAL_FILE4
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice4@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice5@gmail.com'
                    m_token_path = TOKEN_PATH5
                    m_credentail_file = CREDENTIAL_FILE5
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice5@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice6@gmail.com'
                    m_token_path = TOKEN_PATH6
                    m_credentail_file = CREDENTIAL_FILE6
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice6@gmail.com') {
                    mailOptions.mail_auth_from = 'backup@einvoicepro.com'
                    m_token_path = TOKEN_PATH7
                    m_credentail_file = CREDENTIAL_FILE7
                } else if (mailOptions.mail_auth_from == 'backup@einvoicepro.com') {
                    mailOptions.mail_auth_from = 'info@einvoicepro.com'
                    m_token_path = TOKEN_PATH8
                    m_credentail_file = CREDENTIAL_FILE8
                } else {
                    mailOptions.mail_auth_from = 'backup2@einvoicepro.com'
                    m_token_path = TOKEN_PATH
                    m_credentail_file = CREDENTIAL_FILE
                }
                result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                if (!result) {
                    console.log(`Failed send email to ${mailOptions.to} from ${mailOptions.from}`)
                }
            }
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate .getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            let data_res = {
                mail_from : mailOptions.from,
                mail_to : mailOptions.to,
                mail_to_cc : mailOptions.cc,
                date_send: `${year}-${month}-${day}`,
                time_send: `${hours}:${minutes}:${seconds}`

            }
            return response.send(Utils.response(result, result, data_res))
        } catch (e) {
			console.log(e)
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailWetax({ request, response }) {
        try {
            let { mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            const sender_from = 'E-INVOICE WEBCASH VIETNAM <info@einvoicepro.com>'
			let mail_auth_from = 'info@einvoicepro.com'
            let m_token_path = TOKEN_PATH6
            let m_credentail_file = CREDENTIAL_FILE6
            _cnt++
            
            if(_cnt > 1 && _cnt <=5) _cnt=6//vo hieu hoa case 2,3,4,5

            if (_cnt == 1) {
                mail_auth_from = 'backup2@einvoicepro.com'
                m_token_path = TOKEN_PATH
                m_credentail_file = CREDENTIAL_FILE
            } else if (_cnt == 2) {
                mail_auth_from = 'genuwinsolution.einvoice2@gmail.com'
                m_token_path = TOKEN_PATH2
                m_credentail_file = CREDENTIAL_FILE2
            }else if (_cnt == 3) {
                mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                m_token_path = TOKEN_PATH4
                m_credentail_file = CREDENTIAL_FILE4
            } else if (_cnt == 4) {
                mail_auth_from = 'genuwinsolution.einvoice5@gmail.com'
                m_token_path = TOKEN_PATH5
                m_credentail_file = CREDENTIAL_FILE5
            }
             else if (_cnt == 5) {
                mail_auth_from = 'genuwinsolution.einvoice6@gmail.com'
                m_token_path = TOKEN_PATH6
                m_credentail_file = CREDENTIAL_FILE6
            } else if (_cnt == 6) {
                mail_auth_from = 'backup@einvoicepro.com'
                m_token_path = TOKEN_PATH7
                m_credentail_file = CREDENTIAL_FILE7
            } else {
                mail_auth_from = 'info@einvoicepro.com'
                m_token_path = TOKEN_PATH8
                m_credentail_file = CREDENTIAL_FILE8
                _cnt = 0
            }

            let pk = ""
            let mailOptions = null
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 = attachfile1.replace('pk=','')
                    //attachfile1 = attachfile1.replace('pk=','') + "/" + key
                    //attachfile1 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                }
            } else {
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                }
            }

            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 = attachfile2.replace('pk=','')
                    //attachfile2 = attachfile2.replace('pk=','') + "/" + key
                    //attachfile2 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                }
            }
			mailOptions.from=sender_from
            let result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
            if (!result) {
                //try second send
                if (mailOptions.mail_auth_from == 'backup2@einvoicepro.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice2@gmail.com'
                    m_token_path = TOKEN_PATH2
                    m_credentail_file = CREDENTIAL_FILE2
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice2@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                    m_token_path = TOKEN_PATH3
                    m_credentail_file = CREDENTIAL_FILE3
                // } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice3@gmail.com') {
                //     mailOptions.mail_auth_from = 'genuwinsolution.einvoice4@gmail.com'
                //     m_token_path = TOKEN_PATH4
                //     m_credentail_file = CREDENTIAL_FILE4
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice4@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice5@gmail.com'
                    m_token_path = TOKEN_PATH5
                    m_credentail_file = CREDENTIAL_FILE5
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice5@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice6@gmail.com'
                    m_token_path = TOKEN_PATH6
                    m_credentail_file = CREDENTIAL_FILE6
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice6@gmail.com') {
                    mailOptions.mail_auth_from = 'backup@einvoicepro.com'
                    m_token_path = TOKEN_PATH7
                    m_credentail_file = CREDENTIAL_FILE7
                } else if (mailOptions.mail_auth_from == 'backup@einvoicepro.com') {
                    mailOptions.mail_auth_from = 'info@einvoicepro.com'
                    m_token_path = TOKEN_PATH8
                    m_credentail_file = CREDENTIAL_FILE8
                } else {
                    mailOptions.mail_auth_from = 'backup2@einvoicepro.com'
                    m_token_path = TOKEN_PATH
                    m_credentail_file = CREDENTIAL_FILE
                }
                result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                if (!result) {
                    console.log(`Failed send email to ${mailOptions.to} from ${mailOptions.from}`)
                }
            }
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate .getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            let data_res = {
                mail_from : mailOptions.from,
                mail_to : mailOptions.to,
                mail_to_cc : mailOptions.cc,
                date_send: `${year}-${month}-${day}`,
                time_send: `${hours}:${minutes}:${seconds}`

            }
            return response.send(Utils.response(result, result, data_res))
        } catch (e) {
			console.log(e)
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailPrivate({ request, response }) {
        try {
            let {client_id, mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            const sender_from = 'E-INVOICE WEBCASH VIETNAM <info@einvoicepro.com>'

			let mail_auth_from = 'info@einvoicepro.com'
            let m_token_path = TOKEN_PATH6
            let m_credentail_file = CREDENTIAL_FILE6
            _cnt++
            
            if(client_id == 'Cuckoo')
            {
                mail_auth_from = 'invoicekt1@cuckoovina.com'
                m_token_path = TOKEN_PATH_CUCKOO
                m_credentail_file = CREDENTIAL_CUCKOO
            }

            if(client_id == 'BK')
            {
                mail_auth_from = 'thao.nguyen@bumkoo.co.kr'
                m_token_path = TOKEN_PATH_CUCKOO
                m_credentail_file = CREDENTIAL_CUCKOO
            }

            let pk = ""
            let mailOptions = null
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 }
                        ]
                    }
                }
            } else {
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                    }
                }
            }

            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
                if (cc_to) {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        cc: cc_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                } else {
                    mailOptions = {
                        mail_auth_from: mail_auth_from,
                        to: mail_to, // list of receivers, separate by comma(;)
                        subject: subject, // Subject line
                        text: '', // plain text body
                        html: body, // html body
                        attachments: [
                            { filename: filename1, path: attachfile1 },
                            { filename: filename2, path: attachfile2 }
                        ]
                    }
                }
            }
			mailOptions.from=sender_from
            let result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
            if (!result) {
                //try second send
                if (mailOptions.mail_auth_from == 'invoicekt1@cuckoovina.com') {
                    mailOptions.mail_auth_from = 'invoicekt1@cuckoovina.com'
                    m_token_path = TOKEN_PATH_CUCKOO
                    m_credentail_file = CREDENTIAL_CUCKOO
                } else if (mailOptions.mail_auth_from == 'thao.nguyen@bumkoo.co.kr_token') {
                    mailOptions.mail_auth_from = 'thao.nguyen@bumkoo.co.kr_token'
                    m_token_path = TOKEN_PATH_BKVINA
                    m_credentail_file = TOKEN_PATH_BKVINA
        
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice4@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice5@gmail.com'
                    m_token_path = TOKEN_PATH5
                    m_credentail_file = CREDENTIAL_FILE5
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice5@gmail.com') {
                    mailOptions.mail_auth_from = 'genuwinsolution.einvoice6@gmail.com'
                    m_token_path = TOKEN_PATH6
                    m_credentail_file = CREDENTIAL_FILE6
                } else if (mailOptions.mail_auth_from == 'genuwinsolution.einvoice6@gmail.com') {
                    mailOptions.mail_auth_from = 'backup@einvoicepro.com'
                    m_token_path = TOKEN_PATH7
                    m_credentail_file = CREDENTIAL_FILE7
                } else if (mailOptions.mail_auth_from == 'backup@einvoicepro.com') {
                    mailOptions.mail_auth_from = 'info@einvoicepro.com'
                    m_token_path = TOKEN_PATH8
                    m_credentail_file = CREDENTIAL_FILE8
                } else {
                    mailOptions.mail_auth_from = 'backup2@einvoicepro.com'
                    m_token_path = TOKEN_PATH
                    m_credentail_file = CREDENTIAL_FILE
                }
                result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                if (!result) {
                    console.log(`Failed send email to ${mailOptions.to} from ${mailOptions.from}`)
                }
            }
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate .getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            let data_res = {
                mail_from : mailOptions.from,
                mail_to : mailOptions.to,
                mail_to_cc : mailOptions.cc,
                date_send: `${year}-${month}-${day}`,
                time_send: `${hours}:${minutes}:${seconds}`

            }
            return response.send(Utils.response(result, result, data_res))
        } catch (e) {
			console.log(e)
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailAJTOTAL({ request, response }) {
        try {
            let { mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            let mail_from = 'accounting@ajtotalvn.com'
            let mail_password = 'Account!!2021'
            _cntAJ++

            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
            }
            if (attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
            }
            let mailOptions = null
            if (cc_to) {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    cc: cc_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            } else {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }

            let smtp_info = {
                host: 'mail.ajtotalvn.com',
                port: 465,
                secure: true, // true for 465, false for other ports               
                //requireTLS: true,
                //debug: true,
                //logger: true,
                tls: {
                    //secureProtocol: "TLSv1_method",
                    //DEFAULT_MIN_VERSION: 'TLSv1',
                    //maxVersion: 'TLSv1.3',
                    //minVersion: 'TLSv1.2',
                    ciphers: 'SSLv3',
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: mail_from,
                    pass: mail_password
                }
            }
            if (_cntAJ == 1) {
                mailOptions.from = 'accounting01@ajtotalvn.com'
                smtp_info.auth.pass = 'Account##2021'
            } else if (_cntAJ == 2) {
                mailOptions.from = 'accounting02@ajtotalvn.com'
                smtp_info.auth.pass = 'Account##2021'
            } else if (_cntAJ == 3) {
                mailOptions.from = 'accounting@ajtotalvn.com'
                smtp_info.auth.pass = 'Account!!2021'
                _cntAJ = 0
            }
            smtp_info.auth.user = mailOptions.from

            let result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)

            if (!result) {
                //try second send
                if (mailOptions.from == 'accounting@ajtotalvn.com') {
                    mailOptions.from = 'accounting01@ajtotalvn.com'
                    smtp_info.auth.pass = 'Account##2021'
                } else if (mailOptions.from == 'accounting01@ajtotalvn.com') {
                    mailOptions.from = 'accounting02@ajtotalvn.com'
                    smtp_info.auth.pass = 'Account##2021'
                } else if (mailOptions.from == 'accounting02@ajtotalvn.com') {
                    mailOptions.from = 'accounting@ajtotalvn.com'
                    smtp_info.auth.pass = 'Account!!2021'
                }
                smtp_info.auth.user = mailOptions.from
                result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)

                if (!result) {
                    //try third send
                    if (mailOptions.from == 'accounting@ajtotalvn.com') {
                        mailOptions.from = 'accounting01@ajtotalvn.com'
                        smtp_info.auth.pass = 'Account##2021'
                    } else if (mailOptions.from == 'accounting01@ajtotalvn.com') {
                        mailOptions.from = 'accounting02@ajtotalvn.com'
                        smtp_info.auth.pass = 'Account##2021'
                    } else if (mailOptions.from == 'accounting02@ajtotalvn.com') {
                        mailOptions.from = 'accounting@ajtotalvn.com'
                        smtp_info.auth.pass = 'Account!!2021'
                    }
                    smtp_info.auth.user = mailOptions.from
                    result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
                }
            }
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailAJTOTAL', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailSMTP({ request, response }) {
        try {
            let { client_id, mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            if (_cntSent >= _smtp[client_id].sender.length) {
                _cntSent = 0
            }
            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
            }
            if (attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
            }
            let mailOptions = null
            if (cc_to) {
                mailOptions = {
                    from: _smtp[client_id].sender[_cntSent].email,
                    to: mail_to, // list of receivers, separate by comma(;)
                    cc: cc_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            } else {
                mailOptions = {
                    from: _smtp[client_id].sender[_cntSent].email,
                    to: mail_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }

            let smtp_info = {
                host: _smtp[client_id].smtp_ip,
                port: _smtp[client_id].smtp_port,
                secure: _smtp[client_id].secure, // true for 465, false for other ports               
                //requireTLS: true,
                //debug: true,
                //logger: true,
                tls: {
                    //secureProtocol: "TLSv1_method",
                    //DEFAULT_MIN_VERSION: 'TLSv1',
                    //maxVersion: 'TLSv1.3',
                    //minVersion: 'TLSv1.2',
                    ciphers: 'SSLv3',
                    secure: false,
                    ignoreTLS: true,
                    rejectUnauthorized: false
                },
                auth: {
                    user: _smtp[client_id].sender[_cntSent].email,
                    pass: _smtp[client_id].sender[_cntSent].password
                }
            }

            smtp_info.auth.user = mailOptions.from
            //console.log(smtp_info)
            let result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)

            if (!result) {
                //try second send
                if (_cntSent + 1 < _smtp[client_id].sender.length) {
                    _cntSent++
                    smtp_info.auth.user = _smtp[client_id].sender[_cntSent].email
                    smtp_info.auth.pass = _smtp[client_id].sender[_cntSent].password
                    mailOptions.from = smtp_info.auth.user
                    result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)

                    if (!result) {
                        //try third send
                        if (_cntSent + 1 < _smtp[client_id].sender.length) {
                            _cntSent++
                            smtp_info.auth.user = _smtp[client_id].sender[_cntSent].email
                            smtp_info.auth.pass = _smtp[client_id].sender[_cntSent].password
                            mailOptions.from = smtp_info.auth.user
                            result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
                        }
                        result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
                    }
                }
            }
            _cntSent++
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailSMTP', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailNoAttach({ request, response }) {
        try {
            let { mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            let mail_from = 'genuwinsolution.einvoice6@gmail.com'
            let m_token_path = TOKEN_PATH6
            let m_credentail_file = CREDENTIAL_FILE6
            _cnt++

            if (_cnt == 1) {
                mail_from = 'genuwinsolution.einvoice2@gmail.com'
                m_token_path = TOKEN_PATH2
                m_credentail_file = CREDENTIAL_FILE2
            } else if (_cnt == 2) {
                mail_from = 'genuwinsolution.einvoice2@gmail.com'
                m_token_path = TOKEN_PATH2
                m_credentail_file = CREDENTIAL_FILE2
            } /*else if (_cnt == 3) {
                mail_from = 'genuwinsolution.einvoice3@gmail.com'
                m_token_path = TOKEN_PATH3
                m_credentail_file = CREDENTIAL_FILE3
            }*/ else if (_cnt == 4) {
                mail_from = 'genuwinsolution.einvoice4@gmail.com'
                m_token_path = TOKEN_PATH4
                m_credentail_file = CREDENTIAL_FILE4
            } else if (_cnt == 5) {
                mail_from = 'genuwinsolution.einvoice5@gmail.com'
                m_token_path = TOKEN_PATH5
                m_credentail_file = CREDENTIAL_FILE5
            } else {
                mail_from = 'genuwinsolution.einvoice6@gmail.com'
                m_token_path = TOKEN_PATH6
                m_credentail_file = CREDENTIAL_FILE6
                _cnt = 0
            }

            let pk = ""

            let mailOptions = null
            if (cc_to) {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    cc: cc_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
            } else {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
            }


            let result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
            if (!result) {
                //try second send
                if (mailOptions.from == 'genuwinsolution.einvoice@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                    m_token_path = TOKEN_PATH2
                    m_credentail_file = CREDENTIAL_FILE2
                } else if (mailOptions.from == 'genuwinsolution.einvoice2@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice3@gmail.com'
                    m_token_path = TOKEN_PATH3
                    m_credentail_file = CREDENTIAL_FILE3
                } else if (mailOptions.from == 'genuwinsolution.einvoice3@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                    m_token_path = TOKEN_PATH4
                    m_credentail_file = CREDENTIAL_FILE4
                } else if (mailOptions.from == 'genuwinsolution.einvoice4@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice5@gmail.com'
                    m_token_path = TOKEN_PATH5
                    m_credentail_file = CREDENTIAL_FILE5
                } else if (mailOptions.from == 'genuwinsolution.einvoice5@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice6@gmail.com'
                    m_token_path = TOKEN_PATH6
                    m_credentail_file = CREDENTIAL_FILE6
                } else if (mailOptions.from == 'genuwinsolution.einvoice6@gmail.com') {
                    mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                    m_token_path = TOKEN_PATH2
                    m_credentail_file = CREDENTIAL_FILE2
                }
                result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                //try third send
                if (!result) {
                    if (mailOptions.from == 'genuwinsolution.einvoice@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    } else if (mailOptions.from == 'genuwinsolution.einvoice2@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice3@gmail.com'
                        m_token_path = TOKEN_PATH3
                        m_credentail_file = CREDENTIAL_FILE3
                    } else if (mailOptions.from == 'genuwinsolution.einvoice3@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                        m_token_path = TOKEN_PATH4
                        m_credentail_file = CREDENTIAL_FILE4
                    } else if (mailOptions.from == 'genuwinsolution.einvoice4@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice5@gmail.com'
                        m_token_path = TOKEN_PATH5
                        m_credentail_file = CREDENTIAL_FILE5
                    } else if (mailOptions.from == 'genuwinsolution.einvoice5@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice6@gmail.com'
                        m_token_path = TOKEN_PATH6
                        m_credentail_file = CREDENTIAL_FILE6
                    } else if (mailOptions.from == 'genuwinsolution.einvoice6@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    }
                    result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                }

                //try forth send
                if (!result) {
                    if (mailOptions.from == 'genuwinsolution.einvoice@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    } else if (mailOptions.from == 'genuwinsolution.einvoice2@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice3@gmail.com'
                        m_token_path = TOKEN_PATH3
                        m_credentail_file = CREDENTIAL_FILE3
                    } else if (mailOptions.from == 'genuwinsolution.einvoice3@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                        m_token_path = TOKEN_PATH4
                        m_credentail_file = CREDENTIAL_FILE4
                    } else if (mailOptions.from == 'genuwinsolution.einvoice4@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice5@gmail.com'
                        m_token_path = TOKEN_PATH5
                        m_credentail_file = CREDENTIAL_FILE5
                    } else if (mailOptions.from == 'genuwinsolution.einvoice5@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice6@gmail.com'
                        m_token_path = TOKEN_PATH6
                        m_credentail_file = CREDENTIAL_FILE6
                    } else if (mailOptions.from == 'genuwinsolution.einvoice6@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    }
                    result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                }
                //try fifth send
                if (!result) {
                    if (mailOptions.from == 'genuwinsolution.einvoice@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    } else if (mailOptions.from == 'genuwinsolution.einvoice2@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice3@gmail.com'
                        m_token_path = TOKEN_PATH3
                        m_credentail_file = CREDENTIAL_FILE3
                    } else if (mailOptions.from == 'genuwinsolution.einvoice3@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                        m_token_path = TOKEN_PATH4
                        m_credentail_file = CREDENTIAL_FILE4
                    } else if (mailOptions.from == 'genuwinsolution.einvoice4@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice5@gmail.com'
                        m_token_path = TOKEN_PATH5
                        m_credentail_file = CREDENTIAL_FILE5
                    } else if (mailOptions.from == 'genuwinsolution.einvoice5@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice6@gmail.com'
                        m_token_path = TOKEN_PATH6
                        m_credentail_file = CREDENTIAL_FILE6
                    } else if (mailOptions.from == 'genuwinsolution.einvoice6@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    }
                    result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                }
                //try sixth send
                if (!result) {
                    if (mailOptions.from == 'genuwinsolution.einvoice@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    } else if (mailOptions.from == 'genuwinsolution.einvoice2@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                        m_token_path = TOKEN_PATH3
                        m_credentail_file = CREDENTIAL_FILE3
                    } /*else if (mailOptions.from == 'genuwinsolution.einvoice3@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice4@gmail.com'
                        m_token_path = TOKEN_PATH4
                        m_credentail_file = CREDENTIAL_FILE4
                    }*/ else if (mailOptions.from == 'genuwinsolution.einvoice4@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice5@gmail.com'
                        m_token_path = TOKEN_PATH5
                        m_credentail_file = CREDENTIAL_FILE5
                    } else if (mailOptions.from == 'genuwinsolution.einvoice5@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice6@gmail.com'
                        m_token_path = TOKEN_PATH6
                        m_credentail_file = CREDENTIAL_FILE6
                    } else if (mailOptions.from == 'genuwinsolution.einvoice6@gmail.com') {
                        mailOptions.from = 'genuwinsolution.einvoice2@gmail.com'
                        m_token_path = TOKEN_PATH2
                        m_credentail_file = CREDENTIAL_FILE2
                    }
                    result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, attachfile1, attachfile2)
                }
            }
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMail2({ request, response }) {
        try {
            let { mail_to, subject, body, htmlcontent1, filename1 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            let totalMailTo = mail_to.split(';')
            let mail_from = 'genuwinsolution.einvoice2@gmail.com'
            let result = await Utils.ExecuteSQL("select count(*) as cnt from sendmail_log where created_at like concat(date_format(now(),'%Y-%m-%d'),'%') and mailfrom=?", [mail_from])
            let totalSend = result[0][0].cnt
            let m_token_path = TOKEN_PATH2
            let m_credentail_file = CREDENTIAL_FILE2
            if (totalSend + totalMailTo.length > 350) {
                m_token_path = TOKEN_PATH2
                m_credentail_file = CREDENTIAL_FILE2
                mail_from = 'genuwinsolution.einvoice2@gmail.com'
                result = await Utils.ExecuteSQL("select count(*) as cnt from sendmail_log where created_at like concat(date_format(now(),'%Y-%m-%d'),'%') and mailfrom=?", [mail_from])
                totalSend = result[0][0].cnt
                if (totalSend + totalMailTo.length > 350) {
                    m_token_path = TOKEN_PATH3
                    m_credentail_file = CREDENTIAL_FILE3
                    mail_from = 'genuwinsolution.einvoice3@gmail.com'
                    result = await Utils.ExecuteSQL("select count(*) as cnt from sendmail_log where created_at like concat(date_format(now(),'%Y-%m-%d'),'%') and mailfrom=?", [mail_from])
                    totalSend = result[0][0].cnt
                    if (totalSend + totalMailTo.length > 350) {
                        m_token_path = TOKEN_PATH4
                        m_credentail_file = CREDENTIAL_FILE4
                        mail_from = 'genuwinsolution.einvoice4@gmail.com'
                        result = await Utils.ExecuteSQL("select count(*) as cnt from sendmail_log where created_at like concat(date_format(now(),'%Y-%m-%d'),'%') and mailfrom=?", [mail_from])
                        totalSend = result[0][0].cnt
                        if (totalSend + totalMailTo.length > 350) {
                            Utils.Logger({ level: 'info', module: 'SendMailController', func: 'sendMail', content: `Sent mail over quote limitation of Gmail(500 mail/day).mail_to:${mail_to},subject:${subject}` })
                            return response.send(Utils.response(false, 'Sent mail over quote limitation of Gmail(500 mail/day)', null))
                        }
                    }
                }
            }
            let file_path = ""
            let mailOptions = {}
            if (filename1) {
                result = ""
                const config = {
                    format: 'A4',
                    border: { top: "0.7in", right: "0", bottom: "0.7in", left: "0" }
                }
                file_path = Helpers.publicPath(`pdf/${filename1}`)
                pdf.create(htmlcontent1, config).toFile(file_path, async (e, res) => {
                    if (e) {
                        //console.log(e)
                        Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail2', content: e.message })
                    }
                    if (res) {
                        const file_url = Env.get('APP_URL') + `/pdf/${filename1}`
                        mailOptions = {
                            from: mail_from,
                            to: mail_to, // list of receivers, separate by comma(;)
                            subject: subject, // Subject line
                            text: '', // plain text body
                            html: body, // html body
                            attachments: [
                                { filename: filename1, path: file_url }
                            ]
                        }
                        result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, file_path, "")

                    }
                })
                let i = 0
                while (!result && i < 5) {
                    await Utils._sleep(2);
                    i++
                }
                fs.unlinkSync(file_path)
                return response.send(Utils.response(result, result, null))
            } else {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
                result = await this.wrapedSendMail(mailOptions, m_token_path, m_credentail_file, file_path, "")
                return response.send(Utils.response(result, result, null))
            }
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail2', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailJinHeung({ request, response }) {
        try {
            let { mail_to, bcc, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789';
            if (_cnt >= _send_from_users.length) {
                _cnt = 0;
            }
            let mail_from = _send_from_users[_cnt].sender;
            let mailOptions = {}
            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 }
                    ]
                }
            }
            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }

            if (!attachfile1 && !attachfile2) {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
            }

            const smtp_info = {
                host: SMTP_SERVER,
                port: Number(SMTP_PORT),
                secure: false, // true for 465, false for other ports               
                //requireTLS: true,
                //debug: true,
                //logger: true,
                tls: {
                    ciphers: 'SSLv3',
                    //secureProtocol: "TLSv1_method",
                    //DEFAULT_MIN_VERSION: 'TLSv1',
                    //maxVersion: 'TLSv1.3',
                    //minVersion: 'TLSv1.2',
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: _send_from_users[_cnt].email,
                    pass: _send_from_users[_cnt].password
                }
            }
            // console.log(smtp_info)
            // console.log(mailOptions)
            _cnt++;
            let result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailJinHeung', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }
    
    //get content file txt from asp and create pdf in nodeJS
    async sendMailJinHeung2({ request, response }) {
        try {
            let { mail_to, bcc, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            if (_cnt >= _send_from_users.length) {
                _cnt = 0;
            }
            let mail_from = _send_from_users[_cnt].sender;
            let mailOptions = {}
            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
                const res = await Req.get(attachfile1)
                const pdfFileName = "pdf/report-" + new Date().getTime() + ".pdf"
                const config = {
                    format: 'A4',
                    zoomFactor: '1', // default is 1
                    border: { top: "0.5in", right: "0", bottom: "0.5in", left: "0" },
                    filename: Helpers.publicPath(pdfFileName)
                }
                const html = res.data
                const result = await Utils.createPDF(html, config)
                attachfile1 = `${APP_URL}/${pdfFileName}`
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 }
                    ]
                }
            }
            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
                const res = await Req.get(attachfile2)
                const pdfFileName = "pdf/report-" + new Date().getTime() + ".pdf"
                const config = {
                    format: 'A4',
                    zoomFactor: '1', // default is 1				 
                    border: { top: "0.5in", right: "0", bottom: "0.5in", left: "0" },
                    filename: Helpers.publicPath(pdfFileName)
                }
                const html = res.data
                const result = await Utils.createPDF(html, config)
                attachfile2 = `${APP_URL}/${pdfFileName}`
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }

            if (!attachfile1 && !attachfile2) {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
            }

            const smtp_info = {
                host: SMTP_SERVER,
                port: Number(SMTP_PORT),
                secure: false, // true for 465, false for other ports
                //debug: true,
                //logger: true,
                tls: {
                    ciphers: 'SSLv3',
                    //secureProtocol: "TLSv1_method",
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: _send_from_users[_cnt].email,
                    pass: _send_from_users[_cnt].password
                }
            }
            _cnt++;
            //console.log(smtp_info)
            //console.log(mailOptions)
            let result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailJinHeung', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailJinHeungHR({ request, response }) {
        try {
            let { mail_to, bcc, subject, body, attachfile1, attachfile2, filename1, filename2, mailIndex = 0 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789';
            if (_cnt >= _send_from_users.length) {
                _cnt = 0;
            }
            let mail_from = _send_from_users[_cnt].sender;
            let mailOptions = {}
            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 }
                    ]
                }
            }
            if (attachfile1 && attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }

            if (!attachfile1 && !attachfile2) {
                mailOptions = {
                    from: mail_from,
                    to: mail_to, // list of receivers, separate by comma(;)
                    bcc: bcc,
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                }
            }

            const smtp_info = {
                host: SMTP_SERVER,
                port: Number(SMTP_PORT),
                secure: false, // true for 465, false for other ports               
                //requireTLS: true,
                //debug: true,
                //logger: true,
                tls: {
                    ciphers: 'SSLv3',
                    //secureProtocol: "TLSv1_method",
                    //DEFAULT_MIN_VERSION: 'TLSv1',
                    //maxVersion: 'TLSv1.3',
                    //minVersion: 'TLSv1.2',
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: _send_from_users[_cnt].email,
                    pass: _send_from_users[_cnt].password
                }
            }
            // console.log(smtp_info)
            // console.log(mailOptions)
            _cnt++;
            let result = await this.smtpSendMail(mailOptions, smtp_info, attachfile1, attachfile2)
            return response.send(Utils.response(result, result, null))
        } catch (e) {
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailJinHeung', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailHR({ request, response }) {
        try {
            let { mail_to, bcc, subject, body, html_content1, html_content2, filename1, filename2, protect_pw = '', orientation = 'portrait' } = request.all()
            let mailOptions = {}
            let result = null;
            if (_cnt >= _send_from_users.length) {
                _cnt = 0;
            }
            mailOptions = {
                from: _send_from_users[_cnt].sender,
                to: mail_to, // list of receivers, separate by comma(;)
                bcc: bcc,
                subject: subject, // Subject line
                text: '', // plain text body
                html: body, // html body
            }
            let smtp_info = {
                host: SMTP_SERVER,
                port: Number(SMTP_PORT),
                secure: false, // true for 465, false for other ports               
                requireTLS: false,
                //debug: true,
                //logger: true,
                tls: {
                    ciphers: 'SSLv3',
                    //secureProtocol: "TLSv1_method",
                    secure: false,
                    ignoreTLS: true,
                    //rejectUnauthorized: false
                },
                auth: {
                    user: _send_from_users[_cnt].email,
                    pass: _send_from_users[_cnt].password
                }
            }
            _cnt++;
            if (filename1) {
                result = ""
                const config = {
                    format: 'A4',
                    border: { top: "0.7in", right: "0", bottom: "0.7in", left: "0" },
                    orientation: orientation
                }
                const pdf_filename = Date.now() + ".pdf"
                const file_path = Helpers.publicPath(`pdf/${pdf_filename}`)
                const filename2 = "protected-" + pdf_filename;
                pdf.create(html_content1, config).toFile(file_path, async (e, res) => {
                    if (e) {
                        console.log(e)
                    }
                    if (res) {
                        //console.log("protect_pw", protect_pw)
                        if (protect_pw && protect_pw.length > 2) {
                            const options = {
                                input: file_path,
                                keyLength: 256,
                                output: Helpers.publicPath(`pdf/${filename2}`),
                                password: protect_pw,
                                restrictions: {
                                    print: 'none'
                                }
                            }
                            await Utils.setPdfPassword(options);
                            const file_url = Env.get('APP_URL') + `/pdf/${filename2}`
                            mailOptions.attachments = [{ filename: filename1, path: file_url }];
                            result = await this.smtpSendMail(mailOptions, smtp_info, null, null);
                        } else {
                            const file_url = Env.get('APP_URL') + `/pdf/${pdf_filename}`
                            mailOptions.attachments = [{ filename: filename1, path: file_url }];
                            result = await this.smtpSendMail(mailOptions, smtp_info, null, null);
                        }
                    }
                });
                let i = 0
                while (!result && i < 5) {
                    await Utils._sleep(2);
                    i++
                }
                fs.unlinkSync(file_path)
                if (fs.existsSync(Helpers.publicPath(`pdf/${filename2}`))) {
                    fs.unlinkSync(Helpers.publicPath(`pdf/${filename2}`))
                }
                return response.send(Utils.response(result, result, null))
            } else {
                result = await this.smtpSendMail(mailOptions, smtp_info, null, null)
                return response.send(Utils.response(result, result, null))
            }
        } catch (e) {
            console.log(e)
            //Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMailHR', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
    }

    async sendMailByAppPassword({ request, response }) {
        try {
            
            let { client_id, mail_to, cc_to, subject, body, attachfile1, attachfile2, filename1, filename2 } = request.all()
            const screte_key = 'RVNJbjib65jkGKJB789'
            if (_cntSent >= _smtp[client_id].sender.length) {
                _cntSent = 0
            }
            let pk = ""
            if (attachfile1) {
                let aTemp = attachfile1.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile1 += "&key=" + key
                }
            }
            if (attachfile2) {
                let aTemp = attachfile2.split('pk=')
                if (aTemp.length == 2) {
                    pk = aTemp[1]
                    const key = Utils.md5(pk + screte_key)
                    attachfile2 += "&key=" + key
                }
            }
            let mailOptions = null
            if (cc_to) {
                mailOptions = {
                    from: _smtp[client_id].sender[_cntSent].email,
                    to: mail_to, // list of receivers, separate by comma(;)
                    cc: cc_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            } else {
                mailOptions = {
                    from: _smtp[client_id].sender[_cntSent].email,
                    to: mail_to, // list of receivers, separate by comma(;)
                    subject: subject, // Subject line
                    text: '', // plain text body
                    html: body, // html body
                    attachments: [
                        { filename: filename1, path: attachfile1 },
                        { filename: filename2, path: attachfile2 }
                    ]
                }
            }   

        let result = await this.wrapedSendMailByApp(mailOptions, _smtp[client_id].sender[_cntSent].email, _smtp[client_id].sender[_cntSent].password);
      
          if(!result)
          {
            result = await this.wrapedSendMailByApp(mailOptions, _smtp[client_id].sender[_cntSent].email, _smtp[client_id].sender[_cntSent].password);
            if(!result)
            {
            console.log(`Failed send email to ${mailOptions.to} from ${mailOptions.from}`)
            }
          }
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const hours = String(currentDate .getHours()).padStart(2, '0');
          const minutes = String(currentDate.getMinutes()).padStart(2, '0');
          const seconds = String(currentDate.getSeconds()).padStart(2, '0');
          let data_res = {
              mail_from : mailOptions.from,
              mail_to : mailOptions.to,
              mail_to_cc : mailOptions.cc,
              date_send: `${year}-${month}-${day}`,
              time_send: `${hours}:${minutes}:${seconds}`

          }
          return response.send(Utils.response(result, result, data_res))

        //   // Cấu hình transporter
        //   const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //       user: 'thao.nguyen@bumkoo.co.kr',      // 👉 thay bằng email Gmail của bạn
        //       pass: 'xrrcqzvexbjrsgcy'          // 👉 thay bằng App Password (16 ký tự)
        //     }
        //   });
      
        //   // Cấu hình nội dung email
        //   const mailOptions = {
        //     mail_auth_from: mail_auth_from,
        //     to: mail_to, // list of receivers, separate by comma(;)
        //     subject: subject, // Subject line
        //     text: '', // plain text body
        //     html: body, // html body
        //   };
      
        //   // Gửi email
        //   const info = await transporter.sendMail(mailOptions);
        //   console.log('✅ Email sent: ' + info.response);
        } catch (error) {
            console.log(e)
            Utils.Logger({ level: 'error', module: 'SendMailController', func: 'sendMail', content: e.message })
            return response.send(Utils.response(false, e.message, null))
        }
      }
}

module.exports = SendMailController