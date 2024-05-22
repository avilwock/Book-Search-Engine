import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        BookId
        authors
        title
        description
        image
        link
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const SEARCH_BOOKS = gql`
  query searchBooks($searchTerm: String!) {
    searchBooks(searchTerm: $searchTerm) {
      bookId
      authors
      title
      description
      image
      link
    }
  }
`;