import type { ComposeLeft, Fn, Identity } from "hotscript";
import { createHoc } from "./createHoc";
import type {
  CreateHocComponentOptions,
  CreateTransformPropsOptions,
  HocTypeTransform,
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
  TPipeTransform extends Fn[] | HocTypeTransform<any, any> = HocTypeTransform<
    "props",
    Identity
  >,
  ComponentPropsExtends extends PropsBase = PropsBase,
  TActualTransform extends HocTypeTransform<
    any,
    any
  > = TPipeTransform extends Fn[]
    ? HocTypeTransform<"props", ComposeLeft<TPipeTransform>>
    : TPipeTransform
>(
  propsTransformer: PropsTransformer,
  options?: CreateTransformPropsOptions
) =>
  createHoc<TActualTransform, ComponentPropsExtends>({
    propsTransformer,
    resultTransformer: null,
    ...((options ?? DEFAULT_TRANSFORM_OPTIONS) as CreateHocComponentOptions),
  });
