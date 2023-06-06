import type { Booleans, Fn, Objects, Pipe } from "hotscript";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ElementType,
  ForwardRefExoticComponent,
  FunctionComponent,
  MemoExoticComponent,
  ReactNode,
} from "react";

/**
 * type alias for the result of the transformProps function.
 */
export type TransformPropsReturn<
  TComponent extends React.ComponentType<any>,
  TNewProps extends PropsBase
> = WrappedComponent<
  [Objects.OmitBy<Booleans.Not<never>>, Objects.Assign<TNewProps>],
  any,
  TComponent
>;
export type TransformProps = <
  TComponent extends React.ComponentType<any>,
  TNewProps extends PropsBase = ComponentPropsWithRef<TComponent>,
  TPreviousProps extends ComponentPropsWithRef<TComponent> = ComponentPropsWithRef<TComponent>
>(
  Component: TComponent,
  transformer: (props: TNewProps) => TPreviousProps,
  options?: CreateHocComponentOptions
) => TransformPropsReturn<TComponent, TNewProps>;

export type PropsBase = Record<string | number | symbol, unknown>;

/**
 * Returns new comonent types after wrapping into hoc
 */
export type ChangeComponentProps<
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
) => WrappedComponent<TPipeTransform, TComponentPropsExtends, TComponent>;

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
