import type { StyleProp, TextStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type Position = -1 | 0 | 1;

// [number] : static number
// [number, null]: removing slot
// [null, number]: adding slot
// [number, number]: animating slot
//
// [slotValue, key]
export type SlotValue = [[number] | [number | null, number | null], string];

type EasingT = 'linear' | 'in-out' | 'out';

type Spring =
  | {
      damping: number;
      mass: number;
      stiffness: number;
    }
  | true;

export interface SlotProps {
  slot: SlotValue;
  index: number;
  easing?: EasingT;
  animationDuration: number;
  fontStyle?: StyleProp<TextStyle>;
  commaWidth: number;
  periodWidth: number;
  onCompleted?: () => void;
  commaPositions?: CommaPosition[];
  charSizes: number[];
  height: number;
  spring?: Spring;
}

type Shared =
  | 'fontStyle'
  | 'index'
  | 'charSizes'
  | 'animationDuration'
  | 'spring';

export interface ContinuousSlotProps extends Pick<SlotProps, Shared> {
  slot: [number | string, string];
  spring?: Spring;
  easing?: EasingT;
}

// 1 indicates entering, -1 indicates exiting, 0 indicates idle, null indicates no comma
export type CommaPosition = 1 | -1 | 0 | null;

export interface CommaProps {
  isEntering: boolean;
  isExiting: boolean;
  width: SharedValue<number>;
  animationDuration: number;
  fontStyle?: StyleProp<TextStyle>;
  onExited: () => void;
  onEntered: () => void;
}

interface AnimatedNumbersPropsBase {
  value: number;
  fontStyle?: StyleProp<TextStyle>;
  prefix?: string;
  includeComma?: boolean;
  precision?: number;
  animateIntermediateValues?: true;
}

export type AnimatedNumbersProps =
  | ({
      easing?: EasingT;
      animationDuration?: number;
      spring?: never;
    } & AnimatedNumbersPropsBase)
  | ({
      easing?: never;
      animationDuration?: never;
      spring?: Spring;
    } & AnimatedNumbersPropsBase);
