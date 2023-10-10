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

  test("that component is imperatively renameable", () => {
    const _ = transformProps(A, (props) => props, {
      displayNameTransform: {
        value: (name) => name + "C",
        type: "rewrite-dynamic",
      },
    });
    expect(_.displayName).toBe("AC");
    _.displayName = "D";
    expect(_.displayName).toBe("D");
    const __ = transformProps(_, (props) => props, {
      displayNameTransform: {
        type: "rewrite",
        value: "E",
      },
    });
    expect(__.displayName).toBe("E");
    __.displayName = "bebe";
    expect(__.displayName).toBe("bebe");
    expect(_.displayName).toBe("D");
  });
});
