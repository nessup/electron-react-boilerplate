import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware, routerActions } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import { forwardToMain, forwardToRenderer, triggerAlias, replayActionMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import rootReducer from '../reducers';
import * as counterActions from '../actions/counter';
import type { counterStateType } from '../reducers/counter';

const configureStore = ({ initialState, scope = 'main', routerMiddleware }: { initialState?: counterStateType }) => {
  // The render thread gets its initial state via electron-redux
  if (scope === 'renderer') {
    initialState = getInitialStateRenderer();
  }

  // Redux Configuration
  let middleware = [];
  let enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  if (process.env.NODE_ENV !== 'production') {
    // Logging Middleware
    const logger = createLogger({
      // Prevent main thread from logging into DevTools
      level: scope === 'main' ? undefined : 'log',
      collapsed: true
    });

    // Skip redux logs in console during the tests
    if (process.env.NODE_ENV !== 'test') {
      middleware.push(logger);
    }
  }

  // Establish communication between main and render threads
  if (scope === 'main') {
    middleware = [
      triggerAlias,
      ...middleware,
      forwardToRenderer
    ];
  }
  else if (scope === 'renderer') {
    middleware = [
      forwardToMain,
      routerMiddleware, // Router is created by the render thread
      ...middleware
    ];
  }

  // Redux DevTools Configuration
  const actionCreators = {
    ...counterActions,
    ...routerActions,
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  let composeEnhancers = compose;
  if (scope === 'renderer'
      && process.env.NODE_ENV !== 'production'
      && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
      actionCreators,
    });
  }
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers'))); // eslint-disable-line global-require
  }

  if (scope === 'main') {
    replayActionMain(store);
  }
  else if(scope === 'renderer') {
    replayActionRenderer(store);
  }

  return store;
};

export default { configureStore };
