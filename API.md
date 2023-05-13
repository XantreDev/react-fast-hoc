# API Documentation

This document provides an overview of the API for the `react-fast-hoc` package. The package includes three primary functions to create Higher-Order Components (HOCs) in a fast and efficient manner using JavaScript proxies.

## Table of Contents

- [createHoc](#createHoc)
- [createTransformProps](#createTransformProps)
- [transformProps](#transformProps)

---

## createHoc

`createHoc` is primarily designed for library creators due to its complex typings using the `hotscript` package. However, it can be used for creating any kind of HOCs.

### Syntax

```typescript
createHoc<TPipeTransform, ComponentPropsExtends>(params: FastHocArg): FastHocReturn<TPipeTransform, ComponentPropsExtends>
```

### Parameters

- `params`: An object containing the configuration for the HOC. It includes:
  - `propsTransformer`: A function to transform the props of the wrapped component.
  - `resultTransformer`: A function to transform the rendered JSX of the wrapped component.
  - `namePrefix`: A string to prefix the display name of the wrapped component.
  - `nameRewrite`: A string to replace the display name of the wrapped component.

### Returns

A function that takes a React component as an argument and returns a new component wrapped in the HOC with the specified transformations.

---

## createTransformProps

`createTransformProps` is a simpler and more accessible version of `createHoc`. It's primarily designed for library creators but can also be used for creating any kind of HOCs.

### Syntax

```typescript
createTransformProps<TPipeTransform, ComponentPropsExtends>(propsTransformer: FastHocPropsTransformer, displayNamePrefix?: string): FastHocReturn<TPipeTransform, ComponentPropsExtends>
```

### Parameters

- `propsTransformer`: A function to transform the props of the wrapped component.
- `displayNamePrefix` (optional): A string to prefix the display name of the wrapped component.

### Returns

A function that takes a React component as an argument and returns a new component wrapped in the HOC with the specified prop transformations.

---

## transformProps

`transformProps` is a simple and easy way to create an adapter for a React component. It uses the `createTransformProps` function under the hood.

### Syntax

```typescript
transformProps<T, TNewProps, TPreviousProps>(Component: T, transformer: (props: TNewProps) => TPreviousProps, displayNamePrefix?: string): TransformPropsReturn<T, TNewProps>
```

### Parameters

- `Component`: The React component to wrap in the HOC.
- `transformer`: A function that takes the new props and returns the previous props for the wrapped component.
- `displayNamePrefix` (optional): A string to prefix the display name of the wrapped component.

### Returns

A new component wrapped in the HOC with the specified prop transformations.

---
