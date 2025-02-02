import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Animated, Text, View, Easing } from 'react-native';
import Reanimated, {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  useAnimatedStyle,
  Easing as ReEasing,
  ReduceMotion,
} from 'react-native-reanimated';

import styles from './styles';
import type { SlotProps } from './types';
import { bezier_points } from './constants';

const Slot = (props: SlotProps) => {
  const reEasing = ReEasing.bezier(...bezier_points[props.easing || 'linear']);
  const reSpringConfig = {
    mass: 1,
    damping: 20,
    stiffness: 170,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
    reduceMotion: ReduceMotion.System,
  };
  const easing = bezier_points[props.easing || 'linear'];
  const springConfig = {
    mass: 1,
    damping: 20,
    stiffness: 170,
    useNativeDriver: true,
    ...(typeof props.spring === 'object' ? props.spring : {}),
  };
  const timedConfig = {
    duration: props.animationDuration,
    useNativeDriver: true,
    easing: Easing.bezier(...easing),
  };
  const width = useSharedValue(props.slot[0].length === 1 ? -1 : 0);
  const yA = useRef(new Animated.Value(0)).current;
  const yB = useRef(new Animated.Value(0)).current;
  const commaScale = useSharedValue(0);
  const commaWidth = useSharedValue(0);
  const [valA, setValA] = useState<number | undefined>(
    props.slot[0][0] as number
  );
  const [valB, setValB] = useState<number>();

  // React to slot value changes
  useLayoutEffect(() => {
    if (!props.slot) return;

    const incomingValue = props.slot[0][1];
    const currentValue = props.slot[0][0];
    const shown = currentValue === valA ? 'A' : 'B';

    if (incomingValue === undefined) {
      if (props.charSizes[0]) width.value = props.charSizes[currentValue!]!;
      return;
    }

    // Removing slot
    if (incomingValue === null) {
      width.value = props.spring
        ? withSpring(0, {
            ...reSpringConfig,
            damping: reSpringConfig.damping + 12,
          })
        : withTiming(0, {
            duration: props.animationDuration / 2,
            easing: reEasing,
          });

      const animation = props.spring
        ? Animated.spring(shown === 'A' ? yA : yB, {
            toValue: -1 * props.height,
            ...springConfig,
          })
        : Animated.timing(shown === 'A' ? yA : yB, {
            toValue: -1 * props.height,
            ...timedConfig,
          });

      animation.start(() => props.onCompleted && props.onCompleted());
    }
    // Adding slot
    else if (currentValue === null) {
      setValA(incomingValue);
      width.value = props.spring
        ? withSpring(props.charSizes[incomingValue!]!, reSpringConfig)
        : withTiming(props.charSizes[incomingValue!]!, {
            duration: props.animationDuration / 2,
            easing: reEasing,
          });
      yB.setValue(-1 * props.height); // Set outside of view
      const sequence = [
        Animated.timing(yA, {
          toValue: -1 * props.height,
          duration: 0,
          useNativeDriver: true,
        }),
        props.spring
          ? Animated.spring(yA, { toValue: 0, ...springConfig })
          : Animated.timing(yA, { toValue: 0, ...timedConfig }),
      ];
      Animated.sequence(sequence).start(() => {
        props.onCompleted && props.onCompleted();
      });
    }
    // Animating slot
    else if (Number.isFinite(incomingValue) && Number.isFinite(currentValue)) {
      width.value = props.spring
        ? withSpring(props.charSizes[incomingValue!]!, {
            ...reSpringConfig,
            damping: reSpringConfig.damping + 12,
          })
        : withTiming(props.charSizes[incomingValue!]!, {
            duration: props.animationDuration / 2,
          });

      const finalY =
        incomingValue > currentValue ? props.height : -1 * props.height;
      Animated.timing(shown === 'A' ? yB : yA, {
        toValue: finalY,
        ...timedConfig,
        duration: 0,
      }).start(() => {
        shown === 'A' ? setValB(incomingValue) : setValA(incomingValue);
      });
    }
  }, [props.slot, props.charSizes]);

  useEffect(() => {
    if (typeof valA === 'number' && typeof valB === 'number') {
      const shown = props.slot[0][0] === valA ? 'A' : 'B';
      const shownValFinalY =
        valA > valB
          ? shown === 'A'
            ? props.height * -1
            : props.height
          : shown === 'A'
            ? props.height
            : props.height * -1;

      const outAnimation = props.spring
        ? Animated.spring(shown === 'A' ? yA : yB, {
            toValue: shownValFinalY,
            ...springConfig,
          })
        : Animated.timing(shown === 'A' ? yA : yB, {
            toValue: shownValFinalY,
            ...timedConfig,
          });
      outAnimation.start();

      const sequence = [
        Animated.timing(shown === 'A' ? yB : yA, {
          toValue: shownValFinalY * -1,
          duration: 0,
          useNativeDriver: true,
        }),
        props.spring
          ? Animated.spring(shown === 'A' ? yB : yA, {
              toValue: 0,
              ...springConfig,
            })
          : Animated.timing(shown === 'A' ? yB : yA, {
              toValue: 0,
              ...timedConfig,
            }),
      ];
      Animated.sequence(sequence).start(() => {
        shown === 'A' ? setValA(undefined) : setValB(undefined);
        props.onCompleted && props.onCompleted();
      });
    }
  }, [valA, valB]);

  useLayoutEffect(() => {
    let timeout: NodeJS.Timeout;
    if (props.commaPositions?.[props.index] === 1) {
      commaScale.value = props.spring
        ? withSpring(1, reSpringConfig)
        : withTiming(1, {
            duration: props.animationDuration,
            easing: reEasing,
          });
      commaWidth.value = withSequence(
        withTiming(0, { duration: 0 }),
        props.spring
          ? withSpring(props.commaWidth, reSpringConfig)
          : withTiming(props.commaWidth, {
              duration: props.animationDuration,
              easing: reEasing,
            })
      );
    } else if (props.commaPositions?.[props.index] === -1) {
      commaScale.value = withSequence(
        withTiming(1, { duration: 0 }),
        props.spring
          ? withSpring(0, reSpringConfig)
          : withTiming(0, {
              duration: props.animationDuration,
              easing: reEasing,
            })
      );
      timeout = setTimeout(() => {
        commaWidth.value = props.spring
          ? withSpring(0, {
              ...reSpringConfig,
              damping: reSpringConfig.damping + 12,
            })
          : withTiming(0, {
              duration: props.animationDuration,
              easing: reEasing,
            });
      }, 0);
    } else if (props.commaPositions?.[props.index] === 0) {
      commaScale.value = 1;
      commaWidth.value = props.commaWidth;
    } else {
      commaScale.value = 0;
      commaWidth.value = 0;
    }
    return () => clearTimeout(timeout);
  }, [props.commaPositions, props.commaWidth]);

  const commaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commaScale.value }],
    width: commaWidth.value,
  }));

  const widthAnimation = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <View style={styles.slotContainer}>
      <Animated.View
        style={{
          transform: [
            { translateY: yA },
            {
              scale: yA.interpolate({
                inputRange: [-1 * props.height, 0, props.height],
                outputRange: [0.25, 1, 0.25],
              }),
            },
          ],
          opacity: yA.interpolate({
            inputRange: [(-1 * props.height) / 2, 0, (1 * props.height) / 2],
            outputRange: [0, 1, 0],
          }),
        }}
      >
        <Reanimated.View style={widthAnimation}>
          <Animated.Text
            style={[
              props.fontStyle,
              {
                transform: [
                  {
                    rotateX: yA.interpolate({
                      inputRange: [
                        (-1 * props.height) / 2,
                        0,
                        props.height / 2,
                      ],
                      outputRange: ['45deg', '0deg', '-45deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {valA}
          </Animated.Text>
        </Reanimated.View>
      </Animated.View>
      <Animated.View
        style={[
          {
            transform: [
              { translateY: yB },
              {
                scale: yB.interpolate({
                  inputRange: [-1 * props.height, 0, props.height],
                  outputRange: [0.25, 1, 0.25],
                }),
              },
            ],
            opacity: yB.interpolate({
              inputRange: [(-1 * props.height) / 2, 0, (1 * props.height) / 2],
              outputRange: [0, 1, 0],
            }),
          },
          styles.abs,
        ]}
      >
        <Animated.Text
          style={[
            props.fontStyle,
            {
              transform: [
                {
                  rotateX: yB.interpolate({
                    inputRange: [(-1 * props.height) / 2, 0, props.height / 2],
                    outputRange: ['45deg', '0deg', '-45deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {valB}
        </Animated.Text>
      </Animated.View>
      <Reanimated.View style={commaStyle}>
        <Text style={props.fontStyle}>,</Text>
      </Reanimated.View>
    </View>
  );
};

export default Slot;
