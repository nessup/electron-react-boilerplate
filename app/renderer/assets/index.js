import React from 'react';
import { routerMiddleware } from 'react-router-redux';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from '../containers/Root';
import { configureStore } from '../../shared/store/configureStore';
import './app.global.css';
import { createHashHistory } from 'history';

const history = createHashHistory();
const router = routerMiddleware(history);
const store = configureStore({ scope: 'renderer', routerMiddleware: router });

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('../containers/Root', () => {
    const NextRoot = require('../containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
