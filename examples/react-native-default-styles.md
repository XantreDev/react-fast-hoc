# React native default props for components

You can use `react-fast-hoc` for adding default styles in your own `react-native` application.

- You could setup project with this manual and use `fontWeight` style property for choosing font weight: https://github.com/jsamr/react-native-font-demo

Code snippet:

```tsx
import * as RN from "react-native";
import { createTransformProps } from "react-fast-hoc";
import { DEFAULT_FONT } from "../themeConstants";

const underlineColorAndroid = "transparent";
const styles = RN.StyleSheet.create({
  font: {
    fontFamily: DEFAULT_FONT,
    color: "white",
  },
});
const transform = createTransformProps(
  (props) => ({
    underlineColorAndroid,
    ...props,
    style: [styles.font, props.style],
  }),
  {
    namePrefix: "Reset.",
    mimicToNewComponent: false,
  }
);

([RN.Text, RN.TextInput] as const).forEach((item) => {
  Object.assign(item, transform(item));
});
```
