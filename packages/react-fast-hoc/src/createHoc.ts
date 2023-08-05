import type { ComposeLeft, Fn } from "hotscript";
import type { ComponentType } from "react";
import { HocTransformer, MimicToNewComponentHandler } from "./handlers";
import { wrapComponentIntoHoc, wrapPropsTransformer } from "./internals";
import type {
  CreateHocOptions,
  CreateHocReturn,
  PipeTransform,
  PropsBase,
} from "./type";

type PropsTransformPipe = Fn[];

/**
 * @description *Transformations is not typesafe, you should [hotscript](https://github.com/gvergnaud/HOTScript) for type transformation*
 * @param propsTransformer You can use react hooks in the transformer function.
 * @param displayNamePrefix
 * @returns
 */
export const createHoc = <
  TPipeTransform extends Fn[] | PipeTransform<any, any>,
  ComponentPropsExtends extends PropsBase = PropsBase,
  TActualTransform extends PipeTransform<any, any> = TPipeTransform extends Fn[]
    ? PipeTransform<"props", ComposeLeft<TPipeTransform>>
    : TPipeTransform
>(
  params: CreateHocOptions
) => {
  const { mimicToNewComponent = true } = params;
  const proxyObject = new HocTransformer(
    params.propsTransformer
      ? wrapPropsTransformer(params.propsTransformer)
      : null,
    params.resultTransformer,
    "namePrefix" in params ? params.namePrefix : null,
    "nameRewrite" in params ? params.nameRewrite : null
  );
  const mimicToHandler = mimicToNewComponent
    ? new MimicToNewComponentHandler()
    : null;

  return ((component: ComponentType<unknown>) =>
    wrapComponentIntoHoc(
      component,
      proxyObject,
      mimicToHandler
    )) as CreateHocReturn<TActualTransform, ComponentPropsExtends>;
};
