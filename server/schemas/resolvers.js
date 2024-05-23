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
          // Ensure that the context has a user property (from authentication)
          if (context.user) {
            try {
              // Use the User model to find and update the user's saved books
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookInput } },
                { new: true }
              );
              return updatedUser;
            } catch (error) {
              console.error(error);
              throw new Error('Error saving book');
            }
          } else {
            throw new Error('Authentication required');
          }
        },
        removeBook: async (parent, { bookId }, context) => {
            // Check if the user is authenticated
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            
            // Handle authentication error within authMiddleware
           throw new AuthenticationError('Please log in')
        },
    },
};

module.exports = resolvers;
