var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Black_list_token_schema = new Schema({
    // AccessToken khi user logout
    accessToken: {
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

module.exports = mongoose.model('Black_list_token', Black_list_token_schema, "Black_list_token"); // model name, schema name, collection name 