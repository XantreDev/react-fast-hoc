import { cleanup, render } from "@testing-library/react";
import React, { createElement, forwardRef, memo } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { transformProps } from ".";

const identityProps = <T>(props: T) => props;

afterEach(() => {
  cleanup();
});

describe("transforms component to needed type", () => {
  class ClassComponent extends React.Component {
    render(): React.ReactNode {
      return null;
    }
  }

  test("works correct with FC", () => {
    expect(transformProps(identityProps)(() => null)).toBeTypeOf("function");
  });
  test("transforms class component to function component", () => {
    console.log(transformProps(identityProps)(ClassComponent));
    expect(transformProps(identityProps)(ClassComponent).render).toBeTypeOf(
      "function"
    );
  });
});

describe("transformProps", () => {
  const addBebeProp = vi.fn(
    (props: Record<never, never>) =>
      ({
        ...props,
        bebe: true,
      } as const)
  );
  const addBebeHoc = transformProps(addBebeProp);
  const Component = vi.fn(() => null);
  const propsDetector = vi.fn((props: unknown) => null);

  afterEach(() => {
    addBebeProp.mockClear();
    Component.mockClear();
    propsDetector.mockClear();
  });

  class ClassComponent extends React.Component {
    constructor(props: unknown) {
      console.log("class created", props);
      super(props as {});
      propsDetector(this.props);
    }
    render(): React.ReactNode {
      return createElement("div");
    }
  }

  const standardCheck = () => {
    expect(Component).toHaveBeenCalledOnce();
    expect(addBebeProp).toHaveBeenCalledOnce();
    expect(addBebeProp).toHaveBeenCalledWith({});
    expect(Component).toHaveBeenCalledWith({ bebe: true }, {});
  };

  test("hoc is transforming props correctly", () => {
    render(createElement(addBebeHoc(Component)));
    standardCheck();
  });
  test("hoc is transforming props for ClassComponent correctly", () => {
    console.log(
      typeof ClassComponent,
      ClassComponent.prototype instanceof React.Component
    );
    render(createElement(addBebeHoc(ClassComponent)));

    expect(addBebeProp).toHaveBeenCalledOnce();
    expect(addBebeProp).toHaveBeenCalledWith({ ref: null });
    expect(propsDetector).toHaveBeenCalledWith({
      bebe: true,
      children: undefined,
    });
  });

  test("works with memo after hoc", () => {
    render(createElement(memo(addBebeHoc(Component))));
    standardCheck();
  });
  test("works with memo before hoc", () => {
    render(createElement(addBebeHoc(memo(Component))));

    expect(Component).toHaveBeenCalledOnce();
    expect(addBebeProp).toHaveBeenCalledOnce();
    expect(addBebeProp).toHaveBeenCalledWith({});
    expect(Component).toHaveBeenCalledWith({ bebe: true }, {});
  });

  test("works with forwardRef after hoc", () => {
    render(createElement(forwardRef(addBebeHoc(Component))));

    expect(Component).toHaveBeenCalled();
    expect(addBebeProp).toHaveBeenCalled();
    expect(addBebeProp).lastCalledWith({ ref: null });
    expect(Component).toHaveBeenCalledWith({ bebe: true }, null);
  });

  test("works with forwardRef before hoc", () => {
    render(createElement(addBebeHoc(forwardRef(Component))));

    expect(Component).toHaveBeenCalled();
    expect(addBebeProp).toHaveBeenCalled();
    expect(addBebeProp).lastCalledWith({ ref: null });
    expect(Component).toHaveBeenCalledWith({ bebe: true }, null);
  });
});
