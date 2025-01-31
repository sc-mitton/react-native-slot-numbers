import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Dimensions,
  // TouchableOpacity,
  // Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import SlotNumbers from 'react-native-slot-numbers';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
// import Entypo from '@expo/vector-icons/Entypo';

import OpenRundeSemibold from '../assets/fonts/OpenRunde-Semibold.otf';

const PADDING = 32;
const MIN_SLIDER_VALUE = 0;
const BAR_HEIGHT = Dimensions.get('screen').height - PADDING * 3;

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const blue = 'hsl(221, 95%, 62%)';

// const backgroundColor = 'hsl(0, 0%, 0%)';
// const gradientColors = [`rgba(0, 0, 0, 0)`, blue] as any;
// const iconBackground = 'hsl(0, 0%, 10%)';
// const iconColor = 'hsl(0, 0%, 50%)';

const backgroundColor = 'hsl(0, 0%, 100%)';
const gradientColors = [`rgba(255, 255, 255, 0)`, blue] as any;
const iconBackground = 'hsl(0, 0%, 20%)';
const iconColor = 'hsl(0, 0%, 100%)';

const tests = [
  35420, 15770, 298, 321, 45433, 51369, 69809, 73533, 668678, 194, 130933,
  829769,
  // 807919, 8079190,
];

export default function App() {
  const [fontsGood, setFontsGood] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [value, setValue] = useState<number>(MIN_SLIDER_VALUE);

  const [fontsLoaded, fontError] = useFonts({
    'OpenRunde-Semibold': OpenRundeSemibold,
  });

  useEffect(() => {
    if (fontsLoaded && !fontError) {
      setFontsGood(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (testIndex === tests.length - 1) return;
    const timeout = setTimeout(() => {
      setTestIndex((testIndex + 1) % tests.length);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [testIndex]);

  useEffect(() => {
    setValue(tests[testIndex]!);
  }, [testIndex]);

  if (!fontsGood) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.background}
        colors={gradientColors}
        start={[0, 0]}
        end={[0, 1]}
      />
      <StatusBar style="light" />
      <View style={styles.textContainer}>
        <View style={styles.text}>
          <SlotNumbers
            value={
              value
              // 35420
              // 15770
              // 298
              // 321
              // 45433
              // 51369
              // 69809
              // 73533
              // 668678
              // 194
              // 130933
              // 829769
            }
            prefix="$"
            fontStyle={styles.fontStyle}
            includeComma={true}
            // animationDuration={1000}
            animateIntermediateValues
            // easing="in-out"
            spring
            // precision={2}
          />
        </View>
      </View>
      {/* <View style={styles.buttons}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.button}
          onPress={() => setValue((prev) => (prev += 1))}
        >
          <Entypo name="minus" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.button}
          onPress={() => setValue((prev) => (prev += 1))}
        >
          <Entypo name="plus" size={24} color={iconColor} />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    top: PADDING * 2,
    left: PADDING,
    right: PADDING,
    bottom: PADDING,
    borderRadius: 32,
    overflow: 'hidden',
    opacity: 0.2,
    width: Dimensions.get('screen').width - PADDING * 2,
    height: BAR_HEIGHT,
  },
  textContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: iconColor,
    fontSize: 24,
  },
  text: {
    position: 'absolute',
  },
  button: {
    borderRadius: 24,
    backgroundColor: iconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  buttons: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  sliderContainer: {
    paddingHorizontal: PADDING * 2,
    width: '100%',
  },
  fontStyle: {
    fontFamily: 'OpenRunde-Semibold',
    fontSize: 54,
    color: blue,
  },
  history: {
    marginTop: 12,
    fontFamily: 'OpenRunde-Medium',
    fontSize: 16,
    color: blue,
    position: 'absolute',
    top: 74,
  },
  dragIcon: {
    position: 'absolute',
    bottom: '10%',
    right: '50%',
    transform: [{ translateX: 20 }],
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
