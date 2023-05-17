import React, { ComponentPropsWithRef, ForwardRefExoticComponent } from "react";
import { transformProps } from "../src";
import { Pass, check, checks } from "./helpers";

declare const ComponentForTransform1: (props: { a: number }) => null;
declare const ComponentForTransform2: ForwardRefExoticComponent<{ a: number }>;
declare const ComponentForTransform3: React.ComponentClass<{ a: number }>;
declare const ComponentForTransform4: React.FC<{ a?: number; b: number }>;

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
declare const identity: <T>(args: T) => T;
const TransformedComponent4 = transformProps(ComponentForTransform4, identity);

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
  check<
    ComponentPropsWithRef<typeof TransformedComponent4>,
    ComponentPropsWithRef<typeof ComponentForTransform4>,
    Pass
  >(),
  check<
    ComponentPropsWithRef<typeof TransformedComponent4>,
    { a?: number; b: number },
    Pass
  >(),
]);
