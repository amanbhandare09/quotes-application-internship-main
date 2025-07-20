const database =require('../models/allModels');
const bcrypt = require('bcrypt')
const path = require('path')
// const User = database.Users;
const Quotes = database.Quotes;



// Controller functions

const UserQuote = database.UserQuote;
const Users = database.Users;

const like_up = async (req, res) => {
    const userId = req.params.uid;
    const quoteId = req.params.qid;

    try {
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        let userReaction = await UserQuote.findOne({ quoteId: quoteId, userId: userId });

        if (!userReaction) {
            userReaction = new UserQuote({
                userId: userId,
                quoteId: quoteId,
                like: true,
                dislike: false
            });
            quote.likes += 1;
        } else {
            if (!userReaction.like) {
                if (userReaction.dislike) {
                    userReaction.dislike = false;
                    quote.dislikes -= 1;
                }
                userReaction.like = true;
                quote.likes += 1;
            }
        }

        await userReaction.save();
        await quote.save();

        res.send(`<i class='bx ${userReaction.like ? "bxs-like liked" : "bx-like"}' hx-patch="/quotes/${quoteId}/like/${userId}/${userReaction.like ? 'down' : 'up'}" hx-swap="outerHTML"></i>`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const like_down = async (req, res) => {
    const userId = req.params.uid;
    const quoteId = req.params.qid;

    try {
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        let userReaction = await UserQuote.findOne({ quoteId: quoteId, userId: userId });

        if (userReaction && userReaction.like) {
            userReaction.like = false;
            quote.likes -= 1;

            await userReaction.save();
            await quote.save();
        }

        res.send(`
            <i class='bx bx-like' hx-patch="/quotes/${quoteId}/like/${userId}/up" hx-swap="outerHTML"></i>
         `);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const dislike_up = async (req, res) => {
    const userId = req.params.uid;
    const quoteId = req.params.qid;

    try {
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        let userReaction = await UserQuote.findOne({ quoteId: quoteId, userId: userId });

        if (!userReaction) {
            userReaction = new UserQuote({
                userId: userId,
                quoteId: quoteId,
                like: false,
                dislike: true
            });
            quote.dislikes += 1;
        } else {
            if (!userReaction.dislike) {
                if (userReaction.like) {
                    userReaction.like = false;
                    quote.likes -= 1;
                }
                userReaction.dislike = true;
                quote.dislikes += 1;
            }
        }

        await userReaction.save();
        await quote.save();

        res.send(`<i class='bx ${userReaction.dislike ? "bxs-dislike disliked" : "bx-dislike"}' hx-patch="/quotes/${quoteId}/dislike/${userId}/${userReaction.dislike ? 'down' : 'up'}" hx-swap="outerHTML"></i>`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const dislike_down = async (req, res) => {
    const userId = req.params.uid;
    const quoteId = req.params.qid;

    try {
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        let userReaction = await UserQuote.findOne({ quoteId: quoteId, userId: userId });

        if (userReaction && userReaction.dislike) {
            userReaction.dislike = false;
            quote.dislikes -= 1;

            await userReaction.save();
            await quote.save();
        }

        res.send(`
            <i class='bx ${userReaction && userReaction.like ? "bxs-dislike liked" : "bx-dislike"}' hx-patch="/quotes/${quoteId}/like/${userId}/up" hx-swap="outerHTML"></i>
         `);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUsersWhoLikedQuote = async (req, res) => {
    const quoteId = req.params.qid;

    try {
        // Find all user reactions for the given quoteId where like is true
        const userReactions = await UserQuote.find({ quoteId: quoteId, like: true });

        // Extract userIds from the reactions
        const userIds = userReactions.map(reaction => reaction.userId);

        // Find users by userIds and select their first names
        const users = await Users.find({ _id: { $in: userIds } }).select('first_name');

        // Extract the first names from the users
        const userFirstNames = users.map(user => user.first_name);

        res.json(userFirstNames);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUsersWhoDislikedQuote = async (req, res) => {
    const quoteId = req.params.qid;

    try {
        // Find all user reactions for the given quoteId where dislike is true
        const userReactions = await UserQuote.find({ quoteId: quoteId, dislike: true }).populate('userId', 'first_name');

        // Extract userIds from the reactions
        const userIds = userReactions.map(reaction => reaction.userId);

        // Find users by userIds and select their first names
        const users = await Users.find({ _id: { $in: userIds } }).select('first_name');

        // Extract the first names from the users
        const userFirstNames = users.map(user => user.first_name);

        res.json(userFirstNames);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



likedbyme=  async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find reactions where the user has liked the quote
        const reactions = await Reaction.find({ userId, like: true });

        // Extract quote IDs from reactions
        const quoteIds = reactions.map(reaction => reaction.quoteId);

        // Fetch quotes based on extracted IDs
        const quotes = await Quote.find({ _id: { $in: quoteIds } });

        // Render quotes or send JSON response
        res.render('likedQuotes', { quotes }); // Change to your view/template
        // Or send JSON response
        // res.json(quotes);
    } catch (error) {
        console.error('Error fetching liked quotes:', error);
        res.status(500).send('Server Error');
    }
};

// Fetch Quotes Disliked by User
dislikedbyme=  async (req, res) => {
    try {
        const userId = req.params.id;

        // Find reactions where the user has disliked the quote
        const reactions = await Reaction.find({ userId, dislike: true });

        // Extract quote IDs from reactions
        const quoteIds = reactions.map(reaction => reaction.quoteId);

        // Fetch quotes based on extracted IDs
        const quotes = await Quote.find({ _id: { $in: quoteIds } });

        // Render quotes or send JSON response
        res.render('dislikedQuotes', { quotes }); // Change to your view/template
        // Or send JSON response
        // res.json(quotes);
    } catch (error) {
        console.error('Error fetching disliked quotes:', error);
        res.status(500).send('Server Error');
    }
};
const myquotess = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = await Users.findById(userId);

        if (!userData || !userData.isactive) {
            return res.status(404).send('User not found or inactive');
        }

        // Fetch added quotes
        const addedQuotes = await Quotes.find({ userId: userId });

        // Fetch liked quotes
        const likedReactions = await UserQuote.find({ userId, like: true });
        const likedQuoteIds = likedReactions.map(reaction => reaction.quoteId);
        const likedQuotes = await Quotes.find({ _id: { $in: likedQuoteIds } });
        const likedCount = likedQuotes.length;

        // Fetch disliked quotes
        const dislikedReactions = await UserQuote.find({ userId, dislike: true });
        const dislikedQuoteIds = dislikedReactions.map(reaction => reaction.quoteId);
        const dislikedQuotes = await Quotes.find({ _id: { $in: dislikedQuoteIds } });
        const dislikedCount = dislikedQuotes.length;

        // Render with all quotes data
        res.render('myquotes', { 
            userData,
            addedQuotes,
            likedQuotes,
            dislikedQuotes,
            likedCount,
            dislikedCount
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).send('Server error');
    }
};


module.exports = {
    like_up,
    like_down,
    dislike_up,
    dislike_down,
    getUsersWhoLikedQuote,
    getUsersWhoDislikedQuote,
    myquotess,
    likedbyme,dislikedbyme
};
