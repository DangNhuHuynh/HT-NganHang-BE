var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var TransferOtpSchema = new Schema({
    transaction_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'TransactionHistory',
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
        default: 0,
    },
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('TransferOtp', TransferOtpSchema, "transfer_otp"); // model name, schema name, collection name
