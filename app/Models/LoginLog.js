'use strict'

const Base = use('App/Models/Base')

class LoginLog extends Base {
    static get table() {
        return 'login_log'
    }  
}

module.exports = LoginLog
