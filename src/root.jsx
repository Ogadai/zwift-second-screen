import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';

import App from './components/app.jsx';
import Login from './components/login.jsx';

const Root = ({ store, history }) => {
  return <Provider store={ store }>
    <Router history={history}>
      <Route path="/Login(/:filter)" component={Login} />
      <Route path="/(:filter)" component={App} />
    </Router>
  </Provider>
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default Root;
