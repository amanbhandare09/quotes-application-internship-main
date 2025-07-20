const express = require("express");
const quote_route = express();
const path = require('path')
const session = require("express-session");
const bodyparser = require('body-parser');

const config= require("../config/config");
quote_route.use(session({secret:config.sessionsecret}));

const auth = require("../middleware/auth");

quote_route.use(bodyparser.json());
quote_route.use(bodyparser.urlencoded({extended:true}))

quote_route.use(express.static(path.join(__dirname, 'views')));

quote_route.set('view engine','ejs');
quote_route.set('views','./views');

const quoteHandle = require("../controllers/quoteHandle")
const userController = require("../controllers/userControllers");
const reactionController = require("../controllers/reactioncontroller");

quote_route.get('/all', quoteHandle.showQuotes);
quote_route.get('/allAuthors', quoteHandle.showAuthors)
quote_route.post('/add',quoteHandle.addQuote);
quote_route.get('/searchTag/', quoteHandle.searchbyTag);
quote_route.get('/searchAuthor', quoteHandle.searchByAuthor);
quote_route.patch('/update/:id', quoteHandle.updateQuote);
quote_route.delete('/delete/:id', quoteHandle.deleteQuote);
quote_route.get('/authorSearch', quoteHandle.authorSearch);
quote_route.get('/authors/:id',quoteHandle.loadauthor);

// quote_route.patch('/:qid/like/:uid/up',reactionController.like_route);
quote_route.patch('/:qid/like/:uid/up', reactionController.like_up);
quote_route.patch('/:qid/dislike/:uid/up', reactionController.dislike_up);
quote_route.patch('/:qid/like/:uid/down', reactionController.like_down);
quote_route.patch('/:qid/dislike/:uid/down', reactionController.dislike_down);
quote_route.get('/liked/users/:qid', reactionController.getUsersWhoLikedQuote);
quote_route.get('/disliked/users/:qid', reactionController.getUsersWhoDislikedQuote);

quote_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

module.exports = quote_route;