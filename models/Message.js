let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const { DateTime } = require('luxon');

let MessageSchema = new Schema(
    {
        title: String,
        timestamp: Date,
        content: String,
        author: String, //author should be the User's username/email
    }
);

MessageSchema
    .virtual('formattedTimestamp')
    .get(function () {
        return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
    });
module.exports = mongoose.model('Message', MessageSchema);