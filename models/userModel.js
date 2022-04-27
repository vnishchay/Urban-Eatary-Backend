const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please provide your first name'],
            maxlength: 20,
        },
        lastName: {
            type: String,
            required: [true, 'Please provide your last name'],
            maxlength: 20,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'restaurant'],
            default: 'user',
        },
        email: {
            type: String,
            unique: true,
        },
        googleUser: {
            id: {
                type: String,
            },
            picture: {
                type: String,
            },
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords are not the same!',
            },
        },
        passwordChangedAt: Date,
        address: String,
        phoneNumber: {
            type: String,
            minlength: 10,
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.CheckPass = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const UserModel = mongoose.model(
    "User",
    userSchema,
    "User Model"
);

module.exports = UserModel;