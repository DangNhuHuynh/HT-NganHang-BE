var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var Exams_schema = new Schema({
    name: {
        type : String,
        required : true
    },
    time_test :{
        type : Number,
        required: true
    },
    number_question :{
        type : Number,
        default: 0
    },
    description :{
        type : String,
        required: true
    },
    created: {
        type: String,
        required: true,
        lowercase: true
    },
    modified: {
        type: String,
        required: true,
        lowercase: true
    },
},
{
    timestamps: true //tự động thêm field createAt và updateAt
});

module.exports = mongoose.model('Exams', Exams_schema, "exams"); // model name, schema name, collection name 