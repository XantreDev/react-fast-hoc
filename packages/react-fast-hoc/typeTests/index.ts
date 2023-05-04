import { Objects } from "hotscript";
import React, { ComponentPropsWithRef } from "react";
import { Function } from "ts-toolbelt";
import { transformProps } from "..";
import { Pass, check, checks } from "./helpers";

declare function Component(props: { a: number }): null;

const addBebeHoc = transformProps<[Objects.Omit<"bebe">]>((props) => ({
  ...props,
  bebe: true as const,
}));

const cssInJsHoc = transformProps((props) => ({
  ...props,
  className: [props.className, "bebe"].join(" ").trim(),
}));

const ComponentWithBebe = addBebeHoc(Component);
const ComponentWithCssInJs = cssInJsHoc(Component);
const ComponentWithBebeAndCssInJs = cssInJsHoc(ComponentWithBebe);
declare class A extends React.Component<{ a: number }> {}

type prop = Function.Narrow<() => void>;
//   ^?

// type c = MergePrototypes<{
//   // ^?
//   new (a: number): number;
//   prototype: { b: number; prototype: { c: number } };
// }>;

checks(
  [
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
  ]
  // check<InferProps<typeof ComponentWithBebe>, { bebe: true; a: number }, Pass>()
);

// prototype merging
// checks([
//   check<
//     MergePrototypes<{ a: number; prototype: { a: string } }>,
//     { a: number },
//     Pass
//   >(),
//   check<
//     MergePrototypes<{ a: number; prototype: { a: string } }>,
//     { a: string },
//     Fail
//   >(),
//   check<MergePrototypes<{ a: number }>, { a: number }, Pass>(),
//   check<
//     MergePrototypes<{ a: number; prototype: { b: number } }>,
//     { a: number; b: number },
//     Pass
//   >(),
//   check<
//     MergePrototypes<{
//       a: number;
//       prototype: { b: number; prototype: { c: number } };
//     }>,
//     { a: number; b: number; c: number },
//     Pass
//   >(),
// ]);
