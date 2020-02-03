var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define Schema
var Account_schema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    refresh_token: {
        type: String,
        default: '',
    },
    // 0: Inactive, 1: Active
    status: {
        type: Number,
        required: true,
        default: 1
    },
    created: {
        type: String,
        required: true,
        lowercase: true,
    },
    modified: {
        type: String,
        required: true,
        lowercase: true,
    },
},
    {
        timestamps: true //tự động thêm field createAt và updateAt
    });

//pre hook
Account_schema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('Account', Account_schema, "account"); // model name, schema name, collection name 