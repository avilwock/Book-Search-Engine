import './App.css';
import { Outlet } from 'react-router-dom';
//this calls to import the apollo client from the apollo client to work on the backend
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Navbar from './components/Navbar'

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

//this calls in the apollo provider with the client, styles the outlet data
function App() {
  return (
    
    <ApolloProvider client={client}>
      <Navbar />
      <div className="flex-column justify-center align-center min-100-vh bg-primary">
        <Outlet />
      </div>
    </ApolloProvider>
  );
}

export default App;
