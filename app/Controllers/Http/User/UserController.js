'use strict'

const Antl = use('Antl')
const Utils = use('Utils')
const Env = use('Env')
const Redis = use('Redis')
const Helpers = use('Helpers')
var setting = Redis.get('SETTING')
const UserRepo = use('UserRepo')
const LoginLogRepo = use('LoginLogRepo')
const PromotionRepo = use('PromotionRepo')
const PromotionUserRepo = use('PromotionUserRepo')

class UserController {

    async getUser({ response, auth }) {
        try {
            const user = await auth.getUser();
            if(!user || user.active != 1) {
                return '';
            }
            return response.send(user)
        } catch (e) {
            // Utils.Logger({ level: 'error', module: '[Front-End] UserController', func: 'getUser', content: e.message })
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    }

    async Code({request, response, auth}) {
        try {
            const user = await auth.check();
            if(!user) {
                return response.send(Utils.response(false, null, null, 404));
            }
            const {rows} = await PromotionRepo.getCode();
            if(rows.length > 0) {
                return response.send(Utils.response(true, '', rows, 200));
            }
            return response.send(Utils.response(false, null, null, 404));
        } catch(e) {
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    }

    async spinWheel({request, response, auth}) {
        try {
            const user = await auth.getUser();
            if(!user) {
                return response.send(Utils.response(false, 'Bạn cần đăng nhập để được thực hiện chức năng này', null, 403))
            }
            if(!user.active) {
                return response.send(Utils.response(false, 'Tài khoản của bạn hiện đang bị khóa', null, 403))
            }
            if(user.spin_number == 0) {
                return response.send(Utils.response(false, 'Bạn đã hết lượt quay', null, 422))
            }

            const {rows} = await PromotionRepo.getCode('code');
            const code_length = rows.length;
            if(code_length > 0) {
                var ps = 360/code_length,
                    rng = Math.floor((Math.random() * 1440) + 1086);

                let rotation = (Math.round(rng / ps) * ps);

                let picked = Math.round((rotation % 360)/ps);

                picked = picked >= code_length ? (picked % code_length) : picked;

                const data = {
                    user_id: user.id,
                    promotion_code: rows[picked].value,
                    ipaddress: request.header('x-real-ip'),
                    display_code: await this.renderCode(user.id)
                }
                const promotion_user = await PromotionUserRepo.create(data);
                if(promotion_user) {
                    await UserRepo.decrement({id: user.id, active: 1}, 'spin_number', 1)
                    return response.send(Utils.response(true, '', {picked, rotation, ps}))
                } 
                return response.send(Utils.response(false, 'Hệ thống đang quá tải, Vui lòng thử lại', null, 422))
            }
        } catch (e) {
            console.log(e);
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    }
    async getSetting({ response }) {
        try {
            let setting_cache = await Redis.get('SETTING')
            setting_cache = JSON.parse(setting_cache)
            if (!setting_cache) {
                setting_cache = await Utils.Setting()
            }
            return response.send( Utils.response(true, null, setting_cache, 200) )
        } catch (e) {
            Utils.Logger({ level: 'error', module: '[Front-End] UserController', func: 'getSetting', content: e.message })
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    } 

    async getRedirectURL({ ally }) {
        try {
            return await ally.driver('facebook').getRedirectUrl()
        } catch (e) {
            Utils.Logger({ level: 'error', module: '[Front-End] UserController', func: 'getRedirectUrl', content: e.message })
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    }

    async facebookReturn({ ally, request, response, auth }) {
        try {
            const fbUser = await ally.driver('facebook').getUser()

            const accessToken = fbUser.getAccessToken()
            const fullname = fbUser.getName()
            const email = fbUser.getEmail()
            const avatar = fbUser.getAvatar()
            const facebookID = fbUser.getId()
            const input = {
                facebook_id: facebookID,
                name: fullname,
                email: email,
                avatar: avatar,
                token: accessToken,
                ipaddress: request.header('x-real-ip')
            }
            var user = await UserRepo.findBy('email', input.email)
            if (!user) {
                user = await UserRepo.create(input)
            }
            const token = await auth.generate(user)
            let login = {
                user_id: user.id,
                token: token.token,
                ipaddress: request.header('x-real-ip')
            }
            await LoginLogRepo.create(login)
            response.redirect('/?token=' + token.token)
        } catch (e) {
            console.log(e.message)
            // Utils.Logger({ level: 'error', module: '[Front-End] UserController', func: 'facebookReturn', content: e.message })
            response.redirect('/login')
            return response.send( Utils.response(false, Antl.get('messages.error_occur'), null))
        }
    }

    async logOut({ request, response, auth }) {
        try {
            const getUser = await auth.getUser()
            if (getUser) {
                const apiToken = auth.getAuthHeader()
                let token_log = await auth.revokeTokens([apiToken])
                if (token_log.is_revoked) {
                    return true
                }
                // Auto set OFFLINE Status for Users
                const user = await auth.getUser()
                if (!user) {
                    await LoginLogRepo.updateToken({user_id: user.id, is_revoked: 0})
                    return response.send(true)
                }
            }
            return true
        } catch (e) {
            //Utils.Logger({ level: 'error', module: '[Front-End] UserController', func: 'logOut', content: e.message })
            return response.send(Utils.response(false, 'Có lỗi xảy ra', e.message, 403))
        }
    }

    async getListGift({request, response, auth}) {
        try {
            const user = await auth.getUser();
            if(!user || user.active != 1) {
                return response.send(Utils.response(false, 'Request Failed', null, 403))
            }
            const {rows} = await PromotionUserRepo.getListGift(user.id);
            if(rows.length > 0) {
                return response.send(Utils.response(true, 'Tải dữ liệu thành công', rows, 200))
            }
            return response.send(Utils.response(false, 'Không có dữ liệu tồn tại', null, 404))
        } catch (e) {
            //Utils.Logger({ level: 'error', module: 'UserController', func: 'logOut', content: e.message })
            return response.send(Utils.response(false, 'Có lỗi xảy ra', e.message, 403))
        }
    }

    async renderCode(id) {
        let uuid = 'xxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        uuid = id+uuid.toUpperCase();
        const checkUuid = await PromotionUserRepo.findBy({display_code: uuid});
        if(checkUuid){
            return await this.renderCode(id)
        }
        return uuid;
    }

    async additionalTurn({request, response, auth}) {
        try {
            const user = await auth.getUser();
            if(!user || user.active != 1) {
                return response.send(Utils.response(false, 'Request Failed', null, 403))
            }
            const {type} = request.only('type');
            if(!type || !(/^[\w]*$/).test(type)){
                return response.send(Utils.response(false, 'Trường type không được để trống', null, 422))
            }
            if(!['share', 'like'].includes(type.toLowerCase())) {
                return response.send(Utils.response(false, 'Thể loại bạn gửi lên phải là share hoặc like', null, 422))
            }
            if(type.toLowerCase() == 'like') {
                const checkLike = await UserRepo.findBy({id: user.id, active: 1, like: 0});
                if(checkLike){
                    const userUpdate = await UserRepo.update({id: user.id, active: 1, like: 1});
                    if(userUpdate) {
                        await UserRepo.increment({id: user.id, active: 1}, 'spin_number', 1);
                        return response.send(Utils.response(true, 'Bạn có thêm lượt quay mới', null, 200))
                    }
                    return response.send(Utils.response(false, 'Hệ thống lỗi', null, 422))
                }
                return response.send(Utils.response(false, 'Cảm ơn bạn đã like Fanpage của chúng tôi', null, 404))
            }
            const checkShare = await UserRepo.findBy({id: user.id, active: 1, share: 0});
            if(checkShare){
                const userUpdate = await UserRepo.update({id: user.id, active: 1, share: 1});
                if(userUpdate) {
                    await UserRepo.increment({id: user.id, active: 1}, 'spin_number', 1);
                    return response.send(Utils.response(true, 'Bạn có thêm lượt quay mới', null, 200))
                }
                return response.send(Utils.response(false, 'Hệ thống lỗi', null, 422))
            }
            return response.send(Utils.response(false, 'Cảm ơn bạn đã share Fanpage của chúng tôi', null, 404))
        } catch (e) {
            console.log(e.message)
            //Utils.Logger({ level: 'error', module: 'UserController', func: 'additionalTurn', content: e.message })
            return response.send(Utils.response(false, 'Có lỗi xảy ra', e.message, 403))
        }
    }
}

module.exports = UserController