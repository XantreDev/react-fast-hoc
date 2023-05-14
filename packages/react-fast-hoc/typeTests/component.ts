import React, { ForwardRefExoticComponent, MemoExoticComponent } from "react";
import { WrappedComponent } from "../src";
import { Pass, check, checks } from "./helpers";

type Functional = React.FC<{ a: number }>;
type FunctionalWithRef = React.ForwardRefExoticComponent<{ a: number }>;
type Class = React.ComponentClass<{ a: number }>;
type MemoFunctional = React.MemoExoticComponent<React.FC<{ a: number }>>;
type MemoClass = React.MemoExoticComponent<React.ComponentClass<{ a: number }>>;

checks([
  check<WrappedComponent<[], any, Functional>, Functional, Pass>(),
  check<
    WrappedComponent<[], any, FunctionalWithRef>,
    FunctionalWithRef,
    Pass
  >(),
  check<
    WrappedComponent<[], any, Class>,
    React.ForwardRefExoticComponent<React.ComponentPropsWithRef<Class>>,
    Pass
  >(),
  check<WrappedComponent<[], any, MemoFunctional>, MemoFunctional, Pass>(),
  check<
    WrappedComponent<[], any, MemoClass>,
    MemoExoticComponent<
      ForwardRefExoticComponent<React.ComponentPropsWithRef<MemoClass>>
    >,
    Pass
  >(),
]);
