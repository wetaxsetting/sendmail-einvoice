const { ServiceProvider, ioc } = require('@adonisjs/fold')

const Utils = use('App/Helpers/Utils')
const AES = use('App/Helpers/AES')
const Request = use('App/Helpers/Request')
const CommcodeRepo = use('App/Models/Repositories/CommcodeRepo')
const UserRepo = use('App/Models/Repositories/UserRepo')
const SettingRepo = use('App/Models/Repositories/SettingRepo')
const LoginLogRepo = use('App/Models/Repositories/LoginLogRepo')
const PromotionRepo = use('App/Models/Repositories/PromotionRepo')
const PromotionUserRepo = use('App/Models/Repositories/PromotionUserRepo')

class BindingProvider extends ServiceProvider {
  register() {    
    ioc.bind('PromotionUserRepo', function (app) {
      return new PromotionUserRepo
    })
    ioc.bind('PromotionRepo', function (app) {
      return new PromotionRepo
    })
    ioc.bind('LoginLogRepo', function (app) {
      return new LoginLogRepo
    })
    ioc.bind('Utils', function (app) {
      return new Utils
    })
    ioc.bind('AES', function (app) {
      return new AES
    })
    ioc.bind('Request', function (app) {
      return new Request
    })
    ioc.bind('CommcodeRepo', function (app) {
      return new CommcodeRepo
    })
    ioc.bind('UserRepo', function (app) {
      return new UserRepo
    })
    ioc.bind('SettingRepo', function (app) {
      return new SettingRepo
    })
  }

  boot() {
    // optionally do some intial setup
  }
}

module.exports = BindingProvider
