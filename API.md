# API Documentation

This document provides an overview of the API for the `react-fast-hoc` package. The package includes three primary functions to create Higher-Order Components (HOCs) in a fast and efficient manner using JavaScript proxies.

## Table of Contents

- [CreateHocComponentOptions](#CreateHocComponentOptions)
- [transformProps](#transformProps)
- [createHoc](#createHoc)
- [createTransformProps](#createTransformProps)
- [wrapIntoProxy](#wrapIntoProxy)

---

```ts
export type CreateHocComponentOptions = (
  | {
      /** @deprecated use displayNameTransform */
      nameRewrite: string;
    }
  | {
      /** @deprecated use displayNameTransform */
      namePrefix: string;
    }
  | {
      /**
       * @description its to useful to know what component is wrapped in hoc in devtools
       */
      displayNameTransform:
        | {
            type: "rewrite";
            value: string;
          }
        | {
            type: "prefix";
            value: string;
          }
        | {
            type: "rewrite-dynamic";
            value: (name: string) => string;
          };
    }
) & {
  /**
   * @deprecated
   * @description This feature has overhead in terms of using another proxy
   * to you can easilty mutate and define new properties, and not change inital component
   */
  mimicToNewComponent?: boolean;
};
```

---

## transformProps

`transformProps` is a simple and easy way to create an adapter for a React component. It uses the `createTransformProps` function under the hood.

### Syntax

```typescript
function transformProps<T, TNewProps, TPreviousProps>(
  Component: T,
  transformer: (props: TNewProps) => TPreviousProps,
  options?: CreateHocComponentOptions
): TransformPropsReturn<T, TNewProps>;
```

### Parameters

- `Component`: The React component to wrap in the HOC.
- `transformer`: A function that takes the new props and returns the previous props for the wrapped component.
- `options` (optional): CreateHocComponentOptions

### Returns

A new component wrapped in the HOC with the specified prop transformations.

---

## createHoc

`createHoc` is primarily designed for library creators due to its complex typings using the `hotscript` package. However, it can be used for creating any kind of HOCs.

### Syntax

```typescript
function createHoc<TPipeTransform, ComponentPropsExtends>(
  params: FastHocArg
): FastHocReturn<TPipeTransform, ComponentPropsExtends>;
```

### Parameters

- `params`: An object containing the configuration for the HOC. _Extends CreateHocComponentOptions._ It includes:
  - `propsTransformer`: A function to transform the props of the wrapped component.
  - `resultTransformer`: A function to transform the rendered JSX of the wrapped component.
  - `displayNameTransform`: Property for displayName rewrite.
  - `mimicToNewComponent`: enabled by default

### Returns

A function that takes a React component as an argument and returns a new component wrapped in the HOC with the specified transformations.

---

## createTransformProps

`createTransformProps` is a simpler and more accessible version of `createHoc`. It's primarily designed for library creators but can also be used for creating any kind of HOCs.

### Syntax

```typescript
function createTransformProps<TPipeTransform, ComponentPropsExtends>(
  propsTransformer: FastHocPropsTransformer,
  displayNamePrefix?: string
): FastHocReturn<TPipeTransform, ComponentPropsExtends>;
```

### Parameters

- `propsTransformer`: A function to transform the props of the wrapped component.
- `options` (optional): CreateHocComponentOptions

### Returns

A function that takes a React component as an argument and returns a new component wrapped in the HOC with the specified prop transformations.

---

## wrapIntoProxy

`wrapIntoProxy` is a higher-order function that allows you to wrap a component into a Proxy as a functional component. This function takes a `ProxyHandler` as an argument and returns another function that accepts a `React.ComponentType`.

### Parameters

- `proxy`: A `ProxyHandler` object which defines the behavior of the proxy when various operations are performed on it.

- `Component`: A `React.ComponentType` that represents the component to be wrapped into the proxy.

### Returns

A wrapped component that is a `React.ComponentType`.

### Usage

```tsx
import React from "react";
import { wrapIntoProxy } from "./react-fast-hoc";

// Define a ProxyHandler
const proxyHandler: ProxyHandler<Function> = {
  apply: function (target, thisArg, argumentsList) {
    console.log("Called with arguments:", argumentsList);
    return Reflect.apply(target, thisArg, argumentsList);
  },
};

// Define a component
const MyComponent: React.FC<{ text: string }> = ({ text }) => <div>{text}</div>;

// Wrap the component into a proxy
const ProxiedComponent = wrapIntoProxy(proxyHandler)(MyComponent);

// Usage
function App() {
  return <ProxiedComponent text="hello world" />;
}
```

In this example, `wrapIntoProxy` is used to wrap `MyComponent` into a proxy. The `proxyHandler` defines a trap for the `apply` operation, which logs the arguments that the component is called with. When `ProxiedComponent` is rendered in the `App` component, it logs the props that it's rendered with, in this case `{ text: "hello world" }`.

---
