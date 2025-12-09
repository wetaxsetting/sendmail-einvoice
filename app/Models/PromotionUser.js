'use strict'

const Base = use('App/Models/Base')

class PromotionUser extends Base {
    static get table() {
        return 'promotion_code_user';
    }  

    gift(){
        return this.hasOne('App/Models/Promotion', 'promotion_code', 'code')
    }
}

module.exports = PromotionUser
