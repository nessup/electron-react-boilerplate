import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './renderer/containers/Root';
import { configureStore, history } from './shared/store/configureStore';
import './app.global.css';

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./renderer/containers/Root', () => {
    const NextRoot = require('./renderer/containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
