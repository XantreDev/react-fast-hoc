import type { ComponentType, ReactNode } from "react";

import {
  HocTransformer,
  wrapComponentIntoHoc,
  wrapPropsTransformer,
} from "./internals";
import { FC_STORE, TRANSFORMED_TO_FUNCTIONAL_STORE_KEY } from "./toFunctional";

Object.defineProperty(
  typeof window !== "undefined" ? window : global,
  TRANSFORMED_TO_FUNCTIONAL_STORE_KEY,
  {
    value: FC_STORE,
  }
);

const createHoc = (
  params:
    | {
        propsTransformer: null | ((props: any) => any);
        resultTransformer: null | ((jsx: ReactNode) => ReactNode);
      } & (
        | {
            namePrefix: string;
            nameRewrite: null;
          }
        | {
            namePrefix: null;
            nameRewrite: string;
          }
      )
) => {
  const proxyObject = new HocTransformer(
    // @ts-expect-error
    params.propsTransformer
      ? wrapPropsTransformer(params.propsTransformer)
      : null,
    params.resultTransformer,
    "namePrefix" in params ? params.namePrefix : null,
    "nameRewrite" in params ? params.nameRewrite : null
  );

  return (component: ComponentType<unknown>) =>
    // @ts-expect-error
    wrapComponentIntoHoc(component, proxyObject);
};

export const transformProps = <
  TResult extends object,
  TRequirement extends object = Record<never, never>
>(
  propsTransformer: (data: TRequirement) => TResult,
  displayNamePrefix?: string
) =>
  createHoc({
    namePrefix: displayNamePrefix ?? "Transformed",
    propsTransformer,
    resultTransformer: null,
    nameRewrite: null,
  });
