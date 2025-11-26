'use client'

import { createElement, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Circle, HelpCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface SafeIconProps extends LucideProps {
  name: string;
}

export default function SafeIcon({ name, ...props }: SafeIconProps) {
  const IconComponent = useMemo(() => {
    if (!name) return Circle;

    const cleanName = name.toString();
    const normalizedName = cleanName
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
    const icon = (LucideIcons as any)[normalizedName] || (LucideIcons as any)[cleanName];
    if (icon) {
      return icon;
    }
    console.warn(
      `[SafeIcon] Icon not found.\n` +
      `Original Input: "${name}"\n` +
      `Converted To: "${normalizedName}"\n` +
      `Available Icons Sample: ${Object.keys(LucideIcons).slice(0, 3).join(', ')}...`
    );
    return HelpCircle;
  }, [name]);

  return createElement(IconComponent, props);
}