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

    const Bebe = transformProps(Beb, (props) => props, {
      nameRewrite: "Bebe",
    });
    expect(Bebe.displayName).toBe("Bebe");
  });
  test("prefix function works", () => {
    const C = transformProps(A, (props) => props, {
      namePrefix: "C",
    });

    expect(C.displayName).toBe("CA");
    const Bebe = transformProps(Beb, (props) => props, {
      namePrefix: "Bebe",
    });
    expect(Bebe.displayName).toBe("BebeBababa");
  });
});
