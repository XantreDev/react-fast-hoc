import type { ComponentPropsWithRef } from "react";
import { createTransformProps } from "./createTransformProps";
import type {
  CreateHocComponentOptions,
  PropsBase,
  TransformProps,
  TransformPropsReturn,
} from "./type";

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
export const transformProps: TransformProps = <
  TComponent extends React.ComponentType<any>,
  TNewProps extends PropsBase = ComponentPropsWithRef<TComponent>,
  TPreviousProps extends ComponentPropsWithRef<TComponent> = ComponentPropsWithRef<TComponent>
>(
  Component: TComponent,
  transformer: (props: TNewProps) => TPreviousProps,
  options?: CreateHocComponentOptions
): TransformPropsReturn<TComponent, TNewProps> =>
  createTransformProps(
    // @ts-expect-error
    transformer,
    options
  )(Component) as unknown as TransformPropsReturn<TComponent, TNewProps>;
