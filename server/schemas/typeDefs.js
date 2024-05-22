const { gql } = require('@apollo/server');

const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type Book {
    bookId: ID!
    authors: [String]!
    description: String!
    title: String!
    image: String
    link: String
    
  }

  type Auth {
    token: String!
    user: User!
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    saveBook(bookData: BookData!): Book
    removeBook(bookId: ID!): Book
  }

  input BookData {
    bookId: String!
    authors: [String]!
    title: String!
    description: String!
    image: String
    link: String
  }
`;

module.exports = typeDefs;
