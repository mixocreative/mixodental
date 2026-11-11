/**
 * The one way out of a crashed render: the save the operator can still reach.
 *
 * A React error boundary renders INSTEAD of the subtree that threw, so it cannot read that
 * subtree's state or call its callbacks. In this app that state IS the work: the scene the operator
 * has been preparing lives in `App`'s reducer and nowhere else - no server, no autosave. So the
 * expensive half of a render crash is not the blank page, it is the hour of preparation behind it.
 *
 * `App` publishes its own save here while it is alive; `AppBoundary` calls it once the tree is gone.
 * A module-level slot is the wrong shape for almost everything and the right shape for exactly
 * this: the only caller is, by definition, outside the tree that owns the value.
 *
 * What is published is `App`'s own `saveProject`, whose closure holds `sceneRef` rather than a
 * scene - so it writes the last state the app committed, not a copy frozen when the slot was
 * filled. `undefined` means there is nothing worth saving, and then the boundary offers no button
 * it cannot honour.
 */

let saveScene: (() => Promise<void>) | undefined;

/** Called by `App` whenever whether-there-is-work changes. The last caller wins; there is one `App`. */
export function publishSceneSave(save: (() => Promise<void>) | undefined): void {
  saveScene = save;
}

/** The save to offer on the stopped screen, or `undefined` when the scene holds nothing. */
export function sceneSave(): (() => Promise<void>) | undefined {
  return saveScene;
}
