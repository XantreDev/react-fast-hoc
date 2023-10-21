# react-fast-hoc

## 0.3.2

### Patch Changes

- 0920933: Removed deprecated api examples from README
  Fixes: [#20](https://github.com/XantreGodlike/react-fast-hoc/issues/20)

## 0.3.1

### Patch Changes

- 32e18c1: Fixed wrapping into hoc in case of nested `React.memo`
  Resolves: [#17](https://github.com/XantreGodlike/react-fast-hoc/issues/17)

  ```tsx
  const Component = transformProps(
    React.memo(
      React.memo((props) => {
        console.log(props); // prev: { c: 30 }, now: { a: 10, b: 20, c: 30 }
        return null;
      })
    ),
    (props) => ({ ...props, a: 10, b: 20 })
  );

  root.render(<Component c={30} />);
  ```

## 0.3.0

### Minor Changes

- d2cc312: Deprecated `mimicToNewComponent` and make default to false (true was before)
- 8680658: Made displayName editable for each transformed component:

  ```tsx
  const _ = transformProps(A, (props) => props, {
    displayNameTransform: {
      value: (name) => name + "C",
      type: "rewrite-dynamic",
    },
  });
  expect(_.displayName).toBe("AC");
  _.displayName = "D";
  expect(_.displayName).toBe("D");
  ```

- d2cc312: Added new syntax for name rewriting, old one is deprecated and will be removed soon

  Static name rewrite

  ```tsx
  transformProps(B, (props) => props, {
    displayNameTransform: {
      type: "rewrite",
      value: "D",
    },
  });

  transformProps(A, (props) => props, {
    displayNameTransform: {
      type: "prefix",
      value: "CBC",
    },
  });
  ```

  Dynamic name rewrite

  ```tsx
  transformProps(A, (props) => props, {
    displayNameTransform: {
      value: (name) => name + "C",
      type: "rewrite-dynamic",
    },
  });
  ```

- f057209: Added support for components wrapped with `React.lazy`

## 0.2.1

### Patch Changes

- 3537998: Fix `wrapIntoProxy` type issue

## 0.2.0

### Minor Changes

- 309bcff: Add oportunity to transform component directly, not only props

## 0.1.7

### Patch Changes

- cc1dfd3: Moved build deps to devDependencies, and fixed type inference

## 0.1.6

### Patch Changes

- 1fb53bb: Changed type to module

## 0.1.5

### Patch Changes

- 5d82ea0: Trying to really add treeshaking

## 0.1.4

### Patch Changes

- e2d3d88: Added RewriteCall proxy handler, can be used with wrapIntoProxy
- 695edfd: Added treeshaking

## 0.1.3

### Patch Changes

- 780a15b: Updated readme

## 0.1.2

### Patch Changes

- 2245bd5: Fixed displayName prop for anonymous components and display name rewrite turned off for production enviroment

## 0.1.1

### Patch Changes

- 65ea788: Fixed types, changed docs. Hotscript moved to dev deps

## 0.1.0

### Minor Changes

- ca39ecc: Added mimic to new component functionality. And changed `createHoc` options object api
- b5e5c89: Fixed types naming

### Patch Changes

- 9966412: Added wrap into proxy function

## 0.0.3

### Patch Changes

- de2fd9f: Added readme.md

## 0.0.2

### Patch Changes

- 286920f: Added automatic release
