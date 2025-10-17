import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PasswordVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
}

const EyeOpenIcon = ({ size = 24, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeClosedIcon = ({ size = 24, color = '#6b7280' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1L23 23"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function PasswordVisibilityToggle({
  isVisible,
  onToggle,
  size = 24,
  color = '#6b7280'
}: PasswordVisibilityToggleProps) {
  return (
    <Pressable onPress={onToggle} style={styles.button}>
      {isVisible ? (
        <EyeClosedIcon size={size} color={color} />
      ) : (
        <EyeOpenIcon size={size} color={color} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
  },
});
