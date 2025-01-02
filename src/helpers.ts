import type { SlotValue, CommaPosition } from './types';

export const getNewSlotValues = (
  newValue: string,
  currentSlots: SlotValue[],
  parseFromLeft: boolean
) => {
  const iterLength = Math.max(newValue.length, currentSlots.length);

  const shiftCurrent = parseFromLeft
    ? 0
    : newValue.length > currentSlots.length
      ? currentSlots.length - newValue.length
      : 0;
  const shiftIncoming = parseFromLeft
    ? 0
    : currentSlots.length > newValue.length
      ? newValue.length - currentSlots.length
      : 0;

  const newSlotValues = Array.from(
    { length: iterLength },
    (_, i) => [i] as SlotValue[0]
  );

  Array.from({ length: iterLength }, (_, i) =>
    parseFromLeft ? i : iterLength - i - 1
  ).forEach((i) => {
    const newValueParsed = parseInt(`${newValue}`[i + shiftIncoming]!, 10);
    const currentSlotValue = currentSlots[i + shiftCurrent]?.[0][0];

    // First pass through, just set the slots since shared slots is empty
    if (currentSlots.length === 0) {
      newSlotValues[i] = [newValueParsed];
    }
    // Removing slot
    else if (isNaN(newValueParsed)) {
      newSlotValues[i] = [currentSlotValue as any, null];
    }
    // Adding slot
    else if (currentSlotValue === undefined || currentSlotValue === null) {
      newSlotValues[i] = [null, newValueParsed];
    }
    // Animating slot
    else if (currentSlotValue !== newValueParsed) {
      newSlotValues[i] = [currentSlotValue, newValueParsed];
    }
    // Static slot
    else {
      newSlotValues[i] = [newValueParsed];
    }
  });

  return newSlotValues;
};

// Takes in a new value and spits out an array of comma positions
// for all of the commas being added, removed, or staying the same
export const getNewCommaPositions = (
  newValue: string,
  currentCommaPositions: CommaPosition[],
  parseFromLeft: boolean,
  precision?: number
) => {
  const parseLength = Math.max(newValue.length, currentCommaPositions.length);
  // On first render, no size change
  const sizeChange =
    currentCommaPositions.length === 0
      ? 0
      : newValue.length - currentCommaPositions.length;

  const windowSize = sizeChange > 0 ? parseLength : parseLength + sizeChange;

  const newCommaPositions = Array.from(
    { length: parseLength },
    () => null
  ) as CommaPosition[];

  // Copy over the current comma positions
  currentCommaPositions.forEach((c, i) => {
    if (parseFromLeft || sizeChange < 0) {
      newCommaPositions[i] = c;
    } else {
      newCommaPositions[i + sizeChange] = c;
    }
  });

  for (let i = 0; i < parseLength; i++) {
    const index = parseFromLeft ? i : parseLength - i - 1;
    const windowIndex = parseFromLeft ? i : windowSize - i - 1;
    const isCommaIndex =
      (windowSize - windowIndex - 1) % 3 === 0 &&
      windowSize - windowIndex - 1 !== 0;

    const outSizeVisibleWindow = parseFromLeft
      ? index > windowSize - 1
      : index < parseLength - windowSize;

    // If in the section that's being removed, animate out all commmas
    if (outSizeVisibleWindow && currentCommaPositions.length > 0) {
      newCommaPositions[index] = Number.isFinite(newCommaPositions[index])
        ? -1
        : null;
    }
    // If is a comma index
    else if (isCommaIndex) {
      newCommaPositions[index] = Number.isFinite(newCommaPositions[index])
        ? 0
        : currentCommaPositions.length === 0
          ? 0
          : 1;
    }
    // Animate out since the comma doesn't match the new value's comma positions
    else if (Number.isFinite(newCommaPositions[index])) {
      newCommaPositions[index] = -1;
    }
  }

  return newCommaPositions
    .concat(Array.from({ length: precision || 0 }, () => null))
    .filter((_, i) => i >= (precision || 0));
};
