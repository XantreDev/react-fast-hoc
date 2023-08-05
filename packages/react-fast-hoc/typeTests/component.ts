import { Identity } from "hotscript";
import React, { ForwardRefExoticComponent, MemoExoticComponent } from "react";
import { WrappedComponent } from "../src";
import { Pass, check, checks } from "./helpers";

type Functional = React.FC<{ a: number }>;
type FunctionalWithRef = React.ForwardRefExoticComponent<{ a: number }>;
type Class = React.ComponentClass<{ a: number }>;
type MemoFunctional = React.MemoExoticComponent<React.FC<{ a: number }>>;
type MemoClass = React.MemoExoticComponent<React.ComponentClass<{ a: number }>>;

checks([
  check<WrappedComponent<Identity, any, Functional>, Functional, Pass>(),
  check<
    WrappedComponent<Identity, any, FunctionalWithRef>,
    FunctionalWithRef,
    Pass
  >(),
  check<
    WrappedComponent<Identity, any, Class>,
    React.ForwardRefExoticComponent<React.ComponentPropsWithRef<Class>>,
    Pass
  >(),
  check<
    WrappedComponent<Identity, any, MemoFunctional>,
    MemoFunctional,
    Pass
  >(),
  check<
    WrappedComponent<Identity, any, MemoClass>,
    MemoExoticComponent<
      ForwardRefExoticComponent<React.ComponentPropsWithRef<MemoClass>>
    >,
    Pass
  >(),
]);
