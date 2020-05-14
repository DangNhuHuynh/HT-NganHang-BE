var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var LinkBankingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    // Their bank partner id
    partnerId: {
      type: String,
      required: true,
    },
    // Our partner id
    selfPartnerId: {
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
  // Api endpoint
    endpoint: {
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
