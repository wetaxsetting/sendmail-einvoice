'use strict'

const BaseRepo = use('App/Models/Repositories/BaseRepo')

class SettingRepo extends BaseRepo {
	constructor() {
		const Setting = use('App/Models/Setting')
		super(Setting)
	}
}
module.exports = SettingRepo