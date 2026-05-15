import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface Props {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export default function FordLogo({ width = 180, height = 72, style }: Props) {
  return (
    <Image
      source={require('../../assets/images/Logo-ford-vector-transparent-PNG-removebg-preview.png')}
      style={[{ width, height, resizeMode: 'contain' }, style]}
    />
  );
}
