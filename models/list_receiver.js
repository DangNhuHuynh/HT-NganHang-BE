var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var List_receiver_schema = new Schema({
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
    // Tên gợi nhớ
    name_reminiscent: {
        type: String,
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

module.exports = mongoose.model('List_receiver', List_receiver_schema, "list_receiver"); // model name, schema name, collection name 