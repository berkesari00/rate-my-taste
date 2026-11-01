import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { tapFeedback } from '../services/haptics';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'purple';
  disabled?: boolean;
};

export default function ChunkyButton({ title, onPress, variant = 'primary', disabled }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const palette = {
    primary: { bg: theme.colors.primary, text: '#FFFFFF' },
    secondary: { bg: theme.colors.surface, text: theme.colors.ink },
    accent: { bg: theme.colors.accent, text: '#FFFFFF' },
    danger: { bg: theme.colors.danger, text: '#FFFFFF' },
    purple: { bg: theme.colors.purple, text: '#FFFFFF' },
  }[variant];

  return (
    <Animated.View style={[animStyle, disabled && styles.disabledWrap]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => (scale.value = withSpring(0.96, { damping: 15 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 15 }))}
        onPress={() => {
          tapFeedback();
          onPress();
        }}
        style={[
          styles.base,
          { backgroundColor: palette.bg },
          variant === 'secondary' ? theme.shadow.card : theme.shadow.button,
        ]}
      >
        <Text style={[styles.label, { color: palette.text }]}>{title.toUpperCase()}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 1.2,
  },
  disabledWrap: {
    opacity: 0.4,
  },
});