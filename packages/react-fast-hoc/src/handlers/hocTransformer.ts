import { ReactNode } from "react";
import { getComponentName } from "../shared";
import { DisplayNameTransform } from "../type";

const calculateDisplayNameTransform = (
  prevName: string,
  displayNameTransform: DisplayNameTransform
) => {
  if (displayNameTransform.type === "prefix") {
    return displayNameTransform.value + prevName;
  }
  if (displayNameTransform.type === "rewrite") {
    return displayNameTransform.value;
  }
  if (displayNameTransform.type === "rewrite-dynamic") {
    return displayNameTransform.value(prevName);
  }
  return prevName;
};

// Using classes to save memory
export class HocTransformer implements ProxyHandler<Function> {
  _displayNameField = Symbol("displayName");
  constructor(
    private transformer:
      | null
      | ((...args: readonly any[]) => ReadonlyArray<any> | any[]),
    private resultTransformer: null | ((result: ReactNode) => ReactNode),
    private displayNameTransform: null | DisplayNameTransform
  ) {}

  apply(target: Function, self: Function, args: any[]) {
    const result = target.apply(
      self,
      this.transformer ? this.transformer(args) : args
    );

    return this.resultTransformer ? this.resultTransformer(result) : result;
  }

  get(target: Function, p: string | symbol, receiver: any) {
    if (
      process.env.NODE_ENV === "production" ||
      p !== "displayName" ||
      !this.displayNameTransform
    ) {
      return Reflect.get(target, p, receiver);
    }
    if (!(this._displayNameField in target)) {
      // @ts-expect-error
      target[this._displayNameField] = calculateDisplayNameTransform(
        getComponentName(target),
        this.displayNameTransform
      );
    }

    // @ts-expect-error
    return target[this._displayNameField];
  }
  set(target: Function, p: string | symbol, value: any) {
    if (process.env.NODE_ENV !== "production" && p === "displayName") {
      // @ts-expect-error
      target[this._displayNameField] = value;
      return true;
    }
    return Reflect.set(target, p, value);
  }
}
