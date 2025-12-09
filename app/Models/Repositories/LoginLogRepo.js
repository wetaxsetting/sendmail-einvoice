'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class LoginLogRepo extends BaseRepo {
    constructor() {
        const LoginLog = use('App/Models/LoginLog')
        super(LoginLog)
    }

    async updateToken(condition) {
        return this.model.query.where(condition).update({is_revoked: 1})
    }
}

module.exports = LoginLogRepo