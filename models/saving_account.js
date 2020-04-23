var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var SavingAccountSchema = new Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Customer',
    },
    account_number: {
        type: String,
        required: true,
    },
    saved_money: {
        type: Number,
        required: true,
    },
    // 0: Inactive, 1: Active
    status: {
        type: Number,
        required: true,
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('SavingAccount', SavingAccountSchema, "saving_account"); // model name, schema name, collection name
