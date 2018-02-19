import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import App from './components/app.jsx';
import Login from './components/login.jsx';
import Host from './components/host.jsx';
import EditGhosts from './components/edit-ghosts.jsx';

const Root = ({ store, history }) => {
  return <Provider store={ store }>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/Login/:event?" component={Login} />
        <Route path="/Host" component={Host} />
        <Route path="/EditGhosts" component={EditGhosts} />
        <Route path="/:event?" component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default Root;
