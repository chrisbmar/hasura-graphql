import React from "react";
import PropTypes from "prop-types";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

import Header from "./Header";
import TodoPrivateWrapper from "./Todo/TodoPrivateWrapper";
import TodoPublicWrapper from "./Todo/TodoPublicWrapper";
import OnlineUsersWrapper from "./OnlineUsers/OnlineUsersWrapper";

import { useAuth0 } from "./Auth/react-auth0-spa";

const App = ({ idToken }) => {
  const { loading, logout } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }

  const createApolloClient = authToken => {
    return new ApolloClient({
      link: new WebSocketLink({
        uri: "wss://hasura.io/learn/graphql",
        options: {
          reconnect: true,
          connectionParams: {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        }
      }),
      cache: new InMemoryCache()
    });
  };

  const client = createApolloClient(idToken);

  return (
    <ApolloProvider client={client}>
      <div>
        <Header logoutHandler={logout} />
        <div className="row container-fluid p-left-right-0 m-left-right-0">
          <div className="row col-md-9 p-left-right-0 m-left-right-0">
            <div className="col-md-6 sliderMenu p-30">
              <TodoPrivateWrapper />
            </div>
            <div className="col-md-6 sliderMenu p-30 bg-gray border-right">
              <TodoPublicWrapper />
            </div>
          </div>
          <div className="col-md-3 p-left-right-0">
            <div className="col-md-12 sliderMenu p-30 bg-gray">
              <OnlineUsersWrapper />
            </div>
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

App.propTypes = {
  idToken: PropTypes.string.isRequired
};

export default App;
