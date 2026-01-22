// Convert real-world body measurements to 3D mannequin proportions

export interface BodyMeasurements {
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
}

export interface MannequinProportions {
  shoulderWidth: number;
  chestDepth: number;
  waistWidth: number;
  hipWidth: number;
  armThickness: number;
  legThickness: number;
  height: number;
  armLength: number;
  legLength: number;
}

// Default measurements for reference (average adult)
export const defaultMeasurements: BodyMeasurements = {
  heightCm: 170,
  weightKg: 70,
  chestCm: 96,
  waistCm: 82,
  hipsCm: 98,
  inseamCm: 76,
};

// Measurement ranges for sliders
export const measurementRanges = {
  height: { min: 140, max: 210, step: 1, unit: 'cm' },
  weight: { min: 40, max: 150, step: 1, unit: 'kg' },
  chest: { min: 70, max: 140, step: 1, unit: 'cm' },
  waist: { min: 55, max: 130, step: 1, unit: 'cm' },
  hips: { min: 70, max: 140, step: 1, unit: 'cm' },
  inseam: { min: 60, max: 95, step: 1, unit: 'cm' },
};

// Helper to map value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
};

// Calculate BMI for body thickness adjustments
const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Determine body shape from waist-to-hip ratio
export type BodyShape = 'apple' | 'pear' | 'hourglass' | 'rectangle' | 'inverted-triangle';

const determineBodyShape = (
  chestCm: number, 
  waistCm: number, 
  hipsCm: number,
  gender: 'male' | 'female'
): BodyShape => {
  const waistToHip = waistCm / hipsCm;
  const chestToHip = chestCm / hipsCm;
  const waistToChest = waistCm / chestCm;
  
  if (gender === 'female') {
    if (waistToHip < 0.75 && chestToHip > 0.9) return 'hourglass';
    if (waistToHip > 0.85) return 'apple';
    if (hipsCm > chestCm + 5) return 'pear';
    return 'rectangle';
  } else {
    if (chestCm > hipsCm + 10) return 'inverted-triangle';
    if (waistToChest > 0.95) return 'apple';
    if (waistToChest < 0.85 && hipsCm < chestCm) return 'inverted-triangle';
    return 'rectangle';
  }
};

// Main conversion function
export const measurementToProportions = (
  measurements: BodyMeasurements,
  gender: 'male' | 'female'
): MannequinProportions => {
  const { heightCm, weightKg, chestCm, waistCm, hipsCm, inseamCm } = measurements;
  
  // Calculate derived values
  const bmi = calculateBMI(heightCm, weightKg);
  const bodyShape = determineBodyShape(chestCm, waistCm, hipsCm, gender);
  
  // Height scaling (base mannequin is 1.7m)
  const heightScale = heightCm / 170;
  const height = 1.7 * heightScale;
  
  // BMI affects limb thickness (18.5-35 range)
  const bmiThicknessFactor = mapRange(bmi, 18.5, 32, 0.85, 1.25);
  
  // Torso proportions from measurements
  const shoulderWidth = mapRange(chestCm, 80, 130, 0.36, 0.52) * (gender === 'male' ? 1.08 : 0.95);
  const chestDepth = mapRange(chestCm, 80, 130, 0.16, 0.26) * bmiThicknessFactor;
  const waistWidth = mapRange(waistCm, 60, 120, 0.24, 0.42);
  
  // Hip width with gender and body shape modifiers
  let hipWidth = mapRange(hipsCm, 80, 130, 0.32, 0.50);
  if (bodyShape === 'pear') hipWidth *= 1.05;
  if (bodyShape === 'hourglass') hipWidth *= 1.02;
  if (gender === 'female') hipWidth *= 1.06;
  
  // Limb proportions
  const armThickness = 0.048 * bmiThicknessFactor * (gender === 'male' ? 1.1 : 0.9);
  const legThickness = 0.075 * bmiThicknessFactor * (gender === 'male' ? 1.05 : 1.0);
  
  // Arm and leg length based on height and inseam
  const armLength = 0.58 * heightScale;
  const legLength = (inseamCm / 76) * 0.82 * heightScale;
  
  return {
    shoulderWidth,
    chestDepth,
    waistWidth,
    hipWidth,
    armThickness,
    legThickness,
    height,
    armLength,
    legLength,
  };
};

// Quick preset configurations
export const quickPresets: Record<string, { label: string; measurements: BodyMeasurements }> = {
  petite: {
    label: "Petite (5'2\")",
    measurements: { heightCm: 157, weightKg: 52, chestCm: 84, waistCm: 66, hipsCm: 90, inseamCm: 68 },
  },
  small: {
    label: "Small (5'5\")",
    measurements: { heightCm: 165, weightKg: 58, chestCm: 88, waistCm: 70, hipsCm: 94, inseamCm: 72 },
  },
  average: {
    label: "Average (5'8\")",
    measurements: { heightCm: 173, weightKg: 70, chestCm: 96, waistCm: 80, hipsCm: 100, inseamCm: 78 },
  },
  tall: {
    label: "Tall (6'0\")",
    measurements: { heightCm: 183, weightKg: 80, chestCm: 102, waistCm: 86, hipsCm: 104, inseamCm: 84 },
  },
  extraTall: {
    label: "Extra Tall (6'3\")",
    measurements: { heightCm: 191, weightKg: 88, chestCm: 108, waistCm: 92, hipsCm: 108, inseamCm: 88 },
  },
};

// Unit conversion utilities
export const cmToInches = (cm: number): number => cm / 2.54;
export const inchesToCm = (inches: number): number => inches * 2.54;
export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;

export const formatHeight = (cm: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${cm} cm`;
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
};

export const formatWeight = (kg: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${kg} kg`;
  return `${Math.round(kgToLbs(kg))} lbs`;
};

export const formatMeasurement = (cm: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${cm} cm`;
  return `${Math.round(cmToInches(cm) * 10) / 10}"`;
};
