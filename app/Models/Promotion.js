'use strict'

const Base = use('App/Models/Base')

class Promotion extends Base {
    static get table() {
        return 'promotion_code';
    }  
}

module.exports = Promotion
