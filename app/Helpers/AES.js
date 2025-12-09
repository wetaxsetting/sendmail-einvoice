'use strict'

const CryptoJS = use('crypto-js')

class AES {
  encrypt (string, secret) {
    return CryptoJS.AES.encrypt(string, secret).toString()
  }

  decrypt (string, secret) {
    const bytes = CryptoJS.AES.decrypt(string, secret)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}

module.exports = AES
