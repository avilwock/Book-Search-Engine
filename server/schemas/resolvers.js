const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express') 

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id }).select(
              "-__v -password"
            );
          return userData;
          }
          // Handle authentication error within authMiddleware
         throw new AuthenticationError('Not logged in');
        },
    },
    
    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        console.log("Received arguments:", { username, email, password });
        try {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
          return { token, user };
        } catch (error) {
          console.error("Error creating user:", error);
          throw new Error('Error creating user');
        }
      },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
  
            if (!user) {
                throw new AuthenticationError('Not a valid user');
            }
  
            const correctPw = await user.isCorrectPassword(password);
  
            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password');
            }
  
            const token = signToken(user);
  
            return { token, user };
        },
        saveBook: async (_, { bookInput }, context) => {
          try {
            
              // Use the User model to find and update the user's saved books
              const updatedUser = await User.findOneAndUpdate(
                  // You can adjust the query as needed, for example, by using the user's ID if available
                  { _id: context.user._id },
                  { $addToSet: { savedBooks: bookInput } },
                  { new: true }
              );
              return updatedUser;
          } catch (error) {
              console.error(error);
              throw new Error('Error saving book');
          }
        },

        removeBook: async (_, { bookId }, context) => {
          if (!context.user) {
            throw new Error('You must be logged in to remove a book');
          }
    
          try {
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            );
    
            if (!updatedUser) {
              throw new Error('User not found');
            }
    
            return updatedUser;
          } catch (error) {
            console.error(error);
            throw new Error('Error removing book');
          }
        },
        
        
        
      
    },
};

module.exports = resolvers;
