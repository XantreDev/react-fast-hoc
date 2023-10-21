import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { range, sleep, tryit } from "radash";
import React, { ComponentType, createElement } from "react";
import { applyHocs, lazyShort, renderComponent } from "./utils";

function noop() {}

afterEach(() => {
  cleanup();
});

/**
 * oportunities
 * memo = 1..9999 memos
 *
 * memo -> forwardRef
 * lazy -> memo -> forwardRef
 * memo -> lazy -> forwardRef
 * memo -> lazy -> memo -> forwardRef
 * memo -> lazy -> memo -> lazy -> memo -> forwardRef
 *
 */
describe("react test", () => {
  const originalConsole = window.console;
  beforeAll(() => {
    window.console = new Proxy(originalConsole, {
      get() {
        return noop;
      },
    });
  });
  afterAll(() => {
    window.console = originalConsole;
  });
  it("memo of forwardRef working", () => {
    renderComponent(React.memo(React.forwardRef(() => null)));
  });

  it.fails("forwardRef of memo is not working", () => {
    renderComponent(React.forwardRef(React.memo(() => null)));
  });

  it("memo of memo is working", () => {
    renderComponent(applyHocs(() => null, [React.memo, React.memo]));

    // we can actually wrap component into memo infinitevely
    renderComponent(
      applyHocs(
        () => null,
        [...range(100)].map(() => React.memo)
      )
    );
  });
  it("forwardRef of forwardRef is not working", () => {
    const [err] = tryit(() =>
      renderComponent(
        applyHocs(() => null, [React.forwardRef, React.forwardRef])
      )
    )();
    expect(err).toBeTruthy();
  });

  it("lazy can return forwardRef", async () => {
    let rendered = false;
    const Lazy = React.lazy(() =>
      Promise.resolve({
        default: React.forwardRef(() => ((rendered = true), null)),
      })
    );
    renderComponent(Lazy);
    await waitFor(() => {
      expect(rendered).toBe(true);
    });
  });
  it("lazy can return memo", async () => {
    let rendered = false;
    renderComponent(
      applyHocs(() => ((rendered = true), null), [lazyShort, React.memo])
    );
    await waitFor(() => {
      expect(rendered).toBe(true);
    });
  });
  it("lazy cannot wrap lazy", async () => {
    let rendered = false;
    renderComponent(
      applyHocs(() => ((rendered = true), null), [lazyShort, lazyShort])
    );

    const [err] = await tryit(
      async () =>
        await act(async () => {
          await sleep(20);
        })
    )();
    expect(err).toBeTruthy();
    expect(rendered).toBeFalsy();
  });
  it("memo can wrap lazy", async () => {
    let rendered = false;

    renderComponent(
      applyHocs(() => ((rendered = true), null), [React.memo, lazyShort])
    );

    await waitFor(() => {
      expect(rendered).toBeTruthy();
    });
  });

  it("memo -> lazy -> memo", async () => {
    let rendered = false;
    renderComponent(
      applyHocs(
        () => ((rendered = true), null),
        [React.memo, lazyShort, React.memo]
      )
    );

    await waitFor(() => {
      expect(rendered).toBeTruthy();
    });
  });
  it("memo -> lazy -> memo -> lazy -> memo -> forwardRef", async () => {
    let rendered = false;
    renderComponent(
      applyHocs(() => {
        rendered = true;
        return null;
      }, [
        React.memo,
        lazyShort,
        React.memo,
        lazyShort,
        React.memo,
        React.forwardRef,
      ])
    );

    await waitFor(() => {
      expect(rendered).toBeTruthy();
    });
  });
});
