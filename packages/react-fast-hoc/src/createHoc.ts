import type { ComposeLeft, Fn } from "hotscript";
import type { ComponentType } from "react";
import { HocTransformer, MimicToNewComponentHandler } from "./handlers";
import { wrapComponentIntoHoc, wrapPropsTransformer } from "./internals";
import type {
  CreateHocNameOption,
  CreateHocOptions,
  CreateHocReturn,
  DisplayNameTransform,
  HocTypeTransform,
  PropsBase,
} from "./type";
import { UnionToIntersection } from "type-fest";
import { isString } from "./shared";

const paramsToDisplayNameTransformer = (
  params: Partial<UnionToIntersection<CreateHocNameOption>>
): DisplayNameTransform | null => {
  if (isString(params.namePrefix)) {
    return {
      type: "prefix",
      value: params.namePrefix,
    };
  }
  if (isString(params.nameRewrite)) {
    return {
      type: "rewrite",
      value: params.nameRewrite,
    };
  }

  return params.displayNameTransform ?? null;
};

/**
 * @description *Transformations is not typesafe, you should [hotscript](https://github.com/gvergnaud/HOTScript) for type transformation*
 * @param propsTransformer You can use react hooks in the transformer function.
 * @param displayNamePrefix
 * @returns
 */
export const createHoc = <
  TPipeTransform extends Fn[] | HocTypeTransform<any, any>,
  ComponentPropsExtends extends PropsBase = PropsBase,
  TActualTransform extends HocTypeTransform<
    any,
    any
  > = TPipeTransform extends Fn[]
    ? HocTypeTransform<"props", ComposeLeft<TPipeTransform>>
    : TPipeTransform
>(
  params: CreateHocOptions
) => {
  const proxyObject = new HocTransformer(
    params.propsTransformer
      ? wrapPropsTransformer(params.propsTransformer)
      : null,
    params.resultTransformer,
    paramsToDisplayNameTransformer(params)
  );
  const mimicToHandler =
    params?.mimicToNewComponent ?? false
      ? new MimicToNewComponentHandler()
      : null;

  return ((component: ComponentType<unknown>) =>
    wrapComponentIntoHoc(
      component,
      proxyObject,
      mimicToHandler
    )) as CreateHocReturn<TActualTransform, ComponentPropsExtends>;
};
