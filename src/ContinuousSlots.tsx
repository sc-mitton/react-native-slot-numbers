import { useRef, useState, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ReAnimated from 'react-native-reanimated';
import { easeGradient } from 'react-native-easing-gradient';
import Animated, {
  LinearTransition,
  Easing as ReEasing,
} from 'react-native-reanimated';

import ContinuousSlot from './ContinuousSlot';
import styles from './styles';
import type { AnimatedNumbersProps, ContinuousSlotProps } from './types';
import {
  bezier_points,
  mass,
  damping,
  stiffness,
  defaultAnimationDuration,
} from './constants';

const AnimatedMaskedView = ReAnimated.createAnimatedComponent(MaskedView);

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
  const [firstRender, setFirstRender] = useState(true);
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

  useEffect(() => {
    setFirstRender(false);
  }, []);

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

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: 'transparent' },
      0.2: { color: 'black' },
      0.8: { color: 'black' },
      1: { color: 'transparent' },
    },
  });

  return (
    <>
      <AnimatedMaskedView
        layout={
          props.spring
            ? LinearTransition.springify()
                .mass(mass)
                .stiffness(stiffness)
                .damping(damping)
            : LinearTransition.duration(
                props.animationDuration || defaultAnimationDuration
              ).easing(ReEasing.bezier(...easing).factory())
        }
        maskElement={
          <LinearGradient
            locations={locations as any}
            colors={colors as any}
            style={[
              StyleSheet.absoluteFill,
              { width: Dimensions.get('window').width },
            ]}
          />
        }
        style={styles.continuousSlotsContainer}
      >
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
              hasPeriod={hasPeriod}
              hasComma={hasComma}
              firstRender={firstRender}
              key={`${idRef.current}-${slot[1]}`}
              fontStyle={props.fontStyle}
              easing={props.easing}
              spring={props.spring}
              animationDuration={
                props.animationDuration || defaultAnimationDuration
              }
            />
          );
        })}
      </AnimatedMaskedView>
    </>
  );
};

export default ContinuousSlots;
