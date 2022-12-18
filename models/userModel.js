const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    activationLink: {
        type: String
    },
})

UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true,
});

module.exports = model('User', UserSchema)