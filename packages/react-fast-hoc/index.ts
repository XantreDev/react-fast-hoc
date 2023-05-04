import type { Fn, Pipe } from "hotscript";
import {
  ComponentPropsWithRef,
  ElementType,
  ForwardRefExoticComponent,
  FunctionComponent,
  MemoExoticComponent,
  type ComponentType,
  type ReactNode,
} from "react";
import type { F } from "ts-toolbelt";

import {
  HocTransformer,
  wrapComponentIntoHoc,
  wrapPropsTransformer,
} from "./internals";
import { FC_STORE, TRANSFORMED_TO_FUNCTIONAL_STORE_KEY } from "./toFunctional";

Object.defineProperty(
  typeof window !== "undefined" ? window : global,
  TRANSFORMED_TO_FUNCTIONAL_STORE_KEY,
  {
    value: FC_STORE,
  }
);

type Narrow<T extends any> = T extends Function ? T : F.Narrow<T>;

export type FastHocReturn<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends object = Record<
    string | number | symbol,
    unknown
  >
> = <
  TComponent extends ComponentType<any> = React.FC<any>,
  TComputedProps extends TComponentPropsExtends = TComponent extends ElementType<any>
    ? ComponentPropsWithRef<TComponent>
    : never
>(
  component: Narrow<TComponent>
) => TComponent extends ForwardRefExoticComponent<any>
  ? ForwardRefExoticComponent<Pipe<TComputedProps, TPipeTransform>> &
      Pick<TComponent, keyof TComponent>
  : TComponent extends MemoExoticComponent<any>
  ? MemoExoticComponent<
      FunctionComponent<Pipe<TComputedProps, TPipeTransform>>
    > &
      Pick<TComponent, keyof TComponent>
  : TComponent extends React.ComponentClass<any, any>
  ? ForwardRefExoticComponent<Pipe<TComputedProps, TPipeTransform>>
  : TComponent extends FunctionComponent<infer VProps>
  ? FunctionComponent<Pipe<VProps, TPipeTransform>>
  : never;

export type FastHocPropsTransformer = (
  props: Record<string | symbol | number, unknown>
) => Record<string | symbol | number, unknown>;

export type FastHocArg = {
  propsTransformer: null | FastHocPropsTransformer;
  resultTransformer: null | ((jsx: ReactNode) => ReactNode);
} & (
  | {
      namePrefix: string;
      nameRewrite: null;
    }
  | {
      namePrefix: null;
      nameRewrite: string;
    }
);

/**
 *
 * @param propsTransformer props transformer not typesafe for now
 * @param displayNamePrefix
 * @returns
 */
export const createHoc = <
  TPipeTransform extends Fn[],
  ComponentPropsExtends extends object = Record<
    string | number | symbol,
    unknown
  >
>(
  params: FastHocArg
) => {
  const proxyObject = new HocTransformer(
    // @ts-expect-error
    params.propsTransformer
      ? wrapPropsTransformer(params.propsTransformer)
      : null,
    params.resultTransformer,
    "namePrefix" in params ? params.namePrefix : null,
    "nameRewrite" in params ? params.nameRewrite : null
  );

  return ((component: ComponentType<unknown>) =>
    wrapComponentIntoHoc(component, proxyObject)) as FastHocReturn<
    TPipeTransform,
    ComponentPropsExtends
  >;
};

/**
 *
 * @param propsTransformer props transformer not typesafe for now
 * @param displayNamePrefix
 * @returns
 */
export const transformProps = <
  TPipeTransform extends Fn[] = [],
  ComponentPropsExtends extends object = any
>(
  propsTransformer: FastHocPropsTransformer,
  displayNamePrefix?: string
) =>
  createHoc<TPipeTransform, ComponentPropsExtends>({
    namePrefix: displayNamePrefix ?? "Transformed",
    propsTransformer,
    resultTransformer: null,
    nameRewrite: null,
  });
