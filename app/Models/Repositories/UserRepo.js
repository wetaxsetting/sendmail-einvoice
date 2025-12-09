'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class UserRepo extends BaseRepo {
  constructor() {
    const User = use('App/Models/User')
    super(User)
  }

  async getUser(role, id) {
    // For Users
    if (role === 0) {
      return await this.model
        .query()
        .with('userAlbum')
        .with('followList')
        .where('id', id)
        .where('role', role)
        .first()
    }
    // For Idols
    else {
      return await this.model
        .query()
        .with('userAlbum')
        .with('userGame', (builder) => {
          builder.select('id', 'user_id', 'price_per_hour', 'game_id', 'game_name', 'active')
        })
        .with('followList')
        .where('id', id)
        .where('role', role)
        .first()
    }
  }
}

module.exports = UserRepo