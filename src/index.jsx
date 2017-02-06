import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';
import Root from './root';

let store = createStore(reducers,
  applyMiddleware(thunkMiddleware)
);

render(
  <AppContainer>
    <Root store={store} />
  </AppContainer>,
  document.querySelector("#app")
);
