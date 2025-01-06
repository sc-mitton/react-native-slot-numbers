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
  cancelAnimation,
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

  const y1 = useSharedValue(0);
  const y2 = useSharedValue(0);
  const period = useSharedValue(props.hasPeriod ? 0 : -1);
  const comma = useSharedValue(props.hasComma ? 0 : -1);
  const inProgress = useSharedValue(false);

  const [measuredHeight, setMeasuredHeight] = useState(0);
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

  const slotAnimation1 = useAnimatedStyle(() => ({
    transform: [{ translateY: y1.value }],
  }));

  const slotAnimation2 = useAnimatedStyle(() => ({
    transform: [{ translateY: y2.value }],
  }));

  useEffect(() => {
    const t = setTimeout(() => {
      setFirstRender(false);
    }, 0);
    return clearTimeout(t);
  }, []);

  useEffect(() => {
    if (measuredHeight === 0 || (y1.value === 0 && y2.value === 0)) return;

    if (inProgress.value) {
      cancelAnimation(y1);
      cancelAnimation(y2);
    }

    // - The wrapped component is the one where all of it's numbers are outside the window
    // - During a 'wrapping' animation, the wrapped component changes because one is sliding
    // entirely outside the window while the other previously wrapped component slides in.

    const targetY = -1 * (gap + measuredHeight) * (9 - props.slot[0]);
    const totalSlotHeight = (measuredHeight + gap) * 10;
    const wrappedComponent =
      y1.value <= 0 && y1.value >= -1 * totalSlotHeight ? 2 : 1;
    const currentVal =
      9 -
      Math.round(
        Math.abs(wrappedComponent === 2 ? y1.value : y2.value) /
          (measuredHeight + gap)
      );
    const animationWillWrap = Math.abs(currentVal - props.slot[0]) > 5;

    if (currentVal === props.slot[0]) return;

    const slideDirection = animationWillWrap // 1: up -1: down
      ? currentVal > 4
        ? -1
        : 1
      : props.slot[0] > currentVal
        ? -1
        : 1;
    // 1: wrapped component is above window, -1: is below
    const wrappedPosition =
      wrappedComponent === 1
        ? y1.value < y2.value
          ? 1
          : -1
        : y2.value < y1.value
          ? 1
          : -1;

    const targetWrappedComponentY = animationWillWrap
      ? slideDirection === 1
        ? targetY - totalSlotHeight
        : targetY + totalSlotHeight
      : wrappedPosition === 1
        ? targetY - totalSlotHeight
        : targetY + totalSlotHeight;

    const startY1 =
      wrappedComponent === 1 && animationWillWrap
        ? slideDirection === 1
          ? y2.value + totalSlotHeight
          : y2.value - totalSlotHeight
        : y1.value;
    const startY2 =
      wrappedComponent === 2 && animationWillWrap
        ? slideDirection === 1
          ? y1.value + totalSlotHeight
          : y1.value - totalSlotHeight
        : y2.value;

    let [finalY1, finalY2] = [0, 0];
    if (animationWillWrap) {
      finalY1 = wrappedComponent === 1 ? targetY : targetWrappedComponentY;
      finalY2 = wrappedComponent === 2 ? targetY : targetWrappedComponentY;
    } else {
      finalY1 = wrappedComponent === 1 ? targetWrappedComponentY : targetY;
      finalY2 = wrappedComponent === 2 ? targetWrappedComponentY : targetY;
    }

    y1.value = withSequence(
      withTiming(startY1, { duration: 0 }, () => (inProgress.value = true)),
      props.spring
        ? withSpring(finalY1, reSpringConfig, () => (inProgress.value = false))
        : withTiming(finalY1, config, () => (inProgress.value = false))
    );
    y2.value = withSequence(
      withTiming(startY2, { duration: 0 }, () => (inProgress.value = true)),
      props.spring
        ? withSpring(finalY2, reSpringConfig, () => (inProgress.value = false))
        : withTiming(finalY2, config, () => (inProgress.value = false))
    );
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
      style={[styles.slotContainer]}
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
      {measuredHeight ? (
        <>
          <ReAnimated.View layout={layoutAnimation}>
            <ReAnimated.View style={[slotAnimation1, { gap: gap }, styles.abs]}>
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
            <ReAnimated.View style={[slotAnimation2, { gap: gap }, styles.abs]}>
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
              const yValue =
                -1 * ((gap + ne.layout.height) * (9 - props.slot[0]));
              y1.value = yValue;
              y2.value = yValue + (ne.layout.height + gap) * 10;
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
