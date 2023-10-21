---
"react-fast-hoc": patch
---

Fixed wrapping into hoc in case of nested `React.memo`
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
