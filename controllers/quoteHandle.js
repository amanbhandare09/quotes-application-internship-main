const database =require('../models/allModels');
const bcrypt = require('bcrypt')
const path = require('path')
const User = database.Users;
const quotesCollection = database.Quotes;
const userQuote = database.UserQuote;
 
const showQuotes = async (req, res) => {
    try {
      const quotes = await quotesCollection.find({});
      res.json(quotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const showAuthors = async (req, res) => {
    try {
        const authors = await quotesCollection.aggregate([
            { $group: { _id: "$author" } }
        ]).exec();
        if (!authors.length) {
            return res.status(404).json({ message: 'No authors found' });
        }
        const sortedAuthors = authors.map(author => author._id).sort();

        res.json(sortedAuthors);
    } catch (error) {
        console.error('Error retrieving authors:', error);
        res.status(500).json({ message: 'Error retrieving authors' });
    }
};


const addQuote = async(req, res) => {
  try {
      const body = req.body
      if(!body.quote || !body.author){
          return res.status(400).json({ message: 'Missing required fields: quote and author are both required.' });
      }
      userid = req.body.user_id;
      const newquote =  new quotesCollection({
          quote: body.quote,
          userId: userid,
          author: body.author,
          tags: body.tags,
      });
      const result = await newquote.save();
      console.log(`Quote added with ID: ${result._id}`);
    //   res.send('Quote added successfully!' );
      }catch (error) {
          console.error('Error adding quote:', error);
          res.status(500).json({ message: 'Error adding quote' }); // More specific message if possible
      }
  } //working 

  const updateQuote = async (req, res) => {
    try {
        const quote_id = req.params.id; // Extract quote_id from URL parameter
        const { quote, author, tags } = req.body;
        // Validate the input
        if (!quote_id || !quote || !author || !tags) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Find the quote by ID and update it
        const updatedQuote = await quotesCollection.findByIdAndUpdate(
            quote_id,
            {
                $set: {
                    quote: quote,
                    author: author,
                    tags: tags // Assuming tags is a string
                }
            },
            { new: true } // { new: true } ensures the updated document is returned
        );
        // Check if the update was successful
        if (!updatedQuote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        // Respond with success message
        res.json({ message: 'Update successful', updatedQuote });
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).send('Server Error');
    }
};

 //working on postman
  
const deleteQuote = async (req, res) => {
    try {
        const quote_id = req.params.id; // Extract quote_id from URL parameter
        if (!quote_id) {
            return res.status(400).json({ message: 'Quote ID is required' });
        }
        const deletedQuote = await quotesCollection.findByIdAndDelete(quote_id);
        if (!deletedQuote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json({ message: 'Delete successful', deletedQuote });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).send('Server Error');
    }
}; // working on postman

const searchbyTag = async (req, res) => {
  try {
      const tag = req.query.tags; // Get the tag from query parameters

      if (!tag) {
          return res.status(400).json({ message: 'Tag parameter is required' });
      }

      // Find quotes that contain the specified tag
      const quotes = await quotesCollection.find({ tags: tag }, { userId: 0 }); // Exclude userId from the results

      if (!quotes.length) {
          return res.status(404).json({ message: 'No quotes found for the specified tag' });
      }

      // Generate HTML for quotes
      const quotesHtml = quotes.map(quote => {
          const tags = Array.isArray(quote.tags) ? quote.tags.join(', ') : quote.tags; // Ensure tags is a string
          return `
              <div class="quote">
                  <br>
                  <p>Quote: "${quote.quote}"</p>
                  <p>Author: ${quote.author}</p>
                  <p>Tags: ${tags}</p>
                  <br>
              </div>
          `;
      }).join('');

      res.send(quotesHtml);
  } catch (error) {
      console.error('Error retrieving quotes:', error);
      res.status(500).json({ message: 'Error retrieving quotes' });
  }
}; //working

const searchByAuthor = async (req, res) => {
  try {
      const author = req.query.author; // Get the author from query parameters

      if (!author) {
          return res.status(400).json({ message: 'Author parameter is required' });
      }

      // Find quotes that contain the specified author
      const quotes = await quotesCollection.find({ author: new RegExp(author, 'i') }, { userId: 0 }); // Exclude userId from the results

      if (!quotes.length) {
          return res.status(404).json({ message: 'No quotes found for the specified author' });
      }

      // Generate HTML for quotes
      const quotesHtml = quotes.map(quote => {
          const tags = Array.isArray(quote.tags) ? quote.tags.join(', ') : quote.tags; // Ensure tags is a string
          return `
              <div class="quote">
                  <br>
                  <p>Quote: "${quote.quote}"</p>
                  <p>Author: ${quote.author}</p>
                  <p>Tags: ${tags}</p>
                  <br>
              </div>
          `;
      }).join('');

      res.send(quotesHtml);
  } catch (error) {
      console.error('Error retrieving quotes:', error);
      res.status(500).json({ message: 'Error retrieving quotes' });
  }
}; //working

const authorSearch = async (req, res) => {
    try {
        const author = req.query.author; // Get the author from query parameters
  
        if (!author) {
            return res.status(400).json({ message: 'Author parameter is required' });
        }
  
        // Find unique authors that match the specified author name
        const authors = await quotesCollection.distinct('author', { author: new RegExp(author, 'i') });
  
        if (!authors.length) {
            return res.status(404).json({ message: 'No authors found for the specified search term' });
        }
  
        // Generate HTML for authors
        const authorsHtml = authors.map(author => `
            <div class="author">
                <p>Result: ${author}</p>
            </div>
        `).join('');
  
        res.send(authorsHtml);
    } catch (error) {
        console.error('Error retrieving authors:', error);
        res.status(500).json({ message: 'Error retrieving authors' });
    }
  };
  
  
  

const loadauthor = async(req,res)=>{
    try{
        const userData = await User.findById(req.params.id);
        res.render('author',{userData});
    }catch(error){
        console.log(error.message);
    }
}


  module.exports = {
    addQuote,
    updateQuote,
    showQuotes,
    deleteQuote,
    searchbyTag,
    searchByAuthor,
    showAuthors,
    loadauthor,
    authorSearch
}