import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
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

import styles from './styles';
import type { ContinuousSlotProps } from './types';
import { bezier_points, mass, damping, stiffness, gap } from './constants';

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

  const y = useSharedValue(0);
  const period = useSharedValue(props.hasPeriod ? 0 : -1);
  const comma = useSharedValue(props.hasComma ? 0 : -1);

  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const layoutAnimation = props.spring
    ? LinearTransition.springify()
        .mass(mass)
        .stiffness(stiffness)
        .damping(damping)
    : LinearTransition.duration(props.animationDuration / 1.5).easing(
        ReEasing.bezier(...easing).factory()
      );

  const commaAnimation = useAnimatedStyle(() => {
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
            [-0.3 * measuredHeight, 0, 0.3 * measuredHeight]
          ),
        },
      ],
    };
  });

  const periodAnimation = useAnimatedStyle(() => {
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
            [-0.3 * measuredHeight, 0, 0.3 * measuredHeight]
          ),
        },
      ],
    };
  });

  const slotAnimation = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  useEffect(() => {
    const t = setTimeout(() => {
      setFirstRender(false);
    }, 0);
    return clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isMeasured) return;

    const finalY = -1 * (gap + measuredHeight) * (9 - props.slot[0]);
    y.value = props.spring
      ? withSpring(finalY, reSpringConfig)
      : withTiming(finalY, config, () => {
          y.value = finalY;
        });
  }, [props.slot]);

  useEffect(() => {
    if (props.firstRender) return;
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
    if (props.firstRender) return;
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

  return (
    <ReAnimated.View
      style={[styles.continuousSlotContainer]}
      layout={firstRender ? layoutAnimation : undefined}
      entering={
        props.firstRender
          ? undefined
          : props.spring
            ? FadeInUp.springify()
                .mass(reSpringConfig.mass)
                .stiffness(reSpringConfig.stiffness)
                .damping(reSpringConfig.damping)
            : FadeInUp.duration(props.animationDuration / 1.5).easing(
                ReEasing.bezier(...easing).factory()
              )
      }
      exiting={
        props.firstRender
          ? undefined
          : props.spring
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
          <ReAnimated.View layout={layoutAnimation}>
            <ReAnimated.View style={[slotAnimation, { gap: gap }, styles.abs]}>
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
            <ReAnimated.Text style={[props.fontStyle, styles.hiddenSpacer]}>
              {props.slot[0]}
            </ReAnimated.Text>
          </ReAnimated.View>
          <ReAnimated.View layout={layoutAnimation}>
            <ReAnimated.Text
              style={[commaAnimation, styles.abs, props.fontStyle]}
            >
              ,
            </ReAnimated.Text>
            {props.hasComma && (
              <Text style={[props.fontStyle, styles.hiddenSpacer]}>,</Text>
            )}
          </ReAnimated.View>
          <ReAnimated.View layout={layoutAnimation}>
            <ReAnimated.Text
              style={[periodAnimation, styles.abs, props.fontStyle]}
            >
              .
            </ReAnimated.Text>
            {props.hasPeriod && (
              <Text style={[props.fontStyle, styles.hiddenSpacer]}>.</Text>
            )}
          </ReAnimated.View>
        </>
      ) : (
        <>
          <Text
            style={props.fontStyle}
            onLayout={({ nativeEvent: ne }) => {
              setMeasuredHeight(ne.layout.height);
              y.value = -1 * ((gap + ne.layout.height) * (9 - props.slot[0]));
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
