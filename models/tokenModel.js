const {Schema, model} = require('mongoose')

const TokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    refreshToken: {
        type: String,
        required: true
    },
})

TokenSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

TokenSchema.set('toJSON', {
    virtuals: true,
});

module.exports = model('Token', TokenSchema)