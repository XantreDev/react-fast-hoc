import React, { ForwardRefExoticComponent, MemoExoticComponent } from "react";
import { FastHocComponentWrapperReturn } from "../src";
import { Pass, check, checks } from "./helpers";

type Functional = React.FC<{ a: number }>;
type FunctionalWithRef = React.ForwardRefExoticComponent<{ a: number }>;
type Class = React.ComponentClass<{ a: number }>;
type MemoFunctional = React.MemoExoticComponent<React.FC<{ a: number }>>;
type MemoClass = React.MemoExoticComponent<React.ComponentClass<{ a: number }>>;

checks([
  check<FastHocComponentWrapperReturn<[], any, Functional>, Functional, Pass>(),
  check<
    FastHocComponentWrapperReturn<[], any, FunctionalWithRef>,
    FunctionalWithRef,
    Pass
  >(),
  check<
    FastHocComponentWrapperReturn<[], any, Class>,
    React.ForwardRefExoticComponent<React.ComponentPropsWithRef<Class>>,
    Pass
  >(),
  check<
    FastHocComponentWrapperReturn<[], any, MemoFunctional>,
    MemoFunctional,
    Pass
  >(),
  check<
    FastHocComponentWrapperReturn<[], any, MemoClass>,
    MemoExoticComponent<
      ForwardRefExoticComponent<React.ComponentPropsWithRef<MemoClass>>
    >,
    Pass
  >(),
]);
