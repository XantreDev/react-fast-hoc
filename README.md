# React Fast HOC

Lightweight and type-safe High-Order Components (HOCs) library for React, leveraging high-order types from "hotscript" and JavaScript Proxies for zero VDOM overhead and blazing-fast performance.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [transformProps](#transformProps)
  - [createHoc](#createHoc)
  - [createTransformProps](#createTransformProps)
- [API Reference](#api-reference)
- [Examples](#examples)
- [License](#license)

## Installation

Install the `react-fast-hoc` package:

pnpm:
```sh
pnpm i react-fast-hoc
```

npm: 
```sh
npm i react-fast-hoc
```

yarn:
```sh
yarn add react-fast-hoc
```

Or with [ni](https://www.npmjs.com/package/@antfu/ni):

```sh
ni react-fast-hoc
```

Install the `hotscript` for advanced usage:
```sh
ni -D hotscript
```
## Usage

### transformProps

Directly create a new component with transformed props.

```typescript
import { transformProps } from "react-fast-hoc";

const EnhancedComponent = transformProps(
  MyComponent,
  (props) => {
    // Transform props here
    return { ...props, transformedProp: "Transformed Value" };
  },
  "WithTransformedProps"
);
```

### createHoc

Create a new HOC with a custom props transformer and optional display name prefix.

```typescript
import { createHoc } from "react-fast-hoc";

const withCustomLogic = createHoc({
  namePrefix: "WithCustomLogic",
  propsTransformer: (props) => {
    // Apply custom logic here
    return { ...props, customProp: "Custom Value" };
  },
  resultTransformer: null,
  nameRewrite: null,
});

const EnhancedComponent = withCustomLogic(MyComponent);
```

### createTransformProps

Create a new HOC that transforms the props passed to the wrapped component.

```typescript
import { createTransformProps } from "react-fast-hoc";

const withTransformedProps = createTransformProps((props) => {
  // Transform props here
  return { ...props, transformedProp: "Transformed Value" };
}, "WithTransformedProps");

const EnhancedComponent = withTransformedProps(MyComponent);
```

> You can use `wrapIntoProxy` to create more customizable hocs

## API Reference

Detailed API documentation can be found in the [API.md](./API.md) file.

## Examples

You can find example usage of `react-fast-hoc` in the [examples](./examples) folder.

## License

React Fast HOC is [MIT licensed](./LICENSE).
