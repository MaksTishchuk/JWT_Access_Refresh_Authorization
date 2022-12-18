const jwt = require('jsonwebtoken')
const tokenModel = require('../models/tokenModel')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {accessToken, refreshToken}
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (err) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (err) {
            return null
        }
    }

    async saveToken (userId, refreshToken) {
        /*
        При данном виде сохранения токена в БД, при входе с другого устройства, будет
        выбрасывать с аккаунта с другого устройства, на котором был выполнен вход.
        Чтобы этого не происходило, нужно продумывать механизм хранения списка токенов в БД,
        но так, чтобы ее не захламлять.
        */
        const tokenData = await tokenModel.findOne({user: userId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        const token = await tokenModel.create({user: userId, refreshToken: refreshToken})
        return token
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData
    }
}

module.exports = new TokenService()