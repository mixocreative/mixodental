// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { autoGenSentence } from './autoGenText';
import { translateMessage } from '../i18n';
import type { AutoGenCard } from './useAutoGen';
import type { AutoGenStop } from './pipeline';

/**
 * WHAT A CARD SAYS ABOUT ITS OWN RUN - and, as much, WHERE IT DELIBERATELY SAYS NOTHING.
 *
 * This module is the only voice a queued model has. Two of its stops are silent on purpose, because
 * the detect chip one cell away already says the same thing in the operator's terms - and "silent on
 * purpose" is indistinguishable from "forgot a case" unless something pins it.
 */

const say = (card: AutoGenCard) => { const message = autoGenSentence(card); return message ? translateMessage(message) : undefined; };
const stopped = (stop: AutoGenStop): AutoGenCard => ({ kind: 'stopped', stop });

describe('what a card says while it runs', () => {
  it('says it is waiting, and then that it is working', () => {
    expect(say({ kind: 'queued' })).toBe('Waiting to generate…');
    expect(say({ kind: 'running' })).toBe('Generating supports…');
    expect(say({ kind: 'queued' })).not.toBe(say({ kind: 'running' }));
  });
});

describe('what it says when it finishes', () => {
  it('counts the tips, in the singular and the plural', () => {
    expect(say({ kind: 'done', tips: 1, recipeName: 'Type default', recipeId: 'type-default' })).toBe('1 support placed');
    expect(say({ kind: 'done', tips: 94, recipeName: 'Type default', recipeId: 'type-default' })).toBe('94 supports placed');
  });
});

/**
 * EVERY STOP NAMES SOMETHING THE OPERATOR CAN DO, which is the difference between a queue that
 * reports and a queue that merely stops.
 */
describe('what it says when it stops', () => {
  it('has words for every stop an operator must act on', () => {
    expect(say(stopped({ at: 'area', because: 'no-area' }))).toMatch(/paint/i);
    expect(say(stopped({ at: 'supports', because: 'no-tips' }))).toMatch(/by hand/i);
    expect(say(stopped({ at: 'area', because: 'failed' }))).toMatch(/support area/i);
    expect(say(stopped({ at: 'orient', because: 'failed' }))).toMatch(/orientation/i);
    expect(say(stopped({ at: 'supports', because: 'failed' }))).toMatch(/failed/i);
    expect(say(stopped({ at: 'recipe', because: 'missing' }))).toMatch(/recipe/i);
  });

  it('tells the three "failed" stops apart, because they send the operator to different screens', () => {
    const orient = say(stopped({ at: 'orient', because: 'failed' }));
    const area = say(stopped({ at: 'area', because: 'failed' }));
    const supports = say(stopped({ at: 'supports', because: 'failed' }));

    expect(new Set([orient, area, supports]).size).toBe(3);
  });

  /*
   * THE CHIP CANNOT COVER FOR THESE TWO, which an earlier version assumed it could. The card was
   * ELIGIBLE, so the deck's chip said "Ready" - and when the pipeline's own fresh check disagrees,
   * the chip is the stale one and goes on saying Ready. A silent card then looked like a press that
   * did nothing at all, on a model the engine had just raised a doubt about.
   */
  it('speaks when the fresh check disagrees with the card, because the chip still says Ready', () => {
    expect(say(stopped({ at: 'orient', because: 'needs-attention' }))).toMatch(/disagrees/i);
    expect(say(stopped({ at: 'orient', because: 'no-rim' }))).toMatch(/rim/i);
  });

  /* `gone` has no card left to write on: the model has left the plate. */
  it('says nothing only where there is no card to say it on', () => {
    expect(say(stopped({ at: 'orient', because: 'gone' }))).toBeUndefined();
  });

  /*
   * THE PRINT-ANGLE CHECK'S THREE BAD ANSWERS EACH REACH THE CARD. All three used to read "94
   * supports placed", identical to a clean run - and the deck can export without ever opening the
   * model, so a case could go out with nothing having said that no angle held.
   */
  it('carries the print-angle verdict onto a finished card, distinctly for each outcome', () => {
    const done = (angleCheck?: 'none-held' | 'failed' | 'not-scanned') =>
      say({ kind: 'done', tips: 94, recipeName: 'Type default', recipeId: 'type-default', ...(angleCheck ? { angleCheck } : {}) });

    expect(done()).toBe('94 supports placed');
    expect(done('none-held')).toMatch(/no print angle held/i);
    expect(done('failed')).toMatch(/could not be checked/i);
    expect(done('not-scanned')).toMatch(/was not checked/i);
    expect(new Set([done(), done('none-held'), done('failed'), done('not-scanned')]).size).toBe(4);
  });
});
