let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MessageSchema = new Schema(
    {
        title: String,
        timestamp: Date,
        content: String,
        author: String, //author should be the User's username/email
    }
);

module.exports = mongoose.model('Message', MessageSchema);