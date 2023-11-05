type Nameable = { displayName?: string; name?: string };

export const getComponentName = (Component: Function & Partial<Nameable>) =>
  Component?.displayName ?? Component?.name ?? "UnknownComponent";

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const REACT_MEMO_TYPE = Symbol.for("react.memo");
export const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
export const REACT_LAZY_TYPE = Symbol.for("react.lazy");
