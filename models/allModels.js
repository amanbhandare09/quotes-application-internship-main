const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type:String, 
        required:true
    },
    last_name:{
        type:String, 
        required:true
    },
    email: {
        type:String, 
        required:true
    }, 
    password:{
        type:String, 
        required:true
    },
    isactive:{
        type:Boolean,
        default: true
    },
});

const quotes = new mongoose.Schema({
    quote: {
        type:String,
        required:true
    },
    author: {
        type:String, 
        required:true
    },
    tags: {
        type:String, 
        required:true
    },
    likes: {
        type:Number,
        default:0
    },
    dislikes: {
        type: Number,
        default:0
    },
    userId: {
        type:String,
        required: true
    }
});


const UserQuoteReaction = new mongoose.Schema({
    userId: {
        type:String,
        requried:true
    },
    quoteId: {
        type:String,
        required:true
    },
    like: {
        type: Boolean,
        default: false
    },
    dislike: {
        type: Boolean,
        default: false
    }
});

const Users = mongoose.model('Users',userSchema);
const Quotes = mongoose.model('Quotes',quotes);
const UserQuote = mongoose.model('UserQuote',UserQuoteReaction);
     
module.exports = {
    Users,
    Quotes,
    UserQuote
}