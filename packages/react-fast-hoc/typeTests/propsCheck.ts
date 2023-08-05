import { Fn, Objects } from "hotscript";
import React, { ComponentPropsWithRef } from "react";
import { createTransformProps } from "../src";
import { Pass, check, checks } from "./helpers";

declare function Component(props: { a: number }): null;

const addBebeHoc = createTransformProps<[Objects.Omit<"bebe">]>((props) => ({
  ...props,
  bebe: true as const,
}));

const addBebeHoc2 = createTransformProps<{
  type: "props";
  fn: Objects.Omit<"bebe">;
}>((props) => ({
  ...props,
  bebe: true as const,
}));

const cssInJsHoc = createTransformProps((props) => ({
  ...props,
  className: [props.className, "bebe"].join(" ").trim(),
}));

const ComponentThatActuallyHasBebeProp = (props: { bebe: boolean }) => null;

const ComponentWithBebe = addBebeHoc(Component);
const ComponentWithBebe2 = addBebeHoc2(Component);
const ComponentWithBebeActual = addBebeHoc2(ComponentThatActuallyHasBebeProp);
const ComponentWithCssInJs = cssInJsHoc(Component);
const ComponentWithBebeAndCssInJs = cssInJsHoc(ComponentWithBebe);
declare class A extends React.Component<{ a: number }> {}

interface LolTransform extends Fn {
  return: this["arg0"] extends React.ComponentClass<infer TProps>
    ? React.FC<TProps>
    : never;
}
const transformComponentType = createTransformProps<{
  type: "component";
  fn: LolTransform;
}>((props) => props);

const ClassTransformed = transformComponentType(A);
const FunctionTransformed = transformComponentType(ComponentWithBebe);

checks([
  check<ComponentPropsWithRef<typeof Component>, { a: number }, Pass>(),
  check<
    ComponentPropsWithRef<typeof ComponentWithBebe>,
    ComponentPropsWithRef<typeof Component>,
    Pass
  >(),
  check<
    ComponentPropsWithRef<typeof ComponentWithBebe2>,
    ComponentPropsWithRef<typeof Component>,
    Pass
  >(),
  check<ComponentPropsWithRef<typeof ComponentWithBebeActual>, {}, Pass>(),
  check<typeof ClassTransformed, React.FC<{ a: number }>, Pass>(),
  check<typeof FunctionTransformed, never, Pass>(),
  check<
    ComponentPropsWithRef<typeof ComponentWithCssInJs>,
    ComponentPropsWithRef<typeof Component>,
    Pass
  >(),
  check<
    ComponentPropsWithRef<typeof ComponentWithBebeAndCssInJs>,
    ComponentPropsWithRef<typeof Component>,
    Pass
  >(),
]);
