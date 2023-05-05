import type { Booleans, Fn, Pipe } from "hotscript";
import {
  ComponentPropsWithRef,
  ElementType,
  ForwardRefExoticComponent,
  FunctionComponent,
  MemoExoticComponent,
  type ComponentType,
  type ReactNode,
} from "react";

import type { HotscriptObjects } from "./hotscriptsTypes";
import {
  HocTransformer,
  wrapComponentIntoHoc,
  wrapPropsTransformer,
} from "./internals";

type PropsBase = Record<string | number | symbol, unknown>;

type ChangeComponentProps<
  TComponent extends ComponentType<any>,
  TNewProps
> = TComponent extends MemoExoticComponent<infer TNested>
  ? MemoExoticComponent<
      TNested extends React.ComponentClass<any, any>
        ? ForwardRefExoticComponent<TNewProps>
        : FunctionComponent<TNewProps>
    >
  : TComponent extends ForwardRefExoticComponent<any>
  ? ForwardRefExoticComponent<TNewProps>
  : TComponent extends React.ComponentClass<any, any>
  ? ForwardRefExoticComponent<TNewProps>
  : TComponent extends FunctionComponent<any>
  ? FunctionComponent<TNewProps>
  : never;

export type FastHocComponentWrapperReturn<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends object,
  TComponent extends ComponentType<any>,
  TComputedProps extends TComponentPropsExtends = TComponent extends ElementType<any>
    ? ComponentPropsWithRef<TComponent>
    : never
> = ChangeComponentProps<TComponent, Pipe<TComputedProps, TPipeTransform>>;

export type FastHocComponentWrapper<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends object
> = <TComponent extends ComponentType<any> = React.FC<any>>(
  component: TComponent
) => FastHocComponentWrapperReturn<
  TPipeTransform,
  TComponentPropsExtends,
  TComponent
>;

export type FastHocReturn<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends PropsBase = PropsBase
> = FastHocComponentWrapper<TPipeTransform, TComponentPropsExtends>;

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
  ComponentPropsExtends extends PropsBase = PropsBase
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
export const createTransformProps = <
  TPipeTransform extends Fn[] = [],
  ComponentPropsExtends extends PropsBase = PropsBase
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

// type ObjectsAssign<T extends object> = Objects.Pick<T>;
export type TransformPropsReturn<
  T extends React.ComponentType<any>,
  TNewProps extends PropsBase
> = FastHocComponentWrapperReturn<
  [
    HotscriptObjects.OmitBy<Booleans.Not<never>>,
    HotscriptObjects.Assign<TNewProps>
  ],
  any,
  T
>;

export const transformProps = <
  T extends React.ComponentType<any>,
  TNewProps extends PropsBase,
  TPreviousProps extends ComponentPropsWithRef<T> = ComponentPropsWithRef<T>
>(
  Component: T,
  transformer: (props: TNewProps) => TPreviousProps,
  displayNamePrefix?: string
) =>
  createTransformProps(
    // @ts-expect-error
    transformer,
    displayNamePrefix
  )(Component) as unknown as TransformPropsReturn<T, TNewProps>;
