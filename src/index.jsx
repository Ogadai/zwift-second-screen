import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';
import Root from './root.jsx';

const history = createHistory();

const store = createStore(
  reducers,
  applyMiddleware(
    thunkMiddleware,
    routerMiddleware(history)
  )
);

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.querySelector("#app")
);
document.ontouchmove = function(e){ e.preventDefault(); }
