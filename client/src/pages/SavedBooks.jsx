import {
  Container,
  Col,
  Row,
  Card,
  Button,
} from "react-bootstrap";

import Navbar from '../components/Navbar'

import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";

import Auth from "../utils/auth";

const SavedBooks = () => {
  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);
  const userData = data?.me || {};



  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    try {
      // Call the removeBook mutation without destructuring
      await removeBook({
        variables: { bookId },
      });
  
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Navbar fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Navbar>
      <Container>
        <h2 className="pt-5">Your Saved Books</h2>
        <Row xs={1} md={2} lg={3} className="g-4">
          {/* Map over your saved books data and render each book as a card */}
          {userData.savedBooks.map((book) => (
            <Col key={book.bookId}>
              <Card border="dark">
                {book.image && (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className="btn-block btn-danger" onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;