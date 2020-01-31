var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Consumer_credit_schema = new Schema({
    account_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Account',
    },
    account_number: {
        type: String,
        required: true,
    },
    // Số dư
    balance: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Consumer_credit', Consumer_credit_schema, "consumer_credit"); // model name, schema name, collection name 