var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Debt_reminder_schema = new Schema({
    // Số tài khoản
    account_number: {
        type: String,
        required: true,
    },
    // Ngân hàng
    banking_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Link_banking',
    },
    // Tiền nhắc nợ
    billing_cost: {
        type: String,
        required: true,
    },
    // Nội dung
    description: {
        type: String,
        default: '',
    },
    //-1: Rejected, 0: Processing, 1: Finish
    status_debt: {
        type: Number,
        required: true,
        default: 0,
    },
    // 0: false, 1: true
    deleted: {
        type: Number,
        required: true,
        default: 0,
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

module.exports = mongoose.model('Debt_reminder', Debt_reminder_schema, "debt_reminder"); // model name, schema name, collection name 