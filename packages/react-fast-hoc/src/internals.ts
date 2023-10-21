import { isValidElement, type ReactNode, type Ref } from "react";
import type { HocTransformer, MimicToNewComponentHandler } from "./handlers";
import { isClassComponent, toFunctional, type Get } from "./toFunctional";

export const isRef = <T = unknown>(maybeRef: unknown): maybeRef is Ref<T> =>
  maybeRef === null ||
  typeof maybeRef === "function" ||
  (!!maybeRef && typeof maybeRef === "object" && "current" in maybeRef);

export const wrapPropsTransformer =
  <T extends object, R extends object>(transformer: (arg: T) => R) =>
  (args: [Omit<T, "ref">, Get<T, "ref">]) => {
    let [_props, ref] = args;
    // props are immutable, because of should stable while rerenders,
    // so wrapping it into props transform hoc has overhead
    const props = Object.assign(Object.create(null), _props);

    const hasRef = isRef(ref);
    if (hasRef) {
      (props as any).ref = ref;
    }

    type RealProps = T & { ref: Get<T, "ref"> };

    const resultProps = transformer(props as RealProps);
    const resultRef = "ref" in resultProps && resultProps["ref"];
    if ("ref" in resultProps) {
      delete (resultProps as R & { ref?: unknown }).ref;
    }

    return [resultProps, hasRef && isRef(resultRef) ? resultRef : ref] as const;
  };

const REACT_MEMO_TYPE = Symbol.for("react.memo");
const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
const REACT_LAZY_TYPE = Symbol.for("react.lazy");

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
  | {
      $$typeof: typeof REACT_LAZY_TYPE;
      _payload: {
        _status: -1 | 0 | 1 | 2;
        _result: unknown;
      };
      // returns component or throws promise
      _init: (arg: unknown) => React.ComponentType<unknown>;
    }
  | React.ComponentClass<TProps>
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
  if (
    "$$typeof" in Component &&
    Component["$$typeof"] === REACT_FORWARD_REF_TYPE
  ) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: new Proxy((Component as ForwardRefComponent).render, handler),
    };
  }
  return new Proxy(Component as RegularFunctionComponent, handler);
};

// I don't know why but typescript is not helpful at all

// Component can be memo class component or wrapped in hoc functional component
/**
 *
 * @internal
 * @param Component
 * @param handler
 * @param mimicToNewComponentHandler
 * @returns
 */
export const wrapComponentIntoHoc = <TProps extends object>(
  Component: RealComponentType<TProps>,
  handler: HocTransformer,
  mimicToNewComponentHandler: null | MimicToNewComponentHandler
): unknown => {
  if (process.env.NODE_ENV === "development" && !isValidElement(Component)) {
    console.warn("react-fast-hoc: passed incorrect component for transform");
    return Component;
  }
  // this case assumes that it's ClassComponent
  if (isClassComponent(Component)) {
    return wrapFunctionalFROrDefault(
      toFunctional(Component) as React.FC<TProps>,
      handler
    );
  }

  if ("$$typeof" in Component && Component["$$typeof"] === REACT_MEMO_TYPE) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      // @ts-expect-error
      type: wrapFunctionalFROrDefault(toFunctional(Component.type), handler),
      compare: Component.compare,
    };
  }

  if (
    "$$typeof" in Component &&
    Component["$$typeof"] === REACT_FORWARD_REF_TYPE
  ) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      // render is always function
      render: new Proxy(Component.render, handler),
    };
  }
  if ("$$typeof" in Component && Component["$$typeof"] === REACT_LAZY_TYPE) {
    let result: RealComponentType<any>;
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: Component._payload,
      _init: (arg: unknown) => {
        const initRes = Component._init(arg);
        if (!result) {
          result = wrapComponentIntoHoc(
            initRes,
            handler,
            mimicToNewComponentHandler
          ) as RealComponentType<any>;
        }
        return result;
      },
    } as RealComponentType<any>;
  }

  const proxied = new Proxy(Component, handler);

  return mimicToNewComponentHandler
    ? (new Proxy(
        proxied,
        mimicToNewComponentHandler
      ) as RealComponentType<TProps>)
    : proxied;
};
