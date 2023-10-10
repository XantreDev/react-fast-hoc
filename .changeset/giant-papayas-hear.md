---
"react-fast-hoc": minor
---

Made displayName editable for each transformed component:

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
