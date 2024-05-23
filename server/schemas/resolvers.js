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
        // saveBook: async (parent, { bookInput }) => {
        //     console.log('Received book data:', bookInput);
        //     // Assuming User is your Mongoose model for users
        //     const updatedUser = await User.create({ savedBooks: bookInput });
        //     return updatedUser;
        // },
        saveBook: async (parent, book, context) => {
          // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
          if (context.user) {
            return User.findOneAndUpdate(
              { _id: context.user._id},
              {
                $addToSet: { savedBooks: book},
              },
              {
                new: true,
                runValidators: true 
              }
            );
          }
          // If user attempts to execute this mutation and isn't logged in, throw an error
          throw new AuthenticationError('You need to be logged in!');
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
            authMiddleware(context.req);
        },
    },
};

module.exports = resolvers;
