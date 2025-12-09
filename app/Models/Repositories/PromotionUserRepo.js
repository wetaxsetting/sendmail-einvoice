'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class PromotionUserRepo extends BaseRepo {
    constructor() {
        const PromotionUser = use('App/Models/PromotionUser')
        super(PromotionUser)
    }

    async getListGift(id) {
        return this.model.query()
            .setVisible(['display_code', 'created_at', 'active'])
            .with('gift', builder => {
                builder.setVisible(['gift'])
                builder.where('active', 1)
            })
            .where({user_id: id})
            .fetch()
    }
}

module.exports = PromotionUserRepo