import type { GeneratePhase, GeneratePhaseCallback } from '@mixo-geocore/host/core/progress';
import { DENTURE_STAGE } from './stagePlans';

/*
 * Folds the engine's build phases (engine 60, `GENERATE_PHASES`) into the stage strings of the build plan (`stagePlans.ts`):
 * preparing = preparing; routing = routing (its done/total is the stage's own fraction); placing + bracing + raft = bracing;
 * checking + judging + finishing + writing = checking. A repair round re-enters routing after the build has gone on to
 * placing..checking; those phases then post the repair string, which the stage model shows as "Repairing" without moving
 * the bar back. `judging` comes once, after the last repair, so it ends the repair and posts checking again.
 * Pure: it only calls `post(fraction, stage)`.
 */

export type PostStage = (fraction: number, stage: string) => void;

/** The phase callback for one build; make a new one per build (it remembers whether the build left routing). */
export function phaseStages(post: PostStage): GeneratePhaseCallback {
  let leftRouting = false;
  let repairing = false;
  return (phase: GeneratePhase, done: number, total: number) => {
    switch (phase) {
      case 'preparing':
        post(0, DENTURE_STAGE.preparing);
        return;
      case 'routing':
        if (leftRouting) repairing = true;
        if (repairing) post(0, DENTURE_STAGE.repairing);
        else post(total > 0 ? Math.min(1, done / total) : 0, DENTURE_STAGE.routing);
        return;
      case 'placing':
      case 'bracing':
      case 'raft':
        leftRouting = true;
        post(0, repairing ? DENTURE_STAGE.repairing : DENTURE_STAGE.bracing);
        return;
      case 'checking':
        leftRouting = true;
        post(0, repairing ? DENTURE_STAGE.repairing : DENTURE_STAGE.checking);
        return;
      case 'judging':
      case 'finishing':
      case 'writing':
        repairing = false;
        post(0, DENTURE_STAGE.checking);
        return;
      default:
        return;
    }
  };
}
