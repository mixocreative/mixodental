import { describe, expect, it } from 'vitest';
import { FLOW_END, SCENES, SCENE_IDS, enabledScenes, flowEndsAtExport, sceneEnabled, sceneOf, sceneOrFallback } from './sceneMap';

describe('the scene map', () => {
  it('describes every scene it lists, and lists every scene it describes', () => {
    expect(Object.keys(SCENES).sort()).toEqual([...SCENE_IDS].sort());
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      expect(scene.id).toBe(id);
      for (const text of [scene.title, scene.purpose, scene.owns]) expect(text.length).toBeGreaterThan(0);
    }
  });

  /*
   * THE INVARIANT THAT MAKES THE FLAG SAFE. A scene that is off must say where the operator goes
   * instead, and that destination must itself be on - otherwise switching one scene off strands them
   * in a scene that is never rendered, which is a blank screen and no way back.
   */
  it('never leaves the operator nowhere: every switched-off scene falls back to a switched-on one', () => {
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      if (scene.enabled) {
        expect(scene.fallback, `${id} is on and needs no fallback`).toBeUndefined();
        continue;
      }
      expect(scene.fallback, `${id} is off and must say where to go instead`).toBeDefined();
      const { goTo, why, carries } = scene.fallback!;
      expect(goTo).not.toBe(id);
      expect(SCENES[goTo].enabled, `${id} falls back to ${goTo}, which must be on`).toBe(true);
      expect(why.length).toBeGreaterThan(0);
      // A scene carries something, or switching it off would be a no-op nobody needed to record.
      expect(carries.length).toBeGreaterThan(0);
    }
  });

  it('keeps at least the start and one scene after it, so the app is never a blank screen', () => {
    expect(sceneEnabled('start')).toBe(true);
    expect(enabledScenes().length).toBeGreaterThanOrEqual(2);
    expect(enabledScenes().map((scene) => scene.id)).toEqual(SCENE_IDS.filter((id) => SCENES[id].enabled));
  });

  it('routes through the fallback only for a scene that is off', () => {
    for (const id of SCENE_IDS) {
      expect(sceneOrFallback(id)).toBe(SCENES[id].enabled ? id : SCENES[id].fallback!.goTo);
      // Routing is settled in one hop: a fallback never needs a fallback of its own.
      expect(sceneOrFallback(sceneOrFallback(id))).toBe(sceneOrFallback(id));
    }
  });

  it('is the object scene alone that repeats, and alone that is scoped per object', () => {
    expect(SCENE_IDS.filter((id) => SCENES[id].repeats)).toEqual(['object']);
    expect(SCENE_IDS.filter((id) => SCENES[id].scope === 'object')).toEqual(['object']);
  });

  it('names the scene the app is showing, with a start screen winning over the workspace', () => {
    expect(sceneOf({ startScreen: 'task', mode: 'off' })).toBe('start');
    expect(sceneOf({ startScreen: 'type', mode: 'dental' })).toBe('start');
    expect(sceneOf({ startScreen: null, mode: 'dental' })).toBe('object');
    for (const mode of ['off', 'edit', 'zones'] as const) {
      expect(sceneOf({ startScreen: null, mode })).toBe('bench');
    }
  });

  /*
   * WHAT ACTUALLY CHANGED: the route out of the last step, not the existence of a scene.
   *
   * Every scene is on. Switching the bench off outright was tried and reverted: its Any model door
   * is the only way into Support Edit Mode, no-support zones, the plate panel, Save project and all
   * five exports, none of which have anything to do with the step flow. So the flag moves where the
   * flow ENDS and the scene keeps its own doors.
   */
  it('ends the flow at its own export, with every scene still on', () => {
    expect(FLOW_END).toBe('export');
    expect(flowEndsAtExport()).toBe(true);
    expect(SCENE_IDS.every((id) => SCENES[id].enabled)).toBe(true);
  });

  it('leaves the bench its own doors, so no scene is reachable only through the flow', () => {
    const doors = SCENES.bench.doors ?? [];
    expect(doors.length).toBeGreaterThan(0);
    expect(doors.join(' ')).toContain('Any model');
    expect(doors.join(' ')).toContain('saved project');
  });
});
