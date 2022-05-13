console.log('adding my data');
require('dotenv').config();

let Message = require('./models/Message');
let User = require('./models/User');

//connect to db
let mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// let user = new User(
//     {
//         username: 'gp23',
//         firstname: 'bob',
//         lastname: 'smith',
//         hash: 'kdafj;aldjfkl;aj',
//         salt: 43,
//         membershipStatus: true,
//         admin: true,
//     }
// );

let message = new Message(
    {
        title: 'message 2',
        timestamp: new Date(),
        content: 'this is my 2nd message.',
        author: 'gp23',
    }
);

async function pushtoDB() {
    // await user.save();
    await message.save();
    mongoose.connection.close();
}

pushtoDB();