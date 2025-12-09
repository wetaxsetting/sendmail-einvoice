'use strict'

const Base = use('App/Models/Base')

class Setting extends Base {
  static get table() {
    return 'setting'
  }
}
module.exports = Setting