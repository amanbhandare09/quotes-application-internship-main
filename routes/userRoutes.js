const express = require("express");
const user_route = express();
const path = require('path')
const session = require("express-session");
const bodyparser = require('body-parser');

const config= require("../config/config");
user_route.use(session({secret:config.sessionsecret}));

const auth = require("../middleware/auth");

user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({extended:true}))

user_route.use(express.static(path.join(__dirname, 'views')));

user_route.set('view engine','ejs');
user_route.set('views','./views');

const quoteHandle = require("../controllers/quoteHandle")
const userController = require("../controllers/userControllers");
const reactionController = require("../controllers/reactioncontroller");


user_route.get('/auth/sign-up',userController.loadRegister);
user_route.get('/',userController.indexload);
user_route.get('/auth/sign-in',userController.loginload);
// user_route.get('/:id/quotes',userController.loadhome)
user_route.get('/logout',userController.userlogout)
user_route.get('/users',userController.getnames);
user_route.get('/authors',quoteHandle.loadauthor);
user_route.post('/auth/sign-up',userController.insertUser);
user_route.post('/auth/sign-in',userController.verifylogin);
user_route.get('/users/:id/userpage',userController.loadhome);
user_route.patch('/edit',userController.updateprofile);
user_route.delete('/delete/:user_id',userController.deleteuser);


user_route.get('/users/:id/quoteshome',userController.quoteshome);
user_route.get('/like/:id',userController.getquotereact);


user_route.get('/users/:id/quotes',reactionController.myquotess);
user_route.get('/users/:id/favourite-quotes',reactionController.dislikedbyme);
user_route.get('/users/:id/unfavourite-quotes',reactionController.dislikedbyme);

module.exports = user_route;