'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class CommcodeRepo extends BaseRepo {
  constructor() {
    const Commcode = use('App/Models/Commcode')
    super(Commcode)
  }
  
  async getCommcodeVI(groupCode) {
    return await this.model
      .query()
      .select('code as value', 'name as text', 'icon as icon')
      .where('parent_code', groupCode)
      .where('use_yn', 'y')
      .orderBy('ord_seq', 'ASC')
      .orderBy('name', 'ASC')
      .fetch()
  }

  async getCommcodeENG(groupCode) {
    return await this.model
      .query()
      .select('code as value', 'name_eng as text', 'icon as icon')
      .where('parent_code', groupCode)
      .where('use_yn', 'y')
      .orderBy('ord_seq', 'ASC')
      .orderBy('name', 'ASC')
      .fetch()
  }
}

module.exports = CommcodeRepo