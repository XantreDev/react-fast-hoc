# React Fast HOC

Lightweight and type-safe High-Order Components (HOCs) library for React, leveraging high-order types from "hotscript" and JavaScript Proxies for zero VDOM overhead and blazing-fast performance.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [createHoc](#createHoc)
  - [createTransformProps](#createTransformProps)
  - [transformProps](#transformProps)
- [API Reference](#api-reference)
- [Examples](#examples)
- [License](#license)

## Installation

Install the `react-fast-hoc` package:

```sh
# hotscript is a peer dependency

npm i react-fast-hoc && npm i -D hotscript
# or
yarn add react-fast-hoc && yarn add -D hotscript
# or
pnpm i react-fast-hoc && pnpm i -D hotscript
```

Or with [ni](https://www.npmjs.com/package/@antfu/ni):

```sh
ni react-fast-hoc && ni -D hotscript
```

## Usage

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

## API Reference

Detailed API documentation can be found in the [API.md](./API.md) file.

## Examples

You can find example usage of `react-fast-hoc` in the [examples](./examples) folder.

## License

React Fast HOC is [MIT licensed](./LICENSE).
