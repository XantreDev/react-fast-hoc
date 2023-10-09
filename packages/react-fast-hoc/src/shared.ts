type Nameable = { displayName?: string; name?: string };

export const getComponentName = (Component: Function & Partial<Nameable>) =>
  Component?.displayName ?? Component?.name ?? "UnknownComponent";

export const isString = (value: unknown): value is string =>
  typeof value === "string";
