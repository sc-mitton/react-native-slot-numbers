import { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  useAnimatedValue,
  Easing,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { easeGradient } from 'react-native-easing-gradient';
import ReAnimated, {
  LinearTransition,
  FadeOutDown,
  FadeInUp,
  useSharedValue,
  withTiming,
  Easing as ReEasing,
  ReduceMotion,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import styles from './styles';
import type { ContinuousSlotProps } from './types';
import { bezier_points } from './constants';

const GAP = 12;
const PADDING_FRACTION = 0.25;

const AnimatedMaskView = Animated.createAnimatedComponent(MaskedView);

const ContinuousSlot = (props: ContinuousSlotProps) => {
  const easing = bezier_points[props.easing || 'linear'] as [
    number,
    number,
    number,
    number,
  ];
  const springConfig = {
    mass: 1,
    damping: 20,
    stiffness: 170,
    useNativeDriver: true,
    ...(typeof props.spring === 'object' ? props.spring : {}),
  };
  const reSpringConfig = {
    mass: 1,
    damping: 27,
    stiffness: 315,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    reduceMotion: ReduceMotion.System,
    ...(typeof props.spring === 'object' ? props.spring : {}),
  };
  const config = {
    useNativeDriver: true,
    duration: props.animationDuration,
    easing: Easing.bezier(...easing),
  };

  const id = useRef(
    `rn-slottext-slot-${Math.random().toString(36).slice(0, 9)}`
  );
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const y = useAnimatedValue(0);
  const slotOpacity = useAnimatedValue(0);
  const periodY = useAnimatedValue(0);
  const commaY = useAnimatedValue(0);
  const periodOpacity = useAnimatedValue(0);
  const commaOpacity = useAnimatedValue(0);
  const maskTop = useAnimatedValue(0);

  const measuredHeight = useRef(0);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    if (!isMeasured) return;

    const newWidth =
      props.charSizes[
        typeof props.slot[0] === 'number'
          ? props.slot[0]
          : props.slot[0] === ','
            ? 10
            : 11
      ]!;

    width.value =
      newWidth > width.value
        ? newWidth // Growing
        : props.spring
          ? withSpring(newWidth, reSpringConfig)
          : withTiming(newWidth, { duration: props.animationDuration });

    if (typeof props.slot[0] === 'number') {
      const finalY =
        -1 *
        ((GAP + measuredHeight.current) * (9 - props.slot[0]) -
          PADDING_FRACTION * measuredHeight.current);
      if (props.spring) {
        Animated.spring(slotOpacity, { toValue: 1, ...springConfig }).start();
        Animated.spring(y, { toValue: finalY, ...springConfig }).start();
        Animated.spring(commaY, { toValue: 0, ...springConfig }).start();
        Animated.spring(periodY, { toValue: 0, ...springConfig }).start();
        Animated.spring(commaOpacity, { toValue: 0, ...springConfig }).start();
        Animated.spring(periodOpacity, { toValue: 0, ...springConfig }).start();
      } else {
        Animated.timing(slotOpacity, { toValue: 1, ...config }).start();
        Animated.timing(y, { toValue: finalY, ...config }).start();
        Animated.timing(commaY, { toValue: 0, ...config }).start();
        Animated.timing(periodY, { toValue: 0, ...config }).start();
        Animated.timing(commaOpacity, { toValue: 0, ...config }).start();
        Animated.timing(periodOpacity, { toValue: 0, ...config }).start();
      }
    } else if (props.slot[0] === '.') {
      if (props.spring) {
        Animated.spring(periodY, {
          toValue: PADDING_FRACTION * measuredHeight.current,
          ...springConfig,
        }).start();
        Animated.spring(periodOpacity, { toValue: 1, ...springConfig }).start();
        Animated.spring(slotOpacity, { toValue: 0, ...springConfig }).start();
        Animated.spring(commaY, { toValue: 0, ...springConfig }).start();
      } else {
        Animated.timing(periodY, {
          toValue: PADDING_FRACTION * measuredHeight.current,
          ...config,
        }).start();
        Animated.timing(periodOpacity, { toValue: 1, ...config }).start();
        Animated.timing(slotOpacity, { toValue: 0, ...config }).start();
        Animated.timing(commaY, { toValue: 0, ...config }).start();
      }
    } else if (props.slot[0] === ',') {
      if (props.spring) {
        Animated.spring(commaY, {
          toValue: PADDING_FRACTION * measuredHeight.current,
          ...springConfig,
        }).start();
        Animated.spring(commaOpacity, { toValue: 1, ...springConfig }).start();
        Animated.spring(periodY, { toValue: 1, ...springConfig }).start();
        Animated.spring(slotOpacity, { toValue: 0, ...springConfig }).start();
      } else {
        Animated.timing(commaY, {
          toValue: PADDING_FRACTION * measuredHeight.current,
          ...config,
        }).start();
        Animated.timing(commaOpacity, { toValue: 1, ...config }).start();
        Animated.timing(periodY, { toValue: 1, ...config }).start();
        Animated.timing(slotOpacity, { toValue: 0, ...config }).start();
      }
    }
  }, [props.slot]);

  // LINEAR GRADIENT
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: 'transparent' },
      0.2: { color: 'black' },
      0.8: { color: 'black' },
      1: { color: 'transparent' },
    },
  });

  return (
    <ReAnimated.View
      layout={
        props.spring
          ? LinearTransition.springify()
              .mass(reSpringConfig.mass)
              .stiffness(reSpringConfig.stiffness)
              .damping(reSpringConfig.damping)
          : LinearTransition.duration(props.animationDuration).easing(
              ReEasing.bezier(...easing).factory()
            )
      }
      entering={
        props.charSizes[0]
          ? props.spring
            ? FadeInUp.springify()
                .mass(reSpringConfig.mass)
                .stiffness(reSpringConfig.stiffness)
                .damping(reSpringConfig.damping)
            : FadeInUp.duration(props.animationDuration / 1.5).easing(
                ReEasing.bezier(...easing).factory()
              )
          : undefined
      }
      exiting={
        props.spring
          ? FadeOutDown.springify()
              .mass(reSpringConfig.mass)
              .stiffness(reSpringConfig.stiffness)
              .damping(reSpringConfig.damping)
          : FadeOutDown.duration(props.animationDuration / 1.5).easing(
              ReEasing.bezier(...easing).factory()
            )
      }
    >
      {isMeasured ? (
        <ReAnimated.View style={{ height, width }}>
          <AnimatedMaskView
            maskElement={
              <LinearGradient
                locations={locations as any}
                colors={colors as any}
                style={StyleSheet.absoluteFill}
              />
            }
            style={[styles.mask, { top: maskTop, bottom: maskTop }]}
          >
            <Animated.View
              style={[
                {
                  opacity: slotOpacity,
                  gap: GAP,
                  transform: [{ translateY: y }],
                },
                styles.abs,
              ]}
            >
              {Array.from({ length: 10 }, (_, i) => (9 - i) as string | number)
                .concat([',', '.'])
                .map((i) => (
                  <Text style={props.fontStyle} key={`${id}-${i}`}>
                    {i}
                  </Text>
                ))}
            </Animated.View>
            <Animated.View
              style={[
                {
                  opacity: commaOpacity,
                  transform: [{ translateY: commaY }],
                },
                styles.abs,
              ]}
            >
              <Text style={props.fontStyle}>,</Text>
            </Animated.View>
            <Animated.View
              style={[
                {
                  opacity: periodOpacity,
                  transform: [{ translateY: periodY }],
                },
                styles.abs,
              ]}
            >
              <Text style={props.fontStyle}>.</Text>
            </Animated.View>
          </AnimatedMaskView>
        </ReAnimated.View>
      ) : (
        <Text
          style={props.fontStyle}
          onLayout={({ nativeEvent: ne }) => {
            width.value = ne.layout.width;
            height.value = ne.layout.height;
            maskTop.setValue(-1 * (PADDING_FRACTION * ne.layout.height));
            measuredHeight.current = ne.layout.height;
            if (typeof props.slot[0] === 'number') {
              y.setValue(
                -1 *
                  ((GAP + ne.layout.height) * (9 - props.slot[0]) -
                    PADDING_FRACTION * ne.layout.height)
              );
              slotOpacity.setValue(1);
            } else if (props.slot[0] === ',') {
              commaY.setValue(PADDING_FRACTION * ne.layout.height);
              commaOpacity.setValue(1);
            } else if (props.slot[0] === '.') {
              periodY.setValue(PADDING_FRACTION * ne.layout.height);
              periodOpacity.setValue(1);
            }
            setIsMeasured(true);
          }}
        >
          {props.slot[0]}
        </Text>
      )}
    </ReAnimated.View>
  );
};

export default ContinuousSlot;
