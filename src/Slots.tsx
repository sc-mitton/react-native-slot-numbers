import {
  useState,
  useLayoutEffect,
  useCallback,
  Fragment,
  useRef,
} from 'react';
import { View, Text } from 'react-native';

import styles from './styles';
import type { AnimatedNumbersProps, SlotValue, CommaPosition } from './types';
import { getNewSlotValues, getNewCommaPositions } from './helpers';
import Slot from './Slot';

const DEFAULT_DURATION = 500;

const Slots = (props: AnimatedNumbersProps) => {
  const idRef = useRef(`slots-${Math.random().toString(36).substring(7)}`);

  const [slots, setSlots] = useState<SlotValue[]>([]);
  const [commaPositions, setCommaPositions] = useState<CommaPosition[]>([]);
  const [commaWidth, setCommaWidth] = useState(0);
  const [periodWidth, setPeriodWidth] = useState(0);
  const [sizesMeasured, setSizesMeasured] = useState(false);
  const [slotHeight, setSlotHeight] = useState(0);
  const [charSizes, setCharSizes] = useState<number[]>(
    Array.from({ length: 10 }).map(() => 0)
  );

  useLayoutEffect(() => {
    const stringValue = props.value.toString().replace('.', '');
    if (props.animateIntermediateValues) return;
    const parseFromLeft = stringValue[0] === slots[0]?.[0]?.toString();
    if (props.includeComma) {
      const newCommaPositions = getNewCommaPositions(
        stringValue,
        commaPositions,
        parseFromLeft,
        props.precision
      );
      setCommaPositions(newCommaPositions);
    }
    const newSlotValues = getNewSlotValues(stringValue, slots, parseFromLeft);
    setSlots((prev) =>
      newSlotValues.map((v, i) => {
        const shift = parseFromLeft
          ? 0
          : Math.max(newSlotValues.length - prev.length, 0);

        // When adding slots, they will need a new key, otherwise
        // mantain the same slot key. Also if this is the first run through
        // and the slots are empty, the keys will need to be set.
        const key =
          v[0] === null || prev.length === 0
            ? Math.random().toString(36).slice(0, 9)
            : prev[i - shift]![1] || Math.random().toString(36).slice(0, 9);
        return [v, key];
      })
    );
  }, [props.value]);

  const onCompleted = useCallback(() => {
    const cleanedSlots = slots
      .filter(
        (s) =>
          (Number.isFinite(s[0][0]) && s[0][1] !== null) ||
          Number.isFinite(s[0][1])
      )
      .map((s) =>
        Number.isFinite(s[0][1])
          ? ([[s[0][1]], s[1]] as SlotValue)
          : ([[s[0][0]], s[1]] as SlotValue)
      );

    const numberOfSlotsRemoved = Math.max(
      slots.length - cleanedSlots.length,
      0
    );
    const cleanedCommas = commaPositions
      .map((c) => (c === -1 ? null : c === 1 ? 0 : c))
      .slice(slots[0]?.[0][1] === null ? numberOfSlotsRemoved : 0) // Trim from left
      .slice(
        0,
        slots[slots.length - 1]?.[0][1] === null
          ? -1 * numberOfSlotsRemoved
          : undefined
      ); // Trim from right

    setSlots(cleanedSlots);
    setCommaPositions(cleanedCommas);
  }, [slots, commaPositions]);

  return (
    <>
      <View style={styles.slotsContainer}>
        {props.prefix && <Text style={props.fontStyle}>{props.prefix}</Text>}
        {/* Spacer Text to make sure container height sizes right */}
        <Text style={[styles.spacer, props.fontStyle]}>1</Text>
        {slots.map((slot, i) => {
          const callback =
            i === slots.findIndex((s) => s[0].length > 1)
              ? onCompleted
              : undefined;
          return (
            <Fragment key={`${idRef.current}-${slot[1]}`}>
              <Slot
                slot={slot}
                index={i}
                height={slotHeight}
                charSizes={charSizes}
                commaWidth={commaWidth}
                periodWidth={periodWidth}
                onCompleted={callback}
                easing={props.easing}
                fontStyle={props.fontStyle}
                animationDuration={props.animationDuration || DEFAULT_DURATION}
                spring={props.spring}
                commaPositions={
                  props.includeComma && commaPositions.length
                    ? commaPositions
                    : undefined
                }
              />
              {(props.precision || 0) > 0 &&
                props.precision === slots.length - 1 - i && (
                  <Text style={props.fontStyle}>.</Text>
                )}
            </Fragment>
          );
        })}
      </View>
      {!sizesMeasured &&
        Array.from({ length: 10 }, (_, i) => i as string | number)
          .concat([',', '.'])
          .map((char, i) => (
            <Fragment key={`measure-slot-${i}`}>
              <Text
                key={`slot-${i}`}
                style={[styles.measureSlot, props.fontStyle]}
                onLayout={(e) => {
                  if (i === 10) {
                    setSlotHeight(e.nativeEvent.layout.height);
                    setCommaWidth(e.nativeEvent.layout.width);
                  } else if (i === 11) {
                    setPeriodWidth(e.nativeEvent.layout.width);
                    setSizesMeasured(true);
                  } else {
                    const charSize = e.nativeEvent.layout.width;
                    setCharSizes((prev) => {
                      const newSizes = [...prev];
                      newSizes[i] = charSize;
                      return newSizes;
                    });
                  }
                }}
              >
                {char}
              </Text>
            </Fragment>
          ))}
    </>
  );
};

export default Slots;
