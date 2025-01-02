# react-native-slot-numbers

This package was originally named react-native-slot-text, and has been migrated to this
repo.

To install dependencies:

```
npx expo install react-native-reanimated
npx expo install expo-linear-gradient

bun install react-native-slot-numbers @react-native-masked-view/masked-view react-native-easing-gradient
```

This project was created using `bun init` in bun v1.1.21. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


https://github.com/user-attachments/assets/f9fdb47c-92a7-45b2-93ea-72c0d36d729c


https://github.com/user-attachments/assets/8964574b-a596-414f-95f9-42f53f60d781



## Usage

```
    <SlotText
        fontStyle={styles.animatedNumbers}
        value={`${value}`}
        prefix='$'
        animationDuration={200}
        includeComma={true}
    />
```

### Props

| **Prop**                    | **Type**             | **Default**  | **Description**                                                                                                                                                          |
| --------------------------- | -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`                     | `number` \| `string` | **Required** | The value to animate to. Can be a number or a string of numeric characters.                                                                                              |
| `fontStyle`                 | `Object` (TextStyle) | **Required** | The style of the text, passed as a TextStyle object.                                                                                                                     |
| `animationDuration`         | `number`             | `400`        | The duration of the animation in milliseconds. Only supported when `animateIntermediateValues` is `false`.                                                               |
| `prefix`                    | `string`             | `""`         | A prefix to the number, such as a currency symbol (e.g., `$` or `€`).                                                                                                    |
| `includeComma`              | `boolean`            | `false`      | Whether to include commas as thousand separators.                                                                                                                        |
| `animateIntermediateValues` | `boolean`            | `false`      | Whether to animate all intermediate numbers between the new value and the current value of a digit. Useful for rapidly changing values to prevent glitches in animation. |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
