import {
  RenderResult,
  render,
} from "@testing-library/react";
import React, { ComponentType, createElement } from "react";

export const renderComponent = (Component: React.ComponentType): RenderResult =>
  render(createElement(Component));

export const lazyShort = <T extends ComponentType<any>>(component: T) =>
  React.lazy(() =>
    Promise.resolve({
      default: component,
    })
  );

export const applyHocs = <T extends ComponentType<any>>(
  Component: T,
  hocs: ((...args: any) => any)[]
): T => hocs.reduceRight((acc, cur) => cur(acc), Component);
