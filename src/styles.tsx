import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  spacer: {
    width: 0,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  continuousSlotsContainer: {
    flexDirection: 'row',
  },
  continuousSlotsMaskView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    width: 'auto',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  measureSlot: {
    position: 'absolute',
    opacity: 0,
  },
  abs: {
    position: 'absolute',
  },
  hiddenSpacer: {
    opacity: 0,
  },
});

export default styles;
