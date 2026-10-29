import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { colors } from '../theme';

/**
 * Shield mark with a soft blue/purple glow.
 * `size` is the rendered width and height in px.
 */
export default function AppLogo({ size = 72 }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `shield${rawId}`;
  const glowId = `glow${rawId}`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityLabel="DeepFake Detector AI logo"
    >
      <Defs>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.55" />
          <Stop offset="42%" stopColor={colors.violet} stopOpacity="0.32" />
          <Stop offset="100%" stopColor={colors.violet} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.violet} />
        </LinearGradient>
      </Defs>

      <Circle cx="50" cy="50" r="49" fill={`url(#${glowId})`} />

      <Path
        d="M50 22
           C62 22 72 27 76 31
           C79 34 80 37 80 42
           V55
           C80 67 67 78 50 85
           C33 78 20 67 20 55
           V42
           C20 37 21 34 24 31
           C28 27 38 22 50 22 Z"
        fill={`url(#${gradientId})`}
      />

      <Path
        d="M50 36
           C45.6 36 42.1 39.4 42.1 43.6
           C42.1 49.2 50 58 50 58
           C50 58 57.9 49.2 57.9 43.6
           C57.9 39.4 54.4 36 50 36 Z"
        fill={colors.text}
      />
      <Circle cx="50" cy="43.4" r="2.8" fill={colors.primary} />
    </Svg>
  );
}
