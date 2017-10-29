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
         * @param {function} cb - callback
         */
         me(fields, token, cb){
            let url = `${host}me?fields=${fields.join(',')}&access_token=${token}`
            request.get(url, (error, result, body) => {
                if(error) return cb(error, null)

                try{
                    body = JSON.parse(body)
                    if(!body || body.error)
                        return cb('cannot parse object from fb', null)

                    cb(null, body)
                } catch(e) {
                    Logger.error('Facebook verify token', e)
                    cb(null, false)
                }
            })
        },

        /**
         * verify token authenticity with user and app
         * @param {number} id - user facebook id
         * @param {string} token - access_token from the connected user
         * @param {function} cb - callback returning true if valid 
         */
        verify_token(id, token, cb){
            let url = `${host}debug_token?access_token=${app_id}|${app_secret}&input_token=${token}&format=json`
            request.get(url, (error, result, body) => {
                if(error) return cb(error, null)

                try{
                    body = JSON.parse(body)
                    if(!body || !body.data || (body.data && body.data.error))
                        return cb(null, false)

                    let { data } = body
                    cb(null, data.user_id == id && data.is_valid)
                } catch(e) {
                    Logger.error('Facebook verify token', e)
                    cb(null, false)
                }
            })
        }
    }
}
