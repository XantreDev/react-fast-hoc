import React, { ComponentPropsWithRef, ForwardRefExoticComponent } from "react";
import { transformProps } from "../src";
import { Pass, check, checks } from "./helpers";

declare const ComponentForTransform1: (props: { a: number }) => null;
declare const ComponentForTransform2: ForwardRefExoticComponent<{ a: number }>;
declare const ComponentForTransform3: React.ComponentClass<{ a: number }>;

const TransformedComponent1 = transformProps(
  ComponentForTransform1,
  (props: { b: number }) => ({ a: props.b })
);
const TransformedComponent2 = transformProps(
  ComponentForTransform2,
  (props: { b: number }) => ({ a: props.b })
);
const TransformedComponent3 = transformProps(
  ComponentForTransform3,
  (props: { b: number }) => ({ a: props.b })
);

checks([
  check<
    ComponentPropsWithRef<typeof TransformedComponent1>,
    { b: number },
    Pass
  >(),
  check<
    ComponentPropsWithRef<typeof TransformedComponent2>,
    { b: number },
    Pass
  >(),
  check<
    ComponentPropsWithRef<typeof TransformedComponent3>,
    {
      b: number;
    },
    Pass
  >(),
]);
