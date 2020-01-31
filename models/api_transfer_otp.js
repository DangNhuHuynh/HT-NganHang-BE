var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Api_transfer_otp_schema = new Schema({
    transfer_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'History_transfer',
    },
    otp_code: {
        type: String,
        required: true,
    },
    // Thời hạn
    expried: {
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

module.exports = mongoose.model('Api_transfer_otp', Api_transfer_otp_schema, "api_transfer_otp"); // model name, schema name, collection name 