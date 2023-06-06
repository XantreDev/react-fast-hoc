import type { Fn } from "hotscript";
import { createHoc } from "./createHoc";
import type {
  CreateHocComponentOptions,
  PropsBase,
  PropsTransformer,
} from "./type";

const DEFAULT_TRANSFORM_OPTIONS = { namePrefix: "Transformed" } as const;
/**
 *
 * @description create a hoc that automagically applies proxy to component. *Transformations is not typesafe, you should [hotscript](https://github.com/gvergnaud/HOTScript) for type transformation*
 * @example
 * ```tsx
 * const withProps = createTransformProps<[], { newProp: string }>((props) => ({
 *  ...props,
 *  newProp: props?.newProp ?? "newProp",
 * }));
 * ```
 * @param propsTransformer You can use react hooks in the transformer function
 * @param options
 * @returns
 */
export const createTransformProps = <
  TPipeTransform extends Fn[] = [],
  ComponentPropsExtends extends PropsBase = PropsBase
>(
  propsTransformer: PropsTransformer,
  options?: CreateHocComponentOptions
) =>
  createHoc<TPipeTransform, ComponentPropsExtends>({
    propsTransformer,
    resultTransformer: null,
    ...(options ?? DEFAULT_TRANSFORM_OPTIONS),
  });
