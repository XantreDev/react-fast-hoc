---
"react-fast-hoc": minor
---

Added new syntax for name rewriting, old one is deprecated and will be removed soon

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
