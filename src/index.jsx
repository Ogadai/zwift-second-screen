import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers';
import App from './components/app.jsx';

let store = createStore(reducers,
  applyMiddleware(thunkMiddleware)
);

render(
  <AppContainer>
    <Provider store={store}>
      <App />
		</Provider>
  </AppContainer>,
  document.querySelector("#app")
);
