const Router = require('express').Router
const userController = require('../controllers/userController')
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/authMiddleware')

const router = new Router()

router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate) // активация аккаунта по ссылке
router.get('/refresh', userController.refresh) // перезапись токена доступа (получим пару access/refresh)
router.get('/users', authMiddleware, userController.getUsers) // тестовый endpoint для получения
// списка
// пользователей авторизованными пользователями

module.exports = router
