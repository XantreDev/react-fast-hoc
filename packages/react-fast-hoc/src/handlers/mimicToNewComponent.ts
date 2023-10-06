export class MimicToNewComponentHandler implements ProxyHandler<object> {
  private _componentProps = new WeakMap<Function, Map<PropertyKey, unknown>>();

  get(target: Function, p: PropertyKey, receiver: any) {
    const overridenProps = this._componentProps.get(target);
    if (overridenProps && overridenProps.has(p)) {
      return overridenProps.get(p);
    }
    return Reflect.get(target, p, receiver);
  }
  set(target: Function, p: PropertyKey, value: any) {
    const overridenProps = this._componentProps.get(target);
    if (overridenProps) {
      overridenProps.set(p, value);
      return true;
    }

    this._componentProps.set(target, new Map([[p, value]]));
    return true;
  }
  defineProperty(
    target: Function,
    property: PropertyKey,
    attributes: PropertyDescriptor
  ) {
    if (!("value" in attributes)) {
      console.error("Only value property is supported");
      return false;
    }
    const overridenProps = this._componentProps.get(target);
    if (overridenProps) {
      overridenProps.set(property, attributes.value);
      return true;
    }

    this._componentProps.set(target, new Map([[property, attributes.value]]));
    return true;
  }
  deleteProperty(target: Function, p: PropertyKey) {
    // TODO: IMPROVE
    const overridenProps = this._componentProps.get(target);
    if (overridenProps) {
      overridenProps.delete(p);
      return true;
    }
    return Reflect.deleteProperty(target, p);
  }
  has(target: Function, prop: PropertyKey) {
    return (
      this._componentProps.get(target)?.has(prop) || Reflect.has(target, prop)
    );
  }
}
