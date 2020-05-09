var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var LinkBankingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    partnerId: {
      type: String,
      required: true,
    },
    // Private Key (using to create sign)
    publicKey: {
        type: String,
        default: ''
    },
    // Secret key (using to hash content)
    secretKey: {
        type: String,
        default: ''
    },
    // 0: Inactive, 1: Active
    status: {
        type: Number,
        required: true,
        default: 1,
    },
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('LinkBanking', LinkBankingSchema, "link_banking"); // model name, schema name, collection name
