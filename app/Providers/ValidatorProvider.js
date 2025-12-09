'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ValidatorProvider extends ServiceProvider {

  register() {

  }

  boot() {
    const Validator = use('Validator')
    Validator.extend('exists', this.exists.bind(this))
    Validator.extend('regexEmail', this.regexEmail.bind(this))
    Validator.extend('regexPhone', this.regexPhone.bind(this))
  }

  async exists(data, field, message, args, get) {
    const Database = use('Database')

    const value = get(data, field)
    if (!value) {
      return
    }

    const [table, column] = args
    let row

    // if call update
    if ('id' in data) {
      let id = get(data, 'id')
      row = await Database.table(table).where(column, value).where('id', '!=', id).count()
    } else {
      row = await Database.table(table).where(column, value).count()
    }
    if (row[0]['count(*)'] > 0) {
      throw message
    }
  }

  async regexEmail(data, field, message, args, get) {
    const value = get(data, field)
    if (!value) {
      return
    } else {
      const emailRegex = /^([A-Za-z0-9.])+([A-Za-z0-9])+@([A-Za-z0-9])+\.([A-Za-z]{2,})$/
      var res = emailRegex.test(value)
      if (!res) {
        throw message
      }
    }
  }

  async regexPhone(data, field, message, args, get) {
    const value = get(data, field)
    if (!value) {
      return
    } else {
      const phoneRegex = /((09|03|07|08|05)+([0-9]{8})\b)/
      var res = phoneRegex.test(value)
      if (!res) {
        throw message
      }
    }
  }
}

module.exports = ValidatorProvider
