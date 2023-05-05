import { Objects } from "hotscript";
import React, { ComponentPropsWithRef } from "react";
import { createTransformProps } from "../src";
import { Pass, check, checks } from "./helpers";

declare function Component(props: { a: number }): null;

const addBebeHoc = createTransformProps<[Objects.Omit<"bebe">]>((props) => ({
  ...props,
  bebe: true as const,
}));

const cssInJsHoc = createTransformProps((props) => ({
  ...props,
  className: [props.className, "bebe"].join(" ").trim(),
}));

const ComponentWithBebe = addBebeHoc(Component);
const ComponentWithCssInJs = cssInJsHoc(Component);
const ComponentWithBebeAndCssInJs = cssInJsHoc(ComponentWithBebe);
declare class A extends React.Component<{ a: number }> {}

checks([
  check<ComponentPropsWithRef<typeof Component>, { a: number }, Pass>(),
  check<
    ComponentPropsWithRef<typeof ComponentWithBebe>,
    ComponentPropsWithRef<typeof Component>,
    Pass
  >(),
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
