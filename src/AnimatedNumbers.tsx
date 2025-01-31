import { memo } from 'react';
import type { AnimatedNumbersProps } from './types';

import ContinuousSlots from './ContinuousSlots';
import Slots from './Slots';

/**
 * AnimatedNumbers Component
 *
 * This component animates numeric values, transitioning between old and new numbers.
 * It supports animation of individual digits, optional commas, and a customizable prefix.
 * The animation occurs over a defined duration and can be repeated as the value changes.
 *
 * @param {number} props.value - The value to animate to.
 * @param {Object} props.fontStyle - The style of the text, passed as a TextStyle object.
 * @param {number} [props.animationDuration=500] - The duration of the animation in milliseconds.
 * Defaults to 500ms (700ms when also animating intermediate values) Only supported when
 * animateIntermediateValues is false.
 * @param {string} [props.prefix=""] - A prefix to the number, such as a currency symbol.
 * @param {boolean} [props.includeComma=false] - Whether to include commas as thousand separators.
 * @param {true} [props.animateIntermediateValues=false] - Whether to animate all intermediate numbers between new value
 * and current value of a slot. If the value is changing rapidly, this option is best. Otherwise the animations
 * may glitch or act unexpectedly.
 * @param {number} [props.precision] - Number of decimal places. For example, a value prop of 42069 with precision of 2 would become 420.69.
 * @param {boolean|Object} [props.spring=false] - Spring transition, can be used in place of easing for physics-based transitions.
 * If true, a default spring configuration will be applied. If an object, it must include the following keys:
 *   - {number} mass - The mass of the spring (affects how heavy it feels).
 *   - {number} stiffness - The stiffness of the spring (affects how bouncy it feels).
 *   - {number} damping - The damping of the spring (affects how quickly it slows down).
 *
 * @returns {JSX.Element} The animated number component with slots for digits and commas.
 */
const AnimatedNumbers = memo((props: AnimatedNumbersProps) => {
  return (
    <>
      {props.animateIntermediateValues ? (
        <ContinuousSlots {...props} />
      ) : (
        <Slots {...props} />
      )}
    </>
  );
});

export default AnimatedNumbers;
