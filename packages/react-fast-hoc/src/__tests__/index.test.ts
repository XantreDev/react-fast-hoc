import { cleanup, render, waitFor } from "@testing-library/react";
import { sleep } from "radash";
import { Objects } from "hotscript";
import React, { ComponentType, createElement, forwardRef, memo } from "react";
import { Function } from "ts-toolbelt";
import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { createTransformProps, transformProps, wrapIntoProxy } from "..";
import { applyHocs, lazyShort, renderComponent } from "./utils";

declare module "react" {
  export interface ExoticComponent {
    _payload?: {
      _result: any;
    };
    _init?: () => void;
  }
}

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

  describe("hocs: memo", () => {
    test("memo -> hoc", () => {
      renderComponent(applyHocs(Component, [React.memo, addBebeHoc]));
      standardCheck();
    });
    test("hoc -> memo", () => {
      renderComponent(applyHocs(Component, [addBebeHoc, React.memo]));

      expect(Component).toHaveBeenCalledOnce();
      expect(addBebeProp).toHaveBeenCalledOnce();
      expect(addBebeProp).toHaveBeenCalledWith({});
      expect(Component).toHaveBeenCalledWith({ bebe: true }, {});
    });
    test("hoc -> memo -> memo", () => {
      renderComponent(
        applyHocs(Component, [addBebeHoc, React.memo, React.memo])
      );

      expect(Component).toHaveBeenCalledOnce();
      expect(addBebeProp).toHaveBeenCalledOnce();
      expect(addBebeProp).toHaveBeenCalledWith({});
      expect(Component).toHaveBeenCalledWith({ bebe: true }, {});
    });
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

  describe("hocs: lazy", () => {
    test("unloaded lazy", async () => {
      const Cmp = vi.fn(Component);
      const Lazy = lazyShort(Cmp);

      render(
        createElement(React.Suspense, {}, createElement(addBebeHoc(Lazy)))
      );
      await waitFor(() => {
        expect(Cmp).toHaveBeenCalled();
        expect(addBebeProp).toHaveBeenCalled();
        expect(addBebeProp).lastReturnedWith({
          bebe: true,
        });
      });
    });
    test("pending lazy", async () => {
      const Cmp = vi.fn(Component);
      const lazyInit = vi.fn(() => sleep(20).then(() => ({ default: Cmp })));
      const Lazy = React.lazy(lazyInit);
      const r = render(createElement(React.Suspense, {}, createElement(Lazy)));
      expect(Cmp).not.toHaveBeenCalled();
      expect(lazyInit).toHaveBeenCalled();

      r.rerender(
        createElement(React.Suspense, {}, createElement(addBebeHoc(Lazy)))
      );

      await waitFor(
        () => {
          expect(Cmp).toHaveBeenCalled();
          expect(addBebeProp).toHaveBeenCalled();
          expect(addBebeProp).lastReturnedWith({
            bebe: true,
          });
        },
        {
          timeout: 100,
        }
      );
    });
    test("resolved lazy", async () => {
      const Cmp = vi.fn(Component);
      const Lazy = React.lazy(() => Promise.resolve({ default: Cmp }));
      const r = render(createElement(React.Suspense, {}, createElement(Lazy)));
      await waitFor(
        () => {
          expect(Cmp).toHaveBeenCalled();
          expect(addBebeProp).not.toHaveBeenCalled();
        },
        {
          timeout: 100,
        }
      );

      r.rerender(
        createElement(React.Suspense, {}, createElement(addBebeHoc(Lazy)))
      );
      expect(Cmp).toHaveBeenCalledTimes(2);
      expect(addBebeProp).toHaveBeenCalled();
      expect(Cmp).lastCalledWith(
        {
          bebe: true,
        },
        {}
      );
      expect(addBebeProp).lastReturnedWith({
        bebe: true,
      });
    });
  });
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
