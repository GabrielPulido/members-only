let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: String,
        firstname: String,
        lastname: String,
        hash: String,
        salt: String,
        membershipStatus: Boolean,
        admin: Boolean,
    });

module.exports = mongoose.model('User', UserSchema);