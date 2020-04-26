var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var TransactionHistorySchema = new Schema({
    // Số TK người chuyển
    remitter_account_number: {
        type: String,
        required: true,
    },
    bank_remitter: {
        type: String,
        required: true,
    },
    // Số TK người nhận
    receiver_account_number: {
        type: String,
        required: true,
    },
    bank_receiver: {
        type: String,
        required: true,
    },
    // Số tiền gửi
    deposit_money: {
        type: String,
        required: true,
    },
    // Nội dung
    description: {
        type: String,
    },
    // Hình thức thanh toán phí: "Người gửi Trả" or "Người nhận trả"
    // 0: "Gửi Trả", 1: "Nhận Trả"
    type_settle: {
        type: Number,
        required: true,
    },
    // 0: "Bình thường", 1: "Thanh toán nhắc nợ"
    transaction_type: {
        type: Number,
        required: true,
        default: 0,
    },
    // Chi phí giao dịch
    billing_cost: {
        type: String,
        required: true,
    },
    //-1: Rejected(Không chấp nhận), 0: Processing(Đang xử lý), 1: Success (Thành công)
    status: {
        type: Number,
        required: true,
        default: 0,
    }
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('TransactionHistory', TransactionHistorySchema, "transaction_history"); // model name, schema name, collection name
