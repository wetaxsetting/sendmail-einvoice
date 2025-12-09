'use strict'
const path = use('path')
/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  '@adonisjs/framework/providers/AppProvider',
  '@adonisjs/framework/providers/ViewProvider',
  '@adonisjs/lucid/providers/LucidProvider',
  '@adonisjs/bodyparser/providers/BodyParserProvider',
  '@adonisjs/cors/providers/CorsProvider',
  '@adonisjs/shield/providers/ShieldProvider',
  '@adonisjs/session/providers/SessionProvider',
  '@adonisjs/auth/providers/AuthProvider',
  '@adonisjs/ally/providers/AllyProvider',
  '@adonisjs/antl/providers/AntlProvider',
  '@adonisjs/mail/providers/MailProvider',
  '@adonisjs/validator/providers/ValidatorProvider',
  '@adonisjs/drive/providers/DriveProvider',
  'adonis-drive-google/providers/DriveProvider',
  '@adonisjs/validator/providers/ValidatorProvider',
  path.join(__dirname, '../app/Providers/AppProvider'),
  path.join(__dirname, '../app/Providers/BindingProvider'),
  path.join(__dirname, '../app/Providers/RequestProvider'),
  path.join(__dirname, '../app/Providers/ValidatorProvider')
 
]

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.cannot be extended, since their is no public interface to extend
|
*/
const aceProviders = [
  '@adonisjs/lucid/providers/MigrationsProvider'
]

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {}

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
//const commands = ['App/Commands/NuxtBuild']

module.exports = { providers, aceProviders, aliases }
