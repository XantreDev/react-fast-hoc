import { cleanup, render } from "@testing-library/react";
import { Objects } from "hotscript";
import React, { createElement, forwardRef, memo } from "react";
import { Function } from "ts-toolbelt";
import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { createTransformProps, transformProps, wrapIntoProxy } from ".";

const identityProps = <T>(props: T) => props;

afterEach(() => {
  cleanup();
});

// TODO: remove ts-expect-error

describe("transforms component to needed type", () => {
  class ClassComponent extends React.Component {
    render(): React.ReactNode {
      return null;
    }
  }

  test("works correct with FC", () => {
    expect(createTransformProps(identityProps)(() => null)).toBeTypeOf(
      "function"
    );
  });
  test("transforms class component to function component", () => {
    console.log(createTransformProps(identityProps)(ClassComponent));
    expect(
      // @ts-expect-error internal property
      createTransformProps(identityProps)(ClassComponent).render
    ).toBeTypeOf("function");
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
  const addBebeHoc = createTransformProps<[Objects.Omit<"bebe">]>(
    addBebeProp as any
  );
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

  const n = <T extends Function>(data: Function.Narrow<T>) => data;

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

  // this
  test("works with forwardRef after hoc", () => {
    // @ts-expect-error Has no ref
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

  // TODO: add support for lazy
  // test("works with unloaded lazy", async () => {
  //   const Cmp = vi.fn(Component);
  //   const Lazy = React.lazy(() => Promise.resolve({ default: Cmp }));

  //   console.log(Lazy._payload._result.toString());
  //   console.log(Lazy._init.toString());
  //   render(
  //     createElement(
  //       React.Suspense,
  //       {},
  //       createElement(addBebeHoc(Lazy))
  //     )
  //   );
  //   await waitFor(() => {
  //     expect(Cmp).toHaveBeenCalled();
  //     console.log(Lazy)
  //     expect(addBebeProp).toHaveBeenCalled();
  //     expect(addBebeProp).lastCalledWith({});
  //     expect(Cmp).toHaveBeenCalledWith({ bebe: true }, {});
  //   });
  // });
});

describe.skip("type tests", () => {
  expectTypeOf(() =>
    transformProps(
      {} as React.ForwardRefExoticComponent<{
        ref?: React.Ref<number>;
      }>,
      identityProps
    )
  )
    .returns.parameter(0)
    .toEqualTypeOf<{
      ref?: React.Ref<number>;
    }>();

  expectTypeOf(() =>
    wrapIntoProxy({})(
      {} as React.ForwardRefExoticComponent<{
        ref?: React.Ref<number>;
      }>
    )
  )
    .returns.parameter(0)
    .toEqualTypeOf<{
      ref?: React.Ref<number>;
    }>();
});
