type Nameable = { displayName?: string; name?: string };

export const getComponentName = (Component: Function) =>
  (Component as Nameable)?.displayName ??
  (Component as Nameable)?.name ??
  "UnknownComponent";
