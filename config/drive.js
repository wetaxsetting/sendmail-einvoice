'use strict'

const Env = use('Env')

module.exports = {
	disks: {
		gcs: {
			driver: 'gcs',
			keyFilename: Env.get('GCS_KEY_FILE_NAME'), // path to json file
			bucket: Env.get('GCS_BUCKET')
		}
	}
}