export const bezier_points: Record<
  'linear' | 'out' | 'in-out',
  [number, number, number, number]
> = {
  'in-out': [0.23, 0, 0.23, 0.99],
  'linear': [0, 0, 1, 1],
  'out': [0, 0.4, 0.4, 0.9],
};

const mass = 1;
const damping = 20;
const stiffness = 170;

export { mass, damping, stiffness };
