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
        addUser: async (parent, {args}) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
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
                  { /* Query condition */ },
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
          try {
            // Find the user by ID and update their savedBooks array to remove the specified book
            const updatedUser = await User.findOneAndUpdate(
              { /* Add your query criteria here if necessary */ },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            );
            return updatedUser;
          } catch (error) {
            console.error(error);
            throw new Error('Error removing book');
          }
        },
        
        
        
      
    },
};

module.exports = resolvers;
