"use client";

import { useEffect } from 'react';
import { suppressNonCriticalWarnings } from '@/lib/dev-utils';

export default function DevSetup() {
  useEffect(() => {
    suppressNonCriticalWarnings();
  }, []);

  return null;
}
