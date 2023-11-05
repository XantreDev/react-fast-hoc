import React, { type Ref } from "react";
import type { HocTransformer, MimicToNewComponentHandler } from "./handlers";
import { isClassComponent, toFunctional, type Get } from "./toFunctional";
import {
  HocHook,
  PropsAreEqual,
  RealComponentType,
  RealForwardRefComponentType,
  RealLazyComponentType,
} from "./type";
import {
  REACT_FORWARD_REF_TYPE,
  REACT_LAZY_TYPE,
  REACT_MEMO_TYPE,
} from "./shared";

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

type ReactFunctionalComponentType<
  TProps extends object,
  IRef = unknown
> = Extract<
  RealComponentType<TProps, IRef>,
  { $$typeof: typeof REACT_FORWARD_REF_TYPE } | React.FC<TProps>
>;

type RegularFunctionComponent<TProps extends object, TRef = unknown> = Exclude<
  ReactFunctionalComponentType<TProps, TRef>,
  RealForwardRefComponentType<TProps, TRef>
>;
const wrapFCWithForwardRefOrPlain = <TProps extends object>(
  Component: ReactFunctionalComponentType<TProps>,
  handler: HocTransformer
):
  | RealForwardRefComponentType<TProps>
  | ReactFunctionalComponentType<TProps> => {
  if (
    "$$typeof" in Component &&
    Component["$$typeof"] === REACT_FORWARD_REF_TYPE
  ) {
    return {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: new Proxy(
        (Component as RealForwardRefComponentType<TProps>).render,
        handler
      ),
    } as RealForwardRefComponentType<TProps>;
  }
  return new Proxy(
    Component as Function,
    handler
  ) as RegularFunctionComponent<TProps>;
};

// I don't know why but typescript is not helpful at all
const wrapLazyInit = <TProps extends object>(
  lazy: RealLazyComponentType<TProps>,
  handler: HocTransformer,
  mimicToNewComponentHandler: null | MimicToNewComponentHandler,
  hooks: null | Set<HocHook>
) => {
  let result: RealComponentType<TProps>;

  return (arg: unknown) => {
    const initRes = lazy._init(arg);
    if (!result) {
      result = wrapComponentIntoHoc(
        initRes,
        handler,
        mimicToNewComponentHandler,
        hooks
      ) as RealComponentType<any>;
    }
    return result;
  };
};

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
  mimicToNewComponentHandler: null | MimicToNewComponentHandler,
  hooks: null | Set<HocHook>
): unknown => {
  // this case assumes that it's ClassComponent
  if (isClassComponent(Component)) {
    return wrapFCWithForwardRefOrPlain(
      toFunctional(Component) as React.FC<TProps>,
      handler
    );
  }

  if ("$$typeof" in Component && Component["$$typeof"] === REACT_MEMO_TYPE) {
    let compare = Component.compare as PropsAreEqual<object> | null;
    if (hooks) {
      for (const hook of hooks) {
        if (hook.type === "first-memo") {
          compare = hook.value(compare);

          hooks.delete(hook);
        }
      }
    }
    return {
      $$typeof: REACT_MEMO_TYPE,
      type: wrapComponentIntoHoc(Component.type, handler, null, hooks),
      compare,
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
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: Component._payload,
      _init: wrapLazyInit(
        Component,
        handler,
        mimicToNewComponentHandler,
        hooks
      ),
    } as RealComponentType<any>;
  }

  if (typeof Component === "function") {
    const proxied = new Proxy(Component, handler);

    return mimicToNewComponentHandler
      ? (new Proxy(
          proxied,
          mimicToNewComponentHandler
        ) as RealComponentType<TProps>)
      : proxied;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "react-fast-hoc: unknown component type, please submit issue",
      Component
    );
  }
  return Component;
};
