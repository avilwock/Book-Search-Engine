const { AuthenticationError } = require('@apollo/server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id }).select(
              "-__v -password"
            );
    
            return userData;
          }
    
          throw new AuthenticationError("Not logged in");
        },
      },
    
  Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw AuthenticationError;
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw AuthenticationError;
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
          const updatedUser = await User.findByIdAndUpdate(
            context.user._id,
            { $push: { savedBooks: bookData } },
            { new: true }
          );
  
          return updatedUser;
        }
  
        throw new AuthenticationError("You need to be logged in!");
      },
        // Call the saveBook function from your utils to save the book
      removeBook: async (parent, { bookId }, context) => {
        // Check if the user is authenticated
        if (context.user) {
            const updatedUser= await User.findOneAndUpdate(
                {_id: context.user._id},
                { $pull: { savedBooks: { bookId }}},
                {new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError ("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
