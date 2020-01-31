var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Transfer_link_banking_schema = new Schema({
    transfer_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'History_transfer',
    },
    remitter: {
        type: String,
        required: true,
    },
    banking_remitter: {
        type: String,
        required: true,
    },
    // Thời hạn
    receiver: {
        type: String,
        required: true,
    },
    banking_receiver: {
        type: String,
        required: true,
    },
    billing_cost: {
        type: String,
        required: true,
    },
    //-1: Cancel, 0: Processing, 1: Finish
    status_link_transfer: {
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

module.exports = mongoose.model('Transfer_link_banking', Transfer_link_banking_schema, "transfer_link_banking"); // model name, schema name, collection name 