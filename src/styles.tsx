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
    height: '150%',
    width: '100%',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  measureSlot: {
    position: 'absolute',
    opacity: 0,
  },
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
  },
  abs: {
    position: 'absolute',
  },
  hiddenSpacer: {
    opacity: 0,
  },
});

export default styles;
