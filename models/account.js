var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Define Schema
var Account_schema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
      type: String,
      required: true,
      default: ''
    },
    refresh_token: {
        type: String,
        default: '',
    },
    account_type: {
        type: Number,
        required: true,
        default: 1
    },
    // 0: Inactive, 1: Active
    status: {
        type: Number,
        required: true,
        default: 1
    },
},
    {
        timestamps: true //tự động thêm field createAt và updateAt
    });

//pre hook
Account_schema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  var user = this;
  bcrypt.hash(user.password + config.app.secretKey, 10, function (err, hash) {
      if (err) {
          return next(err);
      }
      console.log(hash)
      user.password = hash;
      next();
  });
});

module.exports = mongoose.model('Account', Account_schema, "account"); // model name, schema name, collection name
