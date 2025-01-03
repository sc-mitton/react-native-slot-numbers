import { useRef, useState, Fragment, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import ContinuousSlot from './ContinuousSlot';
import styles from './styles';
import type { AnimatedNumbersProps, ContinuousSlotProps } from './types';

const DEFAULT_DURATION = 700;

const ContinuousSlots = (props: AnimatedNumbersProps) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: props.precision || 0,
    maximumFractionDigits: props.precision || 0,
  });

  const idRef = useRef(
    `rn-continuous-slot-${Math.random().toString(36).substring(7)}`
  );
  // [value, key]
  const [slots, setSlots] = useState(
    formatter
      .format(props.value)
      .split('')
      .map((v) => {
        const slotValue = Number.isFinite(parseInt(v, 10))
          ? parseInt(v, 10)
          : v;
        return [
          slotValue,
          Math.random().toString(36).slice(0, 9),
        ] as ContinuousSlotProps['slot'];
      })
  );
  const [charSizes, setCharSizes] = useState<number[]>(
    Array.from({ length: 10 }).map(() => 0)
  );
  const [sizesMeasured, setSizesMeasured] = useState(false);

  useEffect(() => {
    // Left parsing
    // _ _ _ _ _ _ new val
    // _ _ _       old val
    // Right parsing
    //       _ _ _ new val
    // _ _ _ _ _ _ old val
    const parseFromLeft =
      slots[0]?.[0] === parseInt(props.value.toString()[0]!, 10);
    const formatted = props.includeComma
      ? formatter.format(props.value).split('')
      : `${props.value}`.split('');

    const parser = Array.from({ length: formatted.length }, (_, i) =>
      parseFromLeft ? i : formatted.length - i - 1
    );
    const newSlots = parser.map((index) => {
      const slotValue = Number.isFinite(parseInt(formatted[index]!, 10))
        ? parseInt(formatted[index]!, 10)
        : formatted[index];

      const parseIndex = parseFromLeft
        ? index
        : index + (slots.length - formatted.length);

      const slot =
        slots[parseIndex] === undefined
          ? [slotValue, Math.random().toString(36).slice(0, 9)]
          : [slotValue, slots[parseIndex][1]];

      return slot as ContinuousSlotProps['slot'];
    });

    setSlots(parseFromLeft ? newSlots : newSlots.reverse());
  }, [props.value]);

  return (
    <>
      <View style={styles.slotsContainer}>
        {props.prefix && (
          <Animated.Text style={props.fontStyle} layout={LinearTransition}>
            {props.prefix}
          </Animated.Text>
        )}
        {/* Spacer Text to make sure container height sizes right */}
        {slots.map((slot, i) => (
          <ContinuousSlot
            slot={slot}
            index={i}
            charSizes={charSizes}
            key={`${idRef.current}-${slot[1]}`}
            fontStyle={props.fontStyle}
            easing={props.easing}
            spring={props.spring}
            animationDuration={DEFAULT_DURATION}
          />
        ))}
        <Text style={[styles.spacer, props.fontStyle]}>1</Text>
      </View>
      {!sizesMeasured &&
        Array.from({ length: 10 }, (_, i) => i as string | number)
          .concat([',', '.'])
          .map((char, i) => (
            <Fragment key={`rn-slots-measure-slot-${i}`}>
              <Text
                style={[styles.hiddenSlot, props.fontStyle]}
                onLayout={(e) => {
                  const charSize = e.nativeEvent.layout.width;
                  setCharSizes((prev) => {
                    const newSizes = [...prev];
                    newSizes[i] = charSize;
                    return newSizes;
                  });
                  if (char === '.') {
                    setSizesMeasured(true);
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

export default ContinuousSlots;
