'use strict'

const Base = use('App/Models/Base')

class Commcode extends Base {
  static get table() {
    return 'commcode'
  }
}

module.exports = Commcode
