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
const AnimatedNumbers = (props: AnimatedNumbersProps) => {
  return (
    <>
      {props.animateIntermediateValues ? (
        <ContinuousSlots {...props} />
      ) : (
        <Slots {...props} />
      )}
    </>
  );
};

/*
Basic logic:

When a new value comes in:

1. If there is an animation currently in progress then queue the new value with any prefix prepended

2. For an animation cycle, split the new number and set the new number state

3. Loop through the new number and old number and compare digits, determing which way the new numbers
and old numers need to animate. There are two versions of the number, one that's visible, and one outside
the visible clipping container. If a slot has the same number between the old and new nummer, it wont be animated.

4. Set the new positions wich will trigger the animations of the slots

5. At the end, clear the new number and set the old number to the new number

6. Pop any queued values and set the formated value, which will retriger the animation cycle

*/

export default AnimatedNumbers;
