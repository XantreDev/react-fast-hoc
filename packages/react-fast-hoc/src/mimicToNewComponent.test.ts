import { assert, beforeEach, describe, expect, test } from "vitest";
import { transformProps } from ".";

const createComponent = () => () => null;

describe("mimic to new component test", () => {
  let Component = createComponent();
  beforeEach(() => {
    Component = createComponent();
    Object.assign(Component, { displayName: "Component" });
  });

  test("test addition", () => {
    const wrappedComponent = Object.assign(
      transformProps(Component, (props) => props, {
        mimicToNewComponent: true,
      }),
      {
        bebe: "da",
      }
    );
    expect(wrappedComponent).toHaveProperty("bebe");
    expect(wrappedComponent.bebe).toEqual("da");
    assert(!("bebe" in Component));
    // @ts-expect-error
    delete wrappedComponent.bebe;
    assert(!("bebe" in wrappedComponent));
    // @ts-expect-error
    assert(wrappedComponent.bebe === undefined);
  });
});
