var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Saving_account_schema = new Schema({
    account_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Account',
    },
    // Tiền gửi
    deposit_money: {
        type: String,
        required: true,
    },
    // Kỳ hạn đơn vị là "tháng"
    due: {
        type: String,
        required: true,
    },
    // Thời gian bắt đầu gửi
    start_time: {
        type: Date,
        required: true,
    },
    // Thời gian kết thúc
    end_time: {
        type: Date,
        required: true,
    },
    // Lãi suất
    interest_rate: {
        type: Number,
        required: true,
    },
    // Hoàn trả
    refund: {
        type: String,
        required: true,
    },
    // -1: Cancel, 0: Processing, 1: Finish
    status_save: {
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

module.exports = mongoose.model('Saving_account', Saving_account_schema, "saving_account"); // model name, schema name, collection name 