import { describe, expect, it } from 'vitest';
import { TOOL_ORDER, toolsFor } from './tools';

describe('the tools a job has', () => {
  it('gives an aligner the whole chain', () => {
    expect(toolsFor(false)).toEqual(['orient', 'rim', 'area', 'supports']);
  });

  it('gives a denture Orient and Supports, the two steps it actually has', () => {
    // `denture/state/dentureStages.ts` sends a denture straight from Orient to its supports: it draws
    // no rim and marks no area, so offering either is offering a step the job cannot use.
    expect(toolsFor(true)).toEqual(['orient', 'supports']);
  });

  it('is a FILTER, so it can never disagree with the order it filters', () => {
    /*
     * The rule this file exists to hold. The order IS the dependency, and three readers must agree
     * about it - `staleTools`, the rail, and `revisionsField`. A per-job LIST would be a second truth
     * free to drift; a filter is derived, so a tool added to `TOOL_ORDER` cannot go missing from one
     * job's chain by omission, and the relative order is the same wherever it appears.
     */
    for (const denture of [false, true]) {
      const chain = toolsFor(denture);
      expect(chain.every((tool) => TOOL_ORDER.includes(tool))).toBe(true);
      expect([...chain]).toEqual(TOOL_ORDER.filter((tool) => chain.includes(tool)));
    }
  });
});
