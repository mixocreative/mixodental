/*
 * ONE JOB: the entry the plain-HTML review page calls to put the React Flow canvas into an element.
 *
 * The review page is not a React app and is not served by Vite, so this is built on its own
 * (`npm run review:editor`, config `vite.editor.config.ts`) into `node-editor/node-editor.js`, one
 * self-contained ES module with React and React Flow inside and its stylesheet inlined. The page
 * loads it with a dynamic `import()`, and keeps its card editor as the fallback when the bundle is
 * missing - an editor that vanished because a build step was skipped would be worse than a plainer one.
 */
import { createRoot, type Root } from 'react-dom/client';
import flowCss from '@xyflow/react/dist/style.css?inline';
import { ZoneEditor, autoLayout, type ZoneEditorProps } from './ZoneEditor';

export { autoLayout };

let styled = false;

/** Mount the canvas into `el`; returns `update` for a new graph and `unmount`. */
export function mountZoneEditor(el: HTMLElement, props: ZoneEditorProps): { update(next: ZoneEditorProps): void; unmount(): void } {
  if (!styled) {
    const style = document.createElement('style');
    style.dataset.ui = 'node-editor-css';
    style.textContent = flowCss;
    document.head.append(style);
    styled = true;
  }
  const root: Root = createRoot(el);
  root.render(<ZoneEditor {...props} />);
  return {
    update: (next) => root.render(<ZoneEditor {...next} />),
    unmount: () => root.unmount(),
  };
}
