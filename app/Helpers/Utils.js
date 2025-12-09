'use strict'

const Helpers = use('Helpers')
const Jimp = use('jimp')
const exec = require('child_process').exec;
const makeDir = use('make-dir')
const md5 = require("crypto-js/md5")
const pdf = require('html-pdf')

class Utils {
    constructor() {
        this.Database = use('Database')
        this.fileLogger = use('Logger')
        this.Drive = use('Drive')
            //this.Redis = use('Redis')
    }
    async setPdfPassword(options) {
        const isWin = process.platform === "win32";
        const args = ['--encrypt', options.password, options.password, options.keyLength, '--print=none', '--', options.input, options.output];
        //console.log(args)
        let pros = new Promise((resolve, reject) => {
            if (isWin) {
                exec('c:\\qpdf\\bin\\qpdf.exe ' + args.join(' '), function(error, stdout, stderr) {
                    if (error) {
                        console.error(error);
                        resolve(stderr);
                        return;
                    }
                    resolve(stdout);
                });
            } else {
                exec('qpdf ' + args.join(' '), function(error, stdout, stderr) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    resolve(stdout);
                });
            }
        });
        await pros;
        return options.output;
    }
    createPDF(html, options) {
        return new Promise(((resolve, reject) => {
            pdf.create(html, options).toFile((err, res) => {
                if (err !== null) { reject(err) } else { resolve(res) }
            })
        }))
    }
    md5(text) {
        text = text.toString()
        return md5(text).toString()
    }
    async InsertTable(table, fields) {
        try {
            return await this.Database
                .insert(fields)
                .into(table)
        } catch (e) {
            console.log('Utils-InsertTable: ', e)
            this.fileLogger.error(`Database error ${e.message}`)
            return e.message
        }
    }
    async ExecuteSQL(sql, para = []) {
        try {
            return await this.Database.raw(sql, para)
        } catch (e) {
            console.log('Utils-ExecuteSQL: ', e)
            this.fileLogger.error(`Database error ${e.message}`)
            return e.message
        }
    }
    async _sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
    async Setting() {
        try {
            const setting = await this.Database.table('setting').select('keyname', 'value').where('active', 1);
            if (setting.length > 0) {
                let data = {};
                setting.forEach((item) => {
                        data[item.keyname] = item.value;
                    })
                    //await this.Redis.set('SETTING', JSON.stringify(data), 'EX', 28000)
                return data;
            }
            this.Logger({ level: 'error', module: 'Utils', func: 'Setting', content: 'Setting is empty' })
            return null
        } catch (e) {
            this.Logger({ level: 'error', module: 'Utils', func: 'Setting', content: e.message })
            return false
        }
    }
    async Logger(fields) {
        try {
            return await this.Database
                .insert(fields)
                .into('syslog')
        } catch (e) {
            console.log('Utils-Logger: ', e)
            this.fileLogger.error(`Database error ${e.message}`)
        }
    }
    async actionLog(fields) {
        try {
            return await this.Database.insert(fields).into('actionlog');
        } catch (e) {
            console.log('Utils-Logger: ', e)
            this.fileLogger.error(`Database error ${e.message}`)
        }
    }
    async uploadFileToGCS(foldername, filePath, extname) {
        try {
            const rand = () => Math.random(0).toString(36).substr(2)
            const token = (length) => (rand() + rand() + rand()).substr(0, length)
            if (filePath) {
                const d = new Date()
                const path = (d.getMonth() + 1) < 10 ? d.getFullYear() + '/0' + (d.getMonth() + 1) : d.getFullYear() + '/' + (d.getMonth() + 1)
                const filename = `${foldername}/${path}/${d.getTime()}-${token(40)}.${extname}`
                const url = await this.Drive.disk('gcs').put(`${filename}`, filePath, { public: true })
                return url
            }
        } catch (e) {
            console.log('uploadFileToGCS error:' + e)
            this.Logger({ level: 'error', module: 'Utils', func: 'uploadFileToGCS', content: e.message })
            return false
        }
    }
    async resizeImage(beforePath, extname, max_size = 500) {
        try {
            if (!beforePath) {
                console.log('File path invalid.')
                return false
            }
            const image = await Jimp.read(beforePath)
            if (image) {
                let w = image.bitmap.width
                let h = image.bitmap.height
                if (w <= max_size && h <= max_size) {
                    return beforePath
                } else {
                    const d = new Date()
                    const height = h - Math.ceil((h * (1 - max_size / w)))
                    const rand = () => Math.random(0).toString(36).substr(2);
                    const token = (length) => (rand() + rand() + rand()).substr(0, length)
                    const image_name = `${d.getTime()}-${token(40)}.${extname}`
                    if (h > w) {
                        const width = w - Math.ceil((w * (1 - max_size / h)))
                        await image.resize(width, max_size).quality(70).writeAsync(Helpers.publicPath(image_name))
                    } else {
                        await image.resize(max_size, height).quality(70).writeAsync(Helpers.publicPath(image_name))
                    }
                    return Helpers.publicPath(image_name)
                }
            } else {
                console.log('Invalid image resizeImage')
                return false;
            }
        } catch (e) {
            console.log('resizeImage error:' + e)
            this.Logger({ level: 'error', module: 'Utils', func: 'resizeImage', content: e.message })
            return false
        }
    }
    async deleteFileGCS(filename) {
        const isDeleted = await this.Drive.disk('gcs').delete(filename)
        return isDeleted
    }
    async putVideoFile(file, folder) {
        try {
            const type = typeof file
            const fileExt = file.extname

            let current = new Date()
            let year = current.getFullYear()
            let month = current.getMonth() + 1
            let date = current.getDate()
            let path = `${folder}/${year}/${month}/${date}`
            let savePath = await makeDir(`/data/hiwin/video/${path}`)
            let fileName = `${current.getTime()}.${fileExt.toLowerCase()}`

            if (type !== "string") {
                await file.move(savePath, { name: fileName })
                if (!file.moved()) {
                    return file.error()
                }
            }
            return `${path}/${fileName}`
        } catch (e) {
            console.log(e.message)
            this.Logger({ level: 'error', module: 'Utils', func: 'putVideoFile', content: e.message })
            return false

        }
    }
    async putAudioFile(file, folder) {
            try {
                const type = typeof file
                const fileExt = file.extname

                let current = new Date()
                let year = current.getFullYear()
                let month = current.getMonth() + 1
                let date = current.getDate()
                let path = `${folder}/${year}/${month}/${date}`
                let savePath = await makeDir(`/data/hiwin/audio/${path}`)
                let fileName = `${current.getTime()}.${fileExt.toLowerCase()}`

                if (type !== "string") {
                    await file.move(savePath, { name: fileName })
                    if (!file.moved()) {
                        return file.error()
                    }
                }
                return `${path}/${fileName}`
            } catch (e) {
                console.log(e.message)
                this.Logger({ level: 'error', module: 'Utils', func: 'putAudioFile', content: e.message })
                return false

            }
        }
        /* #New Function */

    /* Make response */
    response(success, message, data = {}, code = 200) {
        return {
            success,
            message,
            data,
            code
        }
    }
}

module.exports = Utils