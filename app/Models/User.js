'use strict'

const Base = use('App/Models/Base')

class User extends Base {
    static get table() {
        return 'TES_USER'
    }  

    static get primaryKey() {
        return "PK";
      }
    static get hidden() {
    return ["USER_PW"];
    }
}

module.exports = User
