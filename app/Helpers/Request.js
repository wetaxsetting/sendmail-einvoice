'use strict'

const axios = use('axios')

class Request {
  get (url, config) {
    return axios.get(url, config)
  }

  post (url, data, config) {
    return axios.post(url, data, config)
  }

  all (...functions) {
    return Promise.all([...functions])
  }
}

module.exports = Request
