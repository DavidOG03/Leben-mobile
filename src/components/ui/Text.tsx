import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = '', style, ...props }: TextProps) {
  // Map standard font weights to their corresponding Geist font families
  let finalClassName = className
    .replace(/\bfont-medium\b/g, 'font-geist-medium')
    .replace(/\bfont-semibold\b/g, 'font-geist-semibold')
    .replace(/\bfont-bold\b/g, 'font-geist-bold');

  // If no custom font-family is specified, apply the default sans (Geist)
  if (!finalClassName.includes('font-geist') && !finalClassName.includes('font-sans')) {
    finalClassName = `font-sans ${finalClassName}`;
  }

  // Default text color
  if (!finalClassName.includes('text-')) {
    finalClassName = `text-leben-text ${finalClassName}`;
  }

  return <RNText className={finalClassName.trim()} style={style} {...props} />;
}
