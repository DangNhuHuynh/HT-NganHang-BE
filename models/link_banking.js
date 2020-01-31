var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Link_banking_schema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    transction_fee: {
        type: String,
        required: true,
    },
    // Key public
    publicKey: {
        type: String,
        required: true,
    },
    // Key private
    privateKey: {
        type: String,
        default: ''
    },
    // 0: Inactive, 1: Active
    status: {
        type: Number,
        required: true,
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

module.exports = mongoose.model('Link_banking', Link_banking_schema, "link_banking"); // model name, schema name, collection name 