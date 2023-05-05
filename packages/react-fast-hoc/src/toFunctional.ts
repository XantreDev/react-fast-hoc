import type { ComponentType } from "react";
import { Component as ReactComponent, createElement, forwardRef } from "react";

export const FC_STORE = new WeakMap<object, Function>();

export type Get<TObject, IName> = IName extends keyof TObject
  ? TObject[IName]
  : unknown;

const _toFunctional = <Props>(Component: ComponentType<Props>) => {
  if (!isClassComponent(Component)) {
    FC_STORE.set(Component, Component);
    return Component;
  }

  const name = `${
    Component.displayName ?? Component.name ?? "Unknown"
  }FunctionalWrapper`;
  const FunctionalWrapper = forwardRef<Get<Props, "ref">, Props>((props, ref) =>
    createElement(
      Component as any,
      {
        ...props,
        ref,
      },
      (props as { children: null | JSX.Element })?.children
    )
  );

  FunctionalWrapper.displayName = name;

  FC_STORE.set(Component, FunctionalWrapper);
  FC_STORE.set(FunctionalWrapper, FunctionalWrapper);
  return FunctionalWrapper;
};

export const toFunctional = <Props>(Component: ComponentType<Props>) =>
  (FC_STORE.get(Component) as ReturnType<typeof _toFunctional<Props>>) ||
  _toFunctional(Component);

const isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf) as (
  parent: unknown,
  child: unknown
) => boolean;

export const isClassComponent = <T>(
  Component: T
): Component is Extract<T, React.ComponentClass<any, any>> =>
  isPrototypeOf(ReactComponent, Component);
