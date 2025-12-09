'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * -----------------------------------------------------------------
 * API Common
 * -----------------------------------------------------------------
 */
Route.group(() => {

}).prefix('api/common')

/**
 * -----------------------------------------------------------------
 * API User
 * -----------------------------------------------------------------
 */
Route.group(() => {
    Route.post('sendmail', 'SendMailController.sendMail')
    Route.post('sendmail2', 'SendMailController.sendMail2')
    Route.post('sendmailjh', 'SendMailController.sendMailJinHeung')
    Route.post('sendmailjh2', 'SendMailController.sendMailJinHeung2')
    Route.post('sendmailjhhr', 'SendMailController.sendMailJinHeungHR')
    Route.post('sendmailajtotal', 'SendMailController.sendMailAJTOTAL')
    Route.post('sendmailhr', 'SendMailController.sendMailHR')
    Route.post('sendmailnoattach', 'SendMailController.sendMailNoAttach')
    Route.post('sendmailwetax', 'SendMailController.sendMailWetax')
    Route.post('sendmailprivate', 'SendMailController.sendMailPrivate')
    Route.post('send-mail-by-app-password', 'SendMailController.sendMailByAppPassword')
    Route.post('test', 'SendMailController.test')
    Route.post('sendmailsmtp', 'SendMailController.sendMailSMTP')
    Route.get('getuser', 'User/UserController.getUser')
    Route.post('getredirecturl', 'User/UserController.getRedirectURL')
    Route.get('fbreturn', 'User/UserController.facebookReturn')
}).prefix('api/user')

Route.group(() => {
        Route.post('logout', 'User/UserController.logOut')
        Route.get('promotion', 'User/UserController.getListGift')
        Route.post('turn', 'User/UserController.additionalTurn')
        Route.get('code', 'User/UserController.Code')
        Route.get('spinwheel', 'User/UserController.spinWheel')
    }).prefix('api/user').middleware('user')
   
