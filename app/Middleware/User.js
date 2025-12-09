'use strict'
const Env = use('Env')
const Utils = use('Utils')

class User {
	async handle({ response, auth }, next) {
		try {
			const User = await auth.getUser();
			if (!User) {
				return response.status(401).send('You are not logged');
			}
			await next();

		} catch (e) {
			console.log(e)
			return response.status(401).send(
				Utils.response(false, 'Middleware: ' + e.message, null, 401)
			);
		}
	}
}

module.exports = User;