import { describe, expect, test } from "vitest";
import { transformProps } from ".";

describe("renaming works", () => {
  const A = () => null;
  const Beb = () => null;
  Object.assign(Beb, { displayName: "Bababa" });
  test("rewrite function works", () => {
    const B = transformProps(A, (props) => props, {
      nameRewrite: "B",
    });

    expect(B.displayName).toBe("B");
    expect(
      transformProps(B, (props) => props, {
        displayNameTransform: {
          type: "rewrite",
          value: "D",
        },
      }).displayName
    ).toBe("D");

    const Bebe = transformProps(Beb, (props) => props, {
      nameRewrite: "Bebe",
    });
    expect(Bebe.displayName).toBe("Bebe");
  });
  test("prefix function works", () => {
    expect(
      transformProps(A, (props) => props, {
        namePrefix: "C",
      }).displayName
    ).toBe("CA");
    expect(
      transformProps(A, (props) => props, {
        displayNameTransform: {
          type: "prefix",
          value: "CBC",
        },
      }).displayName
    ).toBe("CBCA");
    const Bebe = transformProps(Beb, (props) => props, {
      namePrefix: "Bebe",
    });
    expect(Bebe.displayName).toBe("BebeBababa");
  });

  test("dynamic renaming works", () => {
    expect(
      transformProps(A, (props) => props, {
        displayNameTransform: {
          value: (name) => name + "C",
          type: "rewrite-dynamic",
        },
      }).displayName
    ).toBe("AC");
  });
});
