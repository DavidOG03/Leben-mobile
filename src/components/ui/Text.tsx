import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = '', style, ...props }: TextProps) {
  let processedClassName = className
    .replace(/\bfont-medium\b/g, 'font-geist-medium')
    .replace(/\bfont-semibold\b/g, 'font-geist-semibold')
    .replace(/\bfont-bold\b/g, 'font-geist-bold');

  const finalClassName = `font-sans text-leben-text ${processedClassName}`.trim();

  return <RNText className={finalClassName} style={style} {...props} />;
}
