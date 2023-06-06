import type React from "react";

type ComponentArgs = [props: object, ref: React.Ref<unknown>];

export class RewriteCall implements ProxyHandler<Function> {
  constructor(
    private handler: (props: {
      args: ComponentArgs;
      renderComponent: (...args: ComponentArgs) => React.ReactNode;
    }) => React.ReactNode
  ) {}

  apply(target: Function, self: Function, args: any[]) {
    return this.handler({
      renderComponent: target as any,
      args: args as any,
    });
  }
}
