var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var ReceiverSchema = new Schema({
    customer_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    // Số tài khoản
    account_number: {
        type: String,
        required: true,
    },
    // Ngân hàng
    bank: {
        type: String,
        required: true,
    },
    bankId: {
        type: Schema.Types.ObjectId,
        ref: 'LinkBanking',
    },
    // Tên gợi nhớ
    nickname: {
        type: String,
        required: true,
    },
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Receiver', ReceiverSchema, "receiver"); // model name, schema name, collection name
