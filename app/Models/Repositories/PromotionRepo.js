'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class PromotionRepo extends BaseRepo {
    constructor() {
        const Promotion = use('App/Models/Promotion')
        super(Promotion)
    }

    async checkCode(code) {
        return await this.model.query()
            .whereRaw(` DATE_FORMAT(start_date, '%Y-%m-%d') <= DATE_FORMAT(now(), '%Y-%m-%d') AND DATE_FORMAT(now(), '%Y-%m-%d') <= DATE_FORMAT(end_date, '%Y-%m-%d')`)
            .where({code: code, active: 1})
            .first()
    }

    async getCode(code = 'id') {
        return await this.model.query()
            .select(`${code} as value`, 'name as label')
            .whereRaw(` DATE_FORMAT(start_date, '%Y-%m-%d') <= DATE_FORMAT(now(), '%Y-%m-%d') AND DATE_FORMAT(now(), '%Y-%m-%d') <= DATE_FORMAT(end_date, '%Y-%m-%d')`)
            .where({active: 1})
            .fetch()
    }
    
}

module.exports = PromotionRepo