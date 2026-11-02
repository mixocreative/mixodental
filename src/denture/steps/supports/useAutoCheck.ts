import { useEffect, useRef } from 'react';

/**
 * Denture Step 2 runs the support check by itself once a build is finished (P7c), so the step's status line can count the
 * problems without a Check press. Inputs: `build`, the unit's current finished build (absent while it builds or outside
 * the step); `checked`, the check's verdict already belongs to this build; `canRun`, the check command is enabled; `run`
 * starts it (the same command as the Check button). Each build is checked at most once: a later build is checked again.
 */
export function useAutoCheck({ build, checked, canRun, run }: { build: object | undefined; checked: boolean; canRun: boolean; run: () => void }): void {
  const asked = useRef<object | undefined>(undefined);
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    if (!build || checked || !canRun || asked.current === build) return;
    asked.current = build;
    runRef.current();
  }, [build, checked, canRun]);
}
