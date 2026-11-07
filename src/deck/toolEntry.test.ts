import { describe, expect, it } from 'vitest';
import { entryEvents } from './toolEntry';

describe('opening a tool from the rail', () => {
  it('sends nothing when the tool is already open', () => {
    expect(entryEvents('orient', 'aligner')).toEqual([]);
    expect(entryEvents('area', 'area')).toEqual([]);
    expect(entryEvents('supports', 'review')).toEqual([]);
    expect(entryEvents('rim', 'rim')).toEqual([]);
  });

  it('walks back one stage at a time, which is what Back already does', () => {
    expect(entryEvents('area', 'review')).toEqual(['backDental']);
    expect(entryEvents('orient', 'area')).toEqual(['backDental']);
    expect(entryEvents('orient', 'review')).toEqual(['backDental', 'backDental']);
  });

  /*
   * FORWARD IS AN ACCEPT, so the rail does not do it. The area is measured from a rim the operator
   * approved and the supports are built from an area they approved; those approvals do real work and
   * belong to the tool's own primary action, not to a press on a rail.
   */
  it('refuses to go forward, whichever tool is asked for', () => {
    expect(entryEvents('area', 'aligner')).toBeUndefined();
    expect(entryEvents('supports', 'aligner')).toBeUndefined();
    expect(entryEvents('supports', 'area')).toBeUndefined();
  });

  describe('the rim, which is a detour off Orient rather than a stage on the spine', () => {
    it('is reopened directly when the operator is on Orient', () => {
      expect(entryEvents('rim', 'aligner')).toEqual(['dentalRimReopen']);
    });

    it('is reached from further on by backing to Orient first', () => {
      expect(entryEvents('rim', 'area')).toEqual(['backDental', 'dentalRimReopen']);
      expect(entryEvents('rim', 'review')).toEqual(['backDental', 'backDental', 'dentalRimReopen']);
    });

    /*
     * THE CASE THE FIRST VERSION GOT WRONG. `rim` and `aligner` sit at the same depth on the spine,
     * so counting depth alone made this zero steps - which reads as "cannot get there" - when one
     * Back leaves the detour and lands exactly on Orient.
     */
    it('gives way to Orient with ONE Back, not with none', () => {
      expect(entryEvents('orient', 'rim')).toEqual(['backDental']);
    });

    it('cannot reach the tools past Orient from inside the drawing: those are still forward', () => {
      expect(entryEvents('area', 'rim')).toBeUndefined();
      expect(entryEvents('supports', 'rim')).toBeUndefined();
    });
  });

  it('cannot open anything from the type screen, which has no model yet', () => {
    // `type` is before every tool, so every tool is forward from there - and the deck never shows a
    // rail without a row anyway.
    expect(entryEvents('orient', 'type')).toBeUndefined();
    expect(entryEvents('rim', 'type')).toBeUndefined();
    expect(entryEvents('supports', 'type')).toBeUndefined();
  });

  it('never returns an empty list for a tool that is not already open', () => {
    // An empty list means "you are there"; anything else must be either real events or undefined.
    // A silent empty would make a rail press look dead.
    const stages = ['type', 'aligner', 'rim', 'area', 'review'] as const;
    const tools = ['orient', 'rim', 'area', 'supports'] as const;
    for (const stage of stages) {
      for (const tool of tools) {
        const events = entryEvents(tool, stage);
        if (events === undefined) continue;
        const open = (tool === 'orient' && stage === 'aligner') || (tool === 'rim' && stage === 'rim')
          || (tool === 'area' && stage === 'area') || (tool === 'supports' && stage === 'review');
        expect(events.length === 0).toBe(open);
      }
    }
  });
});
