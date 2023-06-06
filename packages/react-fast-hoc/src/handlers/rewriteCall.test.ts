import { describe, expect, test, vi } from "vitest";
import { RewriteCall } from "./rewriteCall";

describe("rewrite call should rewrite it", () => {
  const f = vi.fn();

  test("actully rewrites call", () => {
    new Proxy(
      f,
      new RewriteCall(() => {
        return null;
      })
    )();

    expect(f).toHaveBeenCalledTimes(0);

    new Proxy(
      f,
      new RewriteCall(({ renderComponent, args }) => {
        expect(args).toHaveLength(1);
        expect(args).toEqual([220]);
        // @ts-expect-error
        renderComponent("bebe");
        // @ts-expect-error
        return renderComponent("bebe");
      })
    )(220);

    expect(f).toHaveBeenCalledTimes(2);
    expect(f).toHaveBeenCalledWith("bebe");
  });
});
