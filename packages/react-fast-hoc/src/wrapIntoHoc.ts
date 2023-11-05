import { Identity } from "hotscript";
import type { HocTransformer } from "./handlers";
import { wrapComponentIntoHoc } from "./internals";
import type { PropsBase, WrappedComponent } from "./type";

/**
 * allows to wrap component into the proxy as functional component
 */
export const wrapIntoProxy =
  (handler: ProxyHandler<Function>) =>
  <T extends React.ComponentType<any>>(Component: T) =>
    wrapComponentIntoHoc(
      Component,
      handler as HocTransformer,
      null,
      null
    ) as WrappedComponent<Identity, PropsBase, T>;
