import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

interface LogoProps {
  size?: number;
  style?: any;
}

export function Logo({ size = 120, style }: LogoProps) {
  // Use the existing icon.png as fallback until logo.png is added
  // When logo.png is added, update this to use logo.png
  const logoSource = require('@/assets/images/icon.png');

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <ExpoImage
        source={logoSource}
        style={[styles.logo, { width: size, height: size }]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 24,
  },
  placeholder: {
    backgroundColor: '#0a7ea4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

