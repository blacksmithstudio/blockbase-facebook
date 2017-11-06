const request = require('request')

/**
 * Blockbase Facebook Driver
 * @namespace app.drivers.facebook
 * @author Alexandre Pereira <alex@blacksmith.studio>
 * @param {Object} app - app namespace to update
 *
 * @returns {Object} driver
 */
module.exports = (app) => {
    const Logger = app.drivers.logger
    const app_id = app.config.facebook.id
    const app_secret = app.config.facebook.secret

    if(!app_id || !app_secret)
        return Logger.error('Facebook Driver Init', `Missing 'config.fb.id' or 'config.fb.secret'`)

    const host = `https://graph.facebook.com/v2.10/`

    return {
        /**
         * grab fields infos from a connected facebook user
         * @param {[]} fields - array of fields to grab (see fb graph doc)
         * @param {string} token - access_token from the connected user
         */
         async me(fields, token){
            let url = `${host}me?fields=${fields.join(',')}&access_token=${token}`

            return new Promise((resolve, reject) => {
                request.get(url, (error, result, body) => {
                    if(error) return reject(error, null)

                    try{
                        body = JSON.parse(body)
                        if(!body || body.error)
                            return reject('cannot parse object from fb')

                        resolve(body)
                    } catch(e) {
                        Logger.error('Facebook verify token', e)
                        reject(e)
                    }
                })
            })
        },

        /**
         * verify token authenticity with user and app
         * @param {number} id - user facebook id
         * @param {string} token - access_token from the connected user
         */
        async verify_token(id, token, cb){
            let url = `${host}debug_token?access_token=${app_id}|${app_secret}&input_token=${token}&format=json`

            return new Promise((resolve, reject) => {
                request.get(url, (error, result, body) => {
                    if(error) return reject(error)

                    try{
                        body = JSON.parse(body)
                        if(!body || !body.data || (body.data && body.data.error))
                            return resolve(false)

                        let { data } = body
                        resolve(data.user_id == id && data.is_valid)
                    } catch(e) {
                        Logger.error('Facebook verify token', e)
                        reject(e)
                    }
                })
            })
        }
    }
}
