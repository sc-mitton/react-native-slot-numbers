import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { SlotNumbers } from 'react-native-slot-numbers';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import OpenRundeSemibold from '../assets/fonts/OpenRunde-Semibold.otf';

const PADDING = 32;
const MIN_SLIDER_VALUE = 0;
const BAR_HEIGHT = Dimensions.get('screen').height - PADDING * 3;

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const blue = 'hsl(221, 95%, 62%)';

const tests = [
  35420, 15770, 298, 321, 45433, 51369, 69809, 73533, 668678, 194, 130933,
  829769, 807919, 8079190,
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
      <StatusBar style="light" />
      <View style={styles.textContainer}>
        <View style={styles.text}>
          <SlotNumbers
            value={value}
            prefix="$"
            fontStyle={styles.fontStyle}
            includeComma={true}
            // animationDuration={3000}
            animateIntermediateValues
            easing="in-out"
            // spring
            // precision={2}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(0, 0%, 0%)',
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
  text: {
    position: 'absolute',
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
