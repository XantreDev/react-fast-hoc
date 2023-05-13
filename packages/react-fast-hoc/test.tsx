const proxyHandler = {
  _propStore: new WeakMap<object, Record<string | number | symbol, unknown>>(),
  _getTargetData(target: object) {
    
  get: function (target, prop, receiver) {
    // console.log(target, receiver);
    const _targetData = this._propStore.get(target) ;
    if (!targetData) {
      this._propStore.set(target, {});
    }
    if (prop in targetData) {
      return targetData[prop];
    }

    return Reflect.get(target, prop, receiver);
  },
};
const proxy = new Proxy({}, proxyHandler);
console.log(proxy.a);
