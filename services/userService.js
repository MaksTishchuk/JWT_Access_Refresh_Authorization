const UserModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mailService')
const tokenService = require('./tokenService')
const ApiError = require('../middlewares/apiError')

class UserService {
    async registration (email, password) {
        const candidate = await UserModel.findOne({email: email})
        if (candidate) {
            throw ApiError.BadRequest(`User with email '${email}' already exists!`)
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const activationLink = uuid.v4()
        const user = await UserModel.create({
            email: email, password: hashPassword, activationLink: activationLink
        })
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
        const payloadObject = {userId: user.id, userEmail: user.email, userIsActivated: user.isActivated}
        const tokens = tokenService.generateTokens(payloadObject)
        await tokenService.saveToken(user.id, tokens.refreshToken)
        return {...tokens, user: payloadObject}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink: activationLink})
        if (!user) {
            throw ApiError.BadRequest(`User with activation link "${activationLink}" was not found!`)
        }
        user.isActivated = true
        await user.save()
    }

    async login(email, password) {
        const user = await UserModel.findOne({email: email})
        if (!user) {
            throw ApiError.BadRequest(`User with this credentials was not found!`)
        }
        const isPassEqual = await bcrypt.compare(password, user.password)
        if (!isPassEqual) {
            throw ApiError.BadRequest(`User with this credentials was not found!`)
        }
        const payloadObject = {userId: user.id, userEmail: user.email, userIsActivated: user.isActivated}
        const tokens = tokenService.generateTokens(payloadObject)
        await tokenService.saveToken(user.id, tokens.refreshToken)
        return {...tokens, user: payloadObject}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const user = await UserModel.findById(userData.id)
        const payloadObject = {userId: user.id, userEmail: user.email, userIsActivated: user.isActivated}
        const tokens = tokenService.generateTokens(payloadObject)
        await tokenService.saveToken(user.id, tokens.refreshToken)
        return {...tokens, user: payloadObject}
    }

    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}

module.exports = new UserService()