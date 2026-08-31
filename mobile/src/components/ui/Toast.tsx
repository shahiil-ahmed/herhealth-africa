import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import Colors from '../../constants/colors';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
}

export default function Toast({ visible, message, type = 'success' }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        type === 'error' && styles.error,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={[styles.text, type === 'error' && styles.errorText]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.rosePinkLight,
    borderWidth: 1,
    borderColor: 'rgba(212, 104, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 999,
  },
  error: {
    backgroundColor: Colors.errorBg,
    borderColor: 'rgba(211, 47, 47, 0.2)',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.rosePink,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
  },
});
