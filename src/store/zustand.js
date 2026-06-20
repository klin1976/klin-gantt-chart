import { useSyncExternalStore } from 'react';

export const create = (createState) => {
  let state;
  const listeners = new Set();
  
  const setState = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      state = (replace ?? typeof nextState !== 'object') ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, state));
    }
  };
  
  const getState = () => state;
  
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  const api = { setState, getState, subscribe };
  state = createState(setState, getState, api);
  
  const useBoundStore = (selector = (s) => s) => {
    return useSyncExternalStore(subscribe, () => selector(getState()));
  };
  
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
