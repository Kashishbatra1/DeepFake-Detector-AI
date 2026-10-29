import { useWindowDimensions } from 'react-native';

import { spacing } from './theme';

/** Laptop layout starts above this width. Phones and small windows stay as they are. */
export const LAPTOP_MIN_WIDTH = 900;
export const CONTENT_MAX_WIDTH = 1100;
export const SIDEBAR_WIDTH = 248;

export function useWideLayout() {
  const { width, height } = useWindowDimensions();
  return { width, height, wide: width > LAPTOP_MIN_WIDTH };
}

/** Centered page used only when the window is wider than 900 px. */
export const widePage = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: 'center',
  paddingHorizontal: spacing.xl,
};
