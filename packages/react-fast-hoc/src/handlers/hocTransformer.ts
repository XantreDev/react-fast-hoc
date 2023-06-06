import { ReactNode } from "react";
import { getComponentName } from "../shared";

// Using classes to save memory
export class HocTransformer implements ProxyHandler<Function> {
  constructor(
    private transformer:
      | null
      | ((...args: readonly any[]) => ReadonlyArray<any> | any[]),
    private resultTransformer: null | ((result: ReactNode) => ReactNode),
    private namePrefix: string | null,
    private nameRewrite: string | null
  ) {}

  apply(target: Function, self: Function, args: any[]) {
    const result = target.apply(
      self,
      this.transformer ? this.transformer(args) : args
    );

    return this.resultTransformer ? this.resultTransformer(result) : result;
  }

  get(target: Function, p: string | symbol, receiver: any) {
    if (process.env.NODE_ENV === "production") {
      return Reflect.get(target, p, receiver);
    }
    if (p !== "displayName") {
      return Reflect.get(target, p, receiver);
    }
    return (
      this.nameRewrite ?? `${this.namePrefix ?? ""}${getComponentName(target)}`
    );
  }
}
