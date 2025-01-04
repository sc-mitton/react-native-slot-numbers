import { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
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
  withSequence,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import styles from './styles';
import type { ContinuousSlotProps } from './types';
import { bezier_points, mass, damping, stiffness } from './constants';

const GAP = 8;
const PADDING_FRACTION = 0.25;

const AnimatedMaskView = ReAnimated.createAnimatedComponent(MaskedView);

const ContinuousSlot = (props: ContinuousSlotProps) => {
  const easing = bezier_points[props.easing || 'linear'] as [
    number,
    number,
    number,
    number,
  ];
  const reSpringConfig = {
    mass,
    damping,
    stiffness,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    reduceMotion: ReduceMotion.System,
    ...(typeof props.spring === 'object' ? props.spring : {}),
  };
  const extraDampedConfig = {
    ...reSpringConfig,
    damping: reSpringConfig.damping + 12,
  };
  const config = {
    duration: props.animationDuration,
    easing: ReEasing.bezier(...easing),
  };

  const id = useRef(
    `rn-slottext-slot-${Math.random().toString(36).slice(0, 9)}`
  );
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const y = useSharedValue(0);
  const period = useSharedValue(props.hasPeriod ? 0 : -1);
  const comma = useSharedValue(props.hasComma ? 0 : -1);
  const maskTop = useSharedValue(0);

  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const maskAnimation = useAnimatedStyle(() => ({
    top: maskTop.value,
    bottom: maskTop.value,
  }));

  const slotContainerAnimation = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
  }));

  const commaAnimation = useAnimatedStyle(() => {
    const fullWidth = props.charSizes[10] || 0;
    return {
      opacity: interpolate(comma.value, [-1, 0, 1], [0, 1, 0]),
      transform: [
        {
          scale: interpolate(comma.value, [-1, 0, 1], [0, 1, 0]),
        },
        {
          translateY: interpolate(
            comma.value,
            [-1, 0, 1],
            [-0.3 * measuredHeight, 0, 0.7 * measuredHeight]
          ),
        },
      ],
      width: fullWidth
        ? interpolate(comma.value, [-1, 0, 1], [0, fullWidth, 0])
        : comma.value === 0
          ? 'auto'
          : 0,
    };
  });

  const periodAnimtion = useAnimatedStyle(() => {
    const fullWidth = props.charSizes[11] || 0;
    return {
      opacity: interpolate(period.value, [-1, 0, 1], [0, 1, 0]),
      transform: [
        {
          scale: interpolate(period.value, [-1, 0, 1], [0, 1, 0]),
        },
        {
          translateY: interpolate(
            period.value,
            [-1, 0, 1],
            [-0.3 * measuredHeight, 0, 0.7 * measuredHeight]
          ),
        },
      ],
      width: fullWidth
        ? interpolate(period.value, [-1, 0, 1], [0, fullWidth, 0])
        : period.value === 0
          ? 'auto'
          : 0,
    };
  });

  const slotAnimation = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    gap: GAP,
  }));

  useEffect(() => {
    const t = setTimeout(() => {
      setFirstRender(false);
    }, 0);
    return clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isMeasured) return;

    const newWidth = props.charSizes[props.slot[0]]!;

    width.value =
      newWidth > width.value
        ? newWidth // Growing
        : props.spring
          ? withSpring(newWidth, {
              ...reSpringConfig,
              damping: 27,
              stiffness: 315,
            })
          : withTiming(newWidth, { duration: props.animationDuration });

    const finalY =
      -1 *
      ((GAP + measuredHeight) * (9 - props.slot[0]) -
        PADDING_FRACTION * measuredHeight);
    y.value = props.spring
      ? withSpring(finalY, reSpringConfig)
      : withTiming(finalY, config);
  }, [props.slot]);

  useEffect(() => {
    if (!props.charSizes[11]) return;
    if (props.hasPeriod) {
      period.value = withSequence(
        withTiming(-1, { duration: 0 }),
        props.spring ? withSpring(0, extraDampedConfig) : withTiming(0, config)
      );
    } else if (period.value === 0) {
      period.value = props.spring
        ? withSpring(1, extraDampedConfig)
        : withTiming(1, config);
    }
  }, [props.hasPeriod]);

  useEffect(() => {
    if (!props.charSizes[10]) return;
    if (props.hasComma) {
      comma.value = withSequence(
        withTiming(-1, { duration: 0 }),
        props.spring ? withSpring(0, extraDampedConfig) : withTiming(0, config)
      );
    } else if (comma.value === 0) {
      comma.value = props.spring
        ? withSpring(1, extraDampedConfig)
        : withTiming(1, config);
    }
  }, [props.hasComma]);

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
      style={styles.slotContainer}
      layout={
        firstRender
          ? props.spring
            ? LinearTransition.springify()
                .mass(mass)
                .stiffness(stiffness)
                .damping(damping)
            : LinearTransition.duration(props.animationDuration / 4).easing(
                ReEasing.bezier(...easing).factory()
              )
          : undefined
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
        <>
          <ReAnimated.View style={slotContainerAnimation}>
            <AnimatedMaskView
              maskElement={
                <LinearGradient
                  locations={locations as any}
                  colors={colors as any}
                  style={StyleSheet.absoluteFill}
                />
              }
              style={[styles.mask, maskAnimation]}
            >
              <ReAnimated.View style={[slotAnimation, styles.abs]}>
                {Array.from(
                  { length: 10 },
                  (_, i) => (9 - i) as string | number
                ).map((i) => (
                  <Text
                    style={[props.fontStyle, { height: measuredHeight }]}
                    key={`${id}-${i}`}
                  >
                    {i}
                  </Text>
                ))}
              </ReAnimated.View>
            </AnimatedMaskView>
          </ReAnimated.View>
          <ReAnimated.View style={[commaAnimation]}>
            <Text style={props.fontStyle}>,</Text>
          </ReAnimated.View>
          <ReAnimated.View style={[periodAnimtion]}>
            <Text style={props.fontStyle}>.</Text>
          </ReAnimated.View>
        </>
      ) : (
        <>
          <Text
            style={props.fontStyle}
            onLayout={({ nativeEvent: ne }) => {
              width.value = ne.layout.width;
              height.value = ne.layout.height;
              maskTop.value = -1 * (PADDING_FRACTION * ne.layout.height);

              setMeasuredHeight(ne.layout.height);
              if (typeof props.slot[0] === 'number') {
                y.value =
                  -1 *
                  ((GAP + ne.layout.height) * (9 - props.slot[0]) -
                    PADDING_FRACTION * ne.layout.height);
              }

              setIsMeasured(true);
            }}
          >
            {props.slot[0]}
          </Text>
          {props.hasComma && <Text style={props.fontStyle}>,</Text>}
          {props.hasPeriod && <Text style={props.fontStyle}>.</Text>}
        </>
      )}
    </ReAnimated.View>
  );
};

export default ContinuousSlot;
