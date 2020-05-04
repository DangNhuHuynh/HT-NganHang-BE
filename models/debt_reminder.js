var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var DebtReminderSchema = new Schema({
    account_number: {
      type: String,
      required: true,
    },
    banking: {
      type: String,
      required: true,
    },
    // Số tài khoản được nhắc nợ
    debt_account_number: {
        type: String,
        required: true,
    },
    // Ngân hàng của người được nhắc nợ
    debt_banking: {
        type: String,
        required: true,
    },
    // Tiền nhắc nợ
    money: {
        type: String,
        required: true,
    },
    // Nội dung
    description: {
        type: String,
        default: '',
    },
    //0: waiting for payment, 1: done, 2: rejected
    status: {
        type: Number,
        required: true,
        default: 0,
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('DebtReminder', DebtReminderSchema, "debt_reminder"); // model name, schema name, collection name
