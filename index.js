const express = require("express");
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://localhost:27017/quotestest");

const PORT = 3050;

const app = express();
const userRoute = require('./routes/userRoutes');
const quoteRoute = require('./routes/quoteRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

// Define rate limiting middleware for non-logged-in users
const nonLoggedInRateLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,  // 24 hours
    max: 10,  // Limit each IP to 10 requests per windowMs
    message: 'Only 10 requests per day are allowed for non-logged-in users',
    headers: true,
    keyGenerator: (req, res) => req.ip, // Generate key based on IP address
    handler: (req, res, next, options) => {
        const count = options.store.get(req.ip);  // Get the request count for the IP address
        console.log(`Rate limit exceeded for IP: ${req.ip}. Request count: ${count}`);
        res.status(429).send(`Only 10 requests per day are allowed for non-logged-in users. You have made ${count} requests.`);
    }
});

// Middleware to log each request
app.use((req, res, next) => {
    console.log(`Request made from IP: ${req.ip}`);
    next();
});

// Middleware to apply rate limiting only for non-logged-in users on /quotes route
app.use('/quotes', (req, res, next) => {
    if (req.session && req.session.userId) {
        // If the user is logged in, proceed without rate limiting
        next();
    } else {
        // Apply rate limit for non-logged-in users
        nonLoggedInRateLimit(req, res, next);
    }
});

app.use('/', userRoute);
app.use('/quotes', quoteRoute);

app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});

// Use if you are using dotenv
// const PORT = process.env.SERVER_PORT;


 