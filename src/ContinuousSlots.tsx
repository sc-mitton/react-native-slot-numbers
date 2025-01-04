import { useRef, useState, Fragment, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  LinearTransition,
  Easing as ReEasing,
} from 'react-native-reanimated';

import ContinuousSlot from './ContinuousSlot';
import styles from './styles';
import type { AnimatedNumbersProps, ContinuousSlotProps } from './types';
import { bezier_points, mass, damping, stiffness } from './constants';

const DEFAULT_DURATION = 700;

const ContinuousSlots = (props: AnimatedNumbersProps) => {
  const easing = bezier_points[props.easing || 'linear'] as [
    number,
    number,
    number,
    number,
  ];
  const idRef = useRef(
    `rn-continuous-slot-${Math.random().toString(36).substring(7)}`
  );
  // [value, key]
  const [slots, setSlots] = useState(
    props.value
      .toString()
      .split('')
      .map(
        (v) =>
          [
            parseInt(v),
            Math.random().toString(36).slice(0, 9),
          ] as ContinuousSlotProps['slot']
      )
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
    const newSplitValue = props.value.toString().split('');

    const parser = Array.from({ length: newSplitValue.length }, (_, i) =>
      parseFromLeft ? i : newSplitValue.length - i - 1
    );
    const newSlots = parser.map((index) => {
      const slotValue = Number.isFinite(parseInt(newSplitValue[index]!, 10))
        ? parseInt(newSplitValue[index]!, 10)
        : newSplitValue[index];

      const parseIndex = parseFromLeft
        ? index
        : index + (slots.length - newSplitValue.length);

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
          <Animated.Text
            style={props.fontStyle}
            layout={
              props.animationDuration
                ? LinearTransition.duration(props.animationDuration / 4).easing(
                    ReEasing.bezier(...easing).factory()
                  )
                : LinearTransition.springify()
                    .mass(mass)
                    .stiffness(stiffness)
                    .damping(damping)
            }
          >
            {props.prefix}
          </Animated.Text>
        )}
        {/* Spacer Text to make sure container height sizes right */}
        {slots.map((slot, i) => {
          const hasComma = props.includeComma
            ? (slots.length - (props.precision || 0) - 1 - i) % 3 === 0 &&
              i !== slots.length - (props.precision || 0) - 1
            : false;

          const hasPeriod =
            props.precision && props.precision > 0
              ? i === slots.length - props.precision - 1
              : false;

          return (
            <ContinuousSlot
              slot={slot}
              index={i}
              charSizes={charSizes}
              hasPeriod={hasPeriod}
              hasComma={hasComma}
              key={`${idRef.current}-${slot[1]}`}
              fontStyle={props.fontStyle}
              easing={props.easing}
              spring={props.spring}
              animationDuration={DEFAULT_DURATION}
            />
          );
        })}
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
