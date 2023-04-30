import type { ReactNode, Ref } from "react";

import { Get, isClassComponent, toFunctional } from "./toFunctional";

// Using classes to save memory
export class HocTransformer implements ProxyHandler<Function> {
  constructor(
    private transformer: null | ((...args: any[]) => any[]),
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
    if (p !== "displayName") {
      return Reflect.get(target, p, receiver);
    }
    return (
      this.nameRewrite ??
      `${this.namePrefix ?? ""}${
        (target as { displayName?: string })?.displayName ?? "UnknownComponent"
      }`
    );
  }
}

export const wrapPropsTransformer =
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

type RealComponentType<TProps extends object, IRef = unknown> =
  | {
      $$typeof: typeof REACT_FORWARD_REF_TYPE;
      render: (props: TProps, ref: null | Ref<IRef>) => ReactNode;
    }
  | {
      $$typeof: typeof REACT_MEMO_TYPE;
      compare: null | ((a: TProps, b: TProps) => boolean);
      type: (props: TProps) => ReactNode;
    }
  | React.Component<TProps>
  | React.FC<TProps>;

type ReactFunctionalComponentType<
  TProps extends object,
  IRef = unknown
> = Extract<
  RealComponentType<TProps, IRef>,
  { $$typeof: typeof REACT_FORWARD_REF_TYPE } | React.FC<TProps>
>;

const wrapFunctionalFROrDefault = <TProps extends object>(
  Component: ReactFunctionalComponentType<TProps>,
  handler: HocTransformer
) => {
  type ForwardRefComponent = Extract<
    ReactFunctionalComponentType<TProps>,
    { $$typeof: typeof REACT_FORWARD_REF_TYPE }
  >;
  type RegularFunctionComponent = Exclude<
    ReactFunctionalComponentType<TProps>,
    ForwardRefComponent
  >;
  if (Component["$$typeof"] === REACT_FORWARD_REF_TYPE) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: new Proxy((Component as ForwardRefComponent).render, handler),
    };
  }
  return new Proxy(Component as RegularFunctionComponent, handler);
};

// I don't know why but typescript is not helpful at all

// Component can be memo class component or wrapped in hoc functional component
export const wrapComponentIntoHoc = <TProps extends object>(
  Component: RealComponentType<TProps>,
  handler: HocTransformer
) => {
  // this case assumes that it's ClassComponent
  if (isClassComponent(Component)) {
    // @ts-expect-error
    return wrapFunctionalFROrDefault(toFunctional(Component), handler);
  }

  if (Component["$$typeof"] === REACT_MEMO_TYPE) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      // @ts-expect-error
      type: wrapFunctionalFROrDefault(toFunctional(Component.type), handler),
      // @ts-expect-error
      compare: Component.compare,
    };
  }

  if (Component["$$typeof"] === REACT_FORWARD_REF_TYPE) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      // render is always function
      // @ts-expect-error
      render: new Proxy(Component.render, handler),
    };
  }

  // @ts-expect-error
  return new Proxy(Component, handler);
};
