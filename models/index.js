//Fie init db connection
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var db = {};
const { db: { host, port, name, username, password} } = config;
// `mongodb+srv://${username}:${password}@${host}/${name}?retryWrites=true&w=majority`;

const auth = username && password ? `${username}:${password}@` : ''
let connectionString = process.env.MONGODB_URI || `mongodb://${auth}${host}:${port}/${name}`;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    keepAlive: true,
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};


mongoose.connect(connectionString, options)
.then(res => console.log("Connected to DB"))
.catch(err => { // if error we will be here
    console.error('Connect database failed with error:', err.stack);
    process.exit(1);
});

// import all file in this dir, except index.js
fs.readdirSync(__dirname)
.filter(function(file){
    return (file.indexOf('.js') !== 0) && (file !== 'index.js');
})
.forEach(function(file){
    var model = require(path.join(__dirname, file));
    db[model.modelName] = model;
});

db.mongoose = mongoose;
module.exports = db;
