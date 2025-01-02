import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  spacer: {
    width: 0,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  hiddenSlot: {
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
});

export default styles;
