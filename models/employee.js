var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Employee_schema = new Schema({
    account_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    ma_nv: {
      type: String,
      required: true,
      default: '',
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
    id_card: {
      type: String,
      required: true,
      default: ''
    },
    position: {
      type: String,
      required: true,
      default: ''
    },
    department: {
      type: Number,
      required: true,
      default: ''
    },
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model('Employee', Employee_schema, "employee"); // model name, schema name, collection name
