const Database = require('../models/allModels');
const bcrypt = require('bcrypt');
const path = require('path');
const { all } = require('../routes/userRoutes');
const User = Database.Users;
const quotesCollection = Database.Quotes;
const userReaction = Database.UserQuote;

//hash the password
const securepassword = async(password)=>{
    try{
      const passwordhash =  await bcrypt.hash(password,10);
        return passwordhash;
    }catch(error){
        console.log(error.messsage);
    }
}

//loads register page
const loadRegister = async(req,res)=>{
    try{
        res.sendFile(path.join(__dirname, '../views', 'signup.html'));
    }
    catch(error){
        console.log(error.messsage);
    }
}

//loads the login page 
const loginload = async(req,res)=>{
    try{
        res.sendFile(path.join(__dirname, '../views', 'login.html'));
    }catch(error){
        console.log(error.messsage);
    }
}

//loads index page 
const indexload = async(req,res)=>{
    try{
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
    }catch(error){
        console.log(error.messsage);
    }
}

//loads quotes page after login
const loadhome = async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.params.id});
        const Quotes = await quotesCollection.find({});
        if (userData.isactive === false) {
            return res.status(404).send('User not found or inactive');
        }
        res.render('home.ejs',{userData:userData, Quotes:Quotes});

    }catch(error){
        console.log(error.messsage );
    }
}

//insert new user
const insertUser = async(req,res)=>{
    try{
        const spasspassword = await securepassword(req.body.password);
        const body = req.body

        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            // If email already exists, render registration with an error message
          return  res.sendFile(path.join(__dirname, '../views', 'index.html'));
        }

       const user =  new User({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: spasspassword
        });
        const Quotes = await quotesCollection.find({});
        const userData = await user.save();
        if(userData){
            res.render('home.ejs',{userData:userData, Quotes:Quotes});
             req.session.user_id =userData._id;
             console.log(`session id : ${req.session.user_id}`);
        }else{
            res.sendFile(path.join(__dirname, '../views', 'signup.html'));
        }
    }catch(error){
        console.log(error.messsage);
    }
}

//login verification
const verifylogin = async(req,res)=>{
    const userData= await User.findOne({email:req.body.email});
    const Quotes = await quotesCollection.find({userId:userData._id});

    if (userData == null || userData.isactive===false) {
        return res.sendFile(path.join(__dirname, '../views', 'index.html'));
    }
    try {
      if(await bcrypt.compare(req.body.password, userData.password)) {
        req.session.user_id =userData._id;
        return res.render('home.ejs',{userData:userData ,Quotes:Quotes});
      } else {
        res.json({ success: false, error: 'Incorrect password' })
      }
    } catch {
      res.status(500).json({ success: false, error: "Internal server error." })
    }
  }


//logout
const userlogout = async(req,res)=>{
    try{
        req.session.destroy();
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
    }catch(error){
        console.log(error.messsage)
    }
}

//update the profile
const updateprofile = async(req,res)=>{
    try {
        const user = await User.findById(req.body.user_id);
        if (!user || !user.isactive) {
            return res.status(404).send('User not found or inactive');
        }
        // const spasspassword = await securepassword(req.body.password);
        const userData = await User.findByIdAndUpdate(req.body.user_id, {
            $set: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                // password:spasspassword
            }
        }, { new: true });  //ensures updated document is returned
        res.send("Update successful");
        console.log(userData)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

//getnames of users
const getnames = async (req, res) => {
    try {
        const users = await User.find({isactive:true}, 'first_name last_name');
        res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  //delete user (soft delete)
const deleteuser= async(req,res)=>{
    try{
        const userData = await User.findById({_id:req.params.user_id});
        if(!userData){
            throw new error('user not found');
        }
        userData.isactive = false;
        await userData.save();
        res.send("deleted successfully");
    }catch(error){
        console.log(error.message);
    }
}

//quotes of particular user


const getRandomQuote = async () => {
    const quotes = await quotesCollection.find({});
    return quotes[Math.floor(Math.random() * quotes.length)];
};

const quoteshome = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = await User.findById(userId);
        if (!userData || !userData.isactive) {
            return res.status(404).send('User not found or inactive');
        }

        let quotes = [];

        // Fetch liked quotes
        const likedReactions = await userReaction.find({ userId, like: true });
        const likedQuoteIds = likedReactions.map(reaction => reaction.quoteId);
        const likedQuotes = await quotesCollection.find({ _id: { $in: likedQuoteIds } });

        if (likedQuotes.length > 0) {
            quotes = likedQuotes;
        } else {
            // Fetch added quotes
            const addedQuotes = await quotesCollection.find({ userId });
            if (addedQuotes.length > 0) {
                quotes = addedQuotes;
            } else {
                // Fetch random quote if no liked or added quotes
                const randomQuote = await getRandomQuote();
                quotes = [randomQuote];
            }
        }

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        res.render('home.ejs', { Quotes: [randomQuote], userData });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).send('Server error');
    }
};


const getquotereact = async (req, res) => {
    const userId = req.params.id; // or however you get the logged-in user's ID
    try {
        const userData = await User.findById(userId);

        const quotes = await quotesCollection.find({});
        const userReactions = await userReaction.find({ userId: userId });
        
        res.render('userpage.ejs', { quotes, userData, userReactions });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};


module.exports = {
    loadRegister,
    loginload,
    indexload, 
    loadhome, 
    insertUser,
    verifylogin,
    userlogout,
    updateprofile,
    getnames,
    deleteuser,
    quoteshome,getquotereact
}