const noop = () => {};
noop.isRequired = noop;
const PropTypes = new Proxy(noop, {
  get: () => noop
});
export default PropTypes;
