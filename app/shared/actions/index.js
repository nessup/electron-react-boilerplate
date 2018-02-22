import { routerActions } from 'react-router-redux';
import * as counterActions from './counter';

const actions = {
  ...counterActions,
  ...routerActions // Note: Router middleware only exists on render threads
};

export default actions;
