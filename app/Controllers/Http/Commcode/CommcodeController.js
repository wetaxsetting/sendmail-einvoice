'use strict'

const Antl = use('Antl')
const Utils = use('Utils')
const Logger = use('Logger')
const Redis = use('Redis');
const Env = use('Env');
const ex = Env.get('CACHE_EXPIRE')
const CommcodeRepo = use('CommcodeRepo')

class CommcodeController {
  async getCommCode({ request, response }) {
    try {
      let { group, lang } = request.all()
      if (lang == undefined || lang == null) {
        lang = 'vi'
      }
      if (lang == 'vi') {
        const commCodesVI = await CommcodeRepo.getCommcodeVI(group)
        if (commCodesVI) {
          return response.send(
            Utils.response(true, Antl.get('messages.request_successful'), commCodesVI)
          )
        }
      } else {
        const commCodesEN = await CommcodeRepo.getCommcodeENG(group)
        if (commCodesEN) {
          return response.send(
            Utils.response(true, Antl.get('messages.request_successful'), commCodesEN)
          )
        }
      }
    } catch (e) {
      Logger.error(`CommcodeController-getCommCode: ${e.message}`)
      return response.send(
        Utils.response(false, Antl.get('messages.error_occur'), null)
      )
    }
  }
}

module.exports = CommcodeController