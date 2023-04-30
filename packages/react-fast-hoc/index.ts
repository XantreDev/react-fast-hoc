import type { ComponentType, ReactNode } from "react";

import {
  FC_STORE,
  Get,
  TRANSFORMED_TO_FUNCTIONAL_STORE_KEY,
  isClassComponent,
  toFunctional,
} from "./toFunctional";

Object.defineProperty(
  typeof window !== "undefined" ? window : global,
  TRANSFORMED_TO_FUNCTIONAL_STORE_KEY,
  {
    value: FC_STORE,
  }
);

class HocTransformer implements ProxyHandler<Function> {
  constructor(
    private transformer: null | ((...args: any[]) => any[]),
    private resultTransformer: null | ((result: ReactNode) => ReactNode),
    private namePrefix: string
  ) {}

  apply(target: Function, self: Function, args: any[]) {
    const result = target.apply(
      self,
      this.transformer ? this.transformer(args) : args
    );

    return this.resultTransformer ? this.resultTransformer(result) : result;
  }

  get(target: Function, p: string | symbol, receiver: any) {
    if (p === "displayName") {
      return `${this.namePrefix}${
        (target as { displayName?: string })?.displayName ?? "UnknownComponent"
      }`;
    }
    return Reflect.get(target, p, receiver);
  }
}

const wrapPropsTransformer =
  <T extends object, R extends object>(transformer: (arg: T) => R) =>
  (args: [Omit<T, "ref">, Get<T, "ref">]) => {
    let [props, ref] = args;

    // React freezes props in development mode
    if (process.env.NODE_ENV !== "production") {
      props = Object.assign(Object.create(null), props);
    }
    const isRealRef =
      ref === null ||
      typeof ref === "function" ||
      (ref && typeof ref === "object" && "current" in ref);
    if (isRealRef) {
      (props as any).ref = ref;
    }

    type RealProps = T & { ref: Get<T, "ref"> };

    const resultProps = transformer(props as RealProps);
    const resultRef = isRealRef && resultProps["ref"];
    if (isRealRef) {
      delete (resultProps as R & { ref?: unknown }).ref;
    }

    return [resultProps, isRealRef && resultRef ? resultRef : ref] as const;
  };

const REACT_MEMO_TYPE = Symbol.for("react.memo");
const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");

// can be memo class component or wrapped in hoc functional component

const wrapFunctionalFROrDefault = <Props>(
  Component: ComponentType<Props>,
  handler: HocTransformer
) => {
  if (Component["$$typeof"] === REACT_FORWARD_REF_TYPE) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: new Proxy(Component.render, handler),
    };
  }
  return new Proxy(Component, handler);
};

const wrapComponentIntoHoc = <Props>(
  Component: ComponentType<Props>,
  handler: HocTransformer
) => {
  // this case assumes that it's ClassComponent
  if (isClassComponent(Component)) {
    return wrapFunctionalFROrDefault(toFunctional(Component), handler);
  }

  if (Component["$$typeof"] === REACT_MEMO_TYPE) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type: wrapFunctionalFROrDefault(toFunctional(Component.type), handler),
      compare: Component.compare,
    };
  }

  if (Component["$$typeof"] === REACT_FORWARD_REF_TYPE) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      // render is always function
      render: new Proxy(Component.render, handler),
    };
  }

  return new Proxy(Component, handler);
};

export const transformProps = <
  TResult extends object,
  TRequirement extends object = Record<never, never>
>(
  callback: (data: TRequirement) => TResult,
  displayNamePrefix?: string
) => {
  const proxyObject = new HocTransformer(
    wrapPropsTransformer(callback),
    null,
    displayNamePrefix ?? "Transformed"
  );

  return <Props>(component: ComponentType<Props>) =>
    wrapComponentIntoHoc(component, proxyObject);
};
