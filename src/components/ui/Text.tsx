import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = '', style, ...props }: TextProps) {
  // Only apply font-sans if no other font class is explicitly provided
  const hasFontClass = /\bfont-(geist|sans|mono|serif)\b/.test(className);
  const defaultFont = hasFontClass ? '' : 'font-sans';

  const finalClassName = `${defaultFont} text-leben-text ${className}`.trim();

  return <RNText className={finalClassName} style={style} {...props} />;
}
