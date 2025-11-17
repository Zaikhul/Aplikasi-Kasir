'use client'

import { createElement, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Circle } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface SafeIconProps extends LucideProps {
  name: string;
}

export default function SafeIcon({ name, ...props }: SafeIconProps) {
  const IconComponent = useMemo(() => {
    // Try to get the icon from lucide-react
    const icon = (LucideIcons as any)[name];
    
    // If icon exists and is a valid component, return it
    if (icon && typeof icon === 'function') {
      return icon;
    }
    
    // Otherwise, return fallback
    console.warn(`Icon "${name}" not found in lucide-react, using fallback`);
    return Circle;
  }, [name]);

  return createElement(IconComponent, props);
}
