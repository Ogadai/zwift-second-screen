import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';

import App from './components/app.jsx';
import Login from './components/login.jsx';
import Host from './components/host.jsx';
import EditGhosts from './components/edit-ghosts.jsx';

const Root = ({ store, history }) => {
  return <Provider store={ store }>
    <Router history={history}>
      <Route path="/Login(/:filter)" component={Login} />
      <Route path="/Host(/:filter)" component={Host} />
      <Route path="/Ghosts(/:filter)" component={EditGhosts} />
      <Route path="/(:filter)" component={App} />
    </Router>
  </Provider>
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default Root;
