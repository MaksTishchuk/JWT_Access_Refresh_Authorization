const userService = require('../services/userService')
const {validationResult} = require('express-validator')
const ApiError = require('../middlewares/apiError')

class UserController {
    async registration (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error!', errors.array()))
            }
            const {email, password} = req.body
            const userData = await userService.registration(email, password)
            // Сохраним refresh токен в куках:
            res.cookie(
                'refreshToken',
                userData.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} // httpOnly запретит получать эту куку из браузера, чтобы никто не мог получить доступ к ней
            )
            return res.json(userData)
        } catch (err) {
            next(err) // Попадем в middleware errorMiddleware
        }
    }

    async login (req, res, next) {
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password)
            res.cookie(
                'refreshToken',
                userData.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} // httpOnly запретит получать эту куку из браузера, чтобы никто не мог получить доступ к ней
            )
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }

    async logout (req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.status(200).json(token)
        } catch (err) {
            next(err)
        }
    }

    async activate (req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (err) {
            next(err)
        }
    }

    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie(
                'refreshToken',
                userData.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} // httpOnly запретит получать эту куку из браузера, чтобы никто не мог получить доступ к ней
            )
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }

    async getUsers (req, res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json(users)
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new UserController()