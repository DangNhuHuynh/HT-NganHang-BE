var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Customer_schema = new Schema({
    account_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      default: '',
    },
    phone: {
      type: String,
      required: true,
      default: ''
    },
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model('Customer', Customer_schema, "customer"); // model name, schema name, collection name
