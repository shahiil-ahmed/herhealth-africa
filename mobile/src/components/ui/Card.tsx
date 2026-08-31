import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'pink' | 'dark';
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'pink' && styles.cardPink,
        variant === 'dark' && styles.cardDark,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPink: {
    backgroundColor: Colors.rosePinkLight,
    borderColor: 'rgba(212, 104, 138, 0.15)',
  },
  cardDark: {
    backgroundColor: Colors.darkPlum,
    borderColor: 'transparent',
  },
});
