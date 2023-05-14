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
  MimicToNewComponentHandler,
  wrapComponentIntoHoc,
  wrapPropsTransformer,
} from "./internals";

type PropsBase = Record<string | number | symbol, unknown>;

/**
 * Returns new comonent types after wrapping into hoc 
 */
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

/**
 * Returns a wrapped component with transformed props
 */
export type WrappedComponent<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends object,
  TComponent extends ComponentType<any>,
  TComputedProps extends TComponentPropsExtends = TComponent extends ElementType<any>
    ? ComponentPropsWithRef<TComponent>
    : never
> = ChangeComponentProps<TComponent, Pipe<TComputedProps, TPipeTransform>>;

/**
 * Higher-order component that wraps the input component
 * with the provided transformation pipeline and new component props.
 */
export type WrappedComponentCreator<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends object
> = <TComponent extends ComponentType<any> = React.FC<any>>(
  component: TComponent
) => WrappedComponent<
  TPipeTransform,
  TComponentPropsExtends,
  TComponent
>;

export type CreateHocReturn<
  TPipeTransform extends Fn[],
  TComponentPropsExtends extends PropsBase = PropsBase
> = WrappedComponentCreator<TPipeTransform, TComponentPropsExtends>;

export type PropsTransformer = (
  props: Record<string | symbol | number, unknown>
) => Record<string | symbol | number, unknown>;

export type CreateHocComponentOptions = (
  | {
      namePrefix: string;
    }
  | {
      nameRewrite: string;
    }
) & {
  /**
   * @description This feature has overhead in terms of using another proxy
   * to you can easilty mutate and define new properties, and not change inital component
   */
  mimicToNewComponent?: boolean;
};
/**
 * represents the argument object for the createHoc function. It contains
 * the props and result transformers, and options for name prefix or rewrite.
 */
export type CreateHocOptions = {
  /**
   * @description you can mutate props object
   */
  propsTransformer: null | PropsTransformer;
  resultTransformer: null | ((jsx: ReactNode) => ReactNode);
} & CreateHocComponentOptions;

/**
  * allows to wrap component into the proxy as functional component
  */
export const wrapIntoProxy =
  (proxy: ProxyHandler<Function>) =>
  <T extends React.ComponentType>(Component: T) =>
    wrapComponentIntoHoc(
      Component,
      proxy as HocTransformer,
      null
    ) as WrappedComponent<[], PropsBase, T>;

/**
 * @description *Transformations is not typesafe, you should [hotscript](https://github.com/gvergnaud/HOTScript) for type transformation*
 * @param propsTransformer You can use react hooks in the transformer function.
 * @param displayNamePrefix
 * @returns
 */
export const createHoc = <
  TPipeTransform extends Fn[],
  ComponentPropsExtends extends PropsBase = PropsBase
>(
  params: CreateHocOptions
) => {
  const { mimicToNewComponent = true } = params;
  const proxyObject = new HocTransformer(
    // @ts-expect-error
    params.propsTransformer
      ? wrapPropsTransformer(params.propsTransformer)
      : null,
    params.resultTransformer,
    "namePrefix" in params ? params.namePrefix : null,
    "nameRewrite" in params ? params.nameRewrite : null
  );
  const mimicToHandler = mimicToNewComponent
    ? new MimicToNewComponentHandler()
    : null;

  return ((component: ComponentType<unknown>) =>
    wrapComponentIntoHoc(
      component,
      proxyObject,
      mimicToHandler
    )) as CreateHocReturn<TPipeTransform, ComponentPropsExtends>;
};

const DEFAULT_TRANSFORM_OPTIONS = { namePrefix: "Transformed" } as const;
/**
 *
 * @description create a hoc that automagically applies proxy to component. *Transformations is not typesafe, you should [hotscript](https://github.com/gvergnaud/HOTScript) for type transformation*
 * @example
 * ```tsx
 * const withProps = createTransformProps<[], { newProp: string }>((props) => ({
 *  ...props,
 *  newProp: props?.newProp ?? "newProp",
 * }));
 * ```
 * @param propsTransformer You can use react hooks in the transformer function
 * @param options
 * @returns
 */
export const createTransformProps = <
  TPipeTransform extends Fn[] = [],
  ComponentPropsExtends extends PropsBase = PropsBase
>(
  propsTransformer: PropsTransformer,
  options?: CreateHocComponentOptions
) =>
  createHoc<TPipeTransform, ComponentPropsExtends>({
    propsTransformer,
    resultTransformer: null,
    ...(options ?? DEFAULT_TRANSFORM_OPTIONS),
  });

/**
 * type alias for the result of the transformProps function.
 */
export type TransformPropsReturn<
  TComponent extends React.ComponentType<any>,
  TNewProps extends PropsBase
> = WrappedComponent<
  [
    HotscriptObjects.OmitBy<Booleans.Not<never>>,
    HotscriptObjects.Assign<TNewProps>
  ],
  any,
  TComponent
>;

/**
 * transformProps is a function that takes a component, a props transformer function, and an
 * optional display name prefix, and returns a higher-order component that wraps the input
 * component with the specified props transformations.
 *
 * @param Component The input component to be wrapped with the props transformations.
 * @param transformer A function that takes the new props and returns the previous props for the input component.
 * @param options Optional string to prefix the display name of the resulting component.
 * @returns A higher-order component that wraps the input component with the specified props transformations.
 */
export const transformProps = <
  TComponent extends React.ComponentType<any>,
  TNewProps extends PropsBase = ComponentPropsWithRef<TComponent>,
  TPreviousProps extends ComponentPropsWithRef<TComponent> = ComponentPropsWithRef<TComponent>
>(
  Component: TComponent,
  transformer: (props: TNewProps) => TPreviousProps,
  options?: CreateHocComponentOptions
) =>
  createTransformProps(
    // @ts-expect-error
    transformer,
    options
  )(Component) as unknown as TransformPropsReturn<TComponent, TNewProps>;
