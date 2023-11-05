import { act, cleanup, render } from "@testing-library/react";
import { createElement, memo } from "react";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { transformProps } from "..";
import { useRerender } from "./utils";

describe("hooks for transforms should work", () => {
  const A = vi.fn(() => null);
  afterEach(() => {
    cleanup();
    A.mockClear();
  });
  it("should replace compare function", () => {
    const AMemo = memo(A, () => false);
    const B = transformProps(AMemo, (it) => it, {
      hooks: [
        {
          type: "first-memo",
          value: () => null,
        },
      ],
    });

    let rerender: null | (() => void) = null;
    const C = vi.fn(() => {
      rerender = useRerender();
      return createElement(B);
    });

    render(createElement(C));
    expect(A).toHaveBeenCalledTimes(1);
    expect(C).toHaveBeenCalledOnce();
    expect(rerender).toBeTruthy();
    act(() => {
      rerender?.();
    });
    expect(C).toHaveBeenCalledTimes(2);
    expect(A).toHaveBeenCalledTimes(1);
  });
});
