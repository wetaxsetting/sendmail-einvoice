'use strict'

const _ = use('lodash')

class BaseRepo {
  constructor(model = {}) {
    this.model = model
    this.Utils = use('Utils')
    this.Database = use('Database')
    this.Hash = use('Hash')
    this.Mail = use('Mail')
  }

  async paginate(page = 1, limit = 2) {
    let model = await this.model.query().orderBy('id', 'DESC').paginate(page, limit)
    return model
  }

  async all() {
    let data = await this.model.query().orderBy('id', 'DESC').fetch()
    return data
  }

  async find(id) {
    return await this.model.find(id)
  }

  async findBy(field, value) {
    return await this.model.findBy(field, value)
  }

  async first() {
    return await this.model.first()
  }

  async saveData(model, data) {
    _.forEach(data, (val, key) => {
      if (val !== null) model[key] = val
    })
    if (await model.save()) {
      return model
    }
    return false
  }

  async updateOrCreate(data) {
    let model = await this.model.first()
    if (!model) {
      model = new this.model
    }
    return await this.saveData(model, data)
  }

  async create(data) {
    let model = new this.model
    return await this.saveData(model, data)
  }

  async update(data) {
    let model = await this.model.find(data.id)
    return await this.saveData(model, data)
  }

  async delete(data) {
    let id = (data instanceof Object && 'id' in data) ? data.id : data
    let model = await this.model.find(id)
    if (await model.delete()) {
      return model
    }
    return false
  }

  async whereIn(ids) {
    let records = this.Database.table(this.model.table).whereIn('id', ids)
    return records
  }

  async findAttribute(attrs) {
    let query = this.Database.table(this.model.table)
    for (var mixKeys in attrs) {
      let mixs = mixKeys.split(':')
      let field = mixs[0]
      let condition = mixs[1]
      let value = attrs[mixKeys]
      query = query.where(field, condition, value)
    }
    return query
  }

  async findByWithOr(field_1, field_2, value) {
    let model = await this.model
      .query()
      .where(field_1, value)
      .orWhere(field_2, value)
      .first()
    return model
  }

  async findByWithAnd(field_1, field_2, value_1, value_2) {
    try {
      let model = await this.model
        .query()
        .where(field_1, value_1)
        .where(field_2, value_2)
        .first()
      return model
    } catch (e) {
      console.log(e.message)
    }
  }

  async findMulti(field, value) {
    let model = await this.model
      .query()
      .where(field, value)
      .orderBy('id', 'DESC')
      .fetch()
    return model
  }

  async updateBy(field, field_value, data) {
    try {
      let model = await this.model.findBy(field, field_value)
      return await this.saveData(model, data)
    } catch (e) {
      console.log(e.message)
    }
  }
  
  async increment(condition, field, value) {
    return await this.model.query()
      .where(condition)
      .increment(field, value)
  }

  async decrement(condition, field, value) {
    return await this.model.query()
      .where(condition)
      .decrement(field, value)
  }
  async update2(field_update,field_where) {
    try {
      return await this.model
        .query()
        .where(field_where)
        .update(field_update)
    } catch (e) {
      this.Utils.Logger({level:'error',module:'BaseRepo',func:'update2',content:e.message})
      return false
    }
  }
}

module.exports = BaseRepo