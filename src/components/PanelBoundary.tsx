import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';

/**
 * ONE PANEL'S CRASH SHOULD COST ONE PANEL, NOT THE SESSION.
 *
 * `AppBoundary` at the root keeps the shell up and lets the scene be saved, which is the right last
 * resort and the wrong first one: a throw while drawing the 3D view, or inside the settings panel,
 * takes the whole tree with it and the operator loses the page they were working on. The sibling app
 * mixoMesh has had the answer for a while - `PanelErrorBoundary` around every mounted panel
 * (`src/react/mountPanel.tsx`) - and the 2026-11-12 three-repo plan says to take it.
 *
 * WHERE THIS DIFFERS FROM THE SIBLING, DELIBERATELY: that one renders `null` on failure, so a
 * crashed panel becomes an empty space. This app's own rule is that every way it can fail has a
 * face (the audit's S22 class, MIXO-04), so this renders a sentence where the panel was. An empty
 * region is indistinguishable from a region with nothing to show, which is the same silence in a
 * smaller box.
 *
 * It offers no action on purpose. Reloading is the root boundary's business and would cost the
 * scene; what this surface owes the operator is the truth that one part stopped and the rest did
 * not, so they can finish or save what they were doing.
 *
 * ISOLATION IS STRUCTURAL, NOT TESTED HERE. Two sibling regions each inside their own boundary
 * cannot take each other down, because React unwinds to the nearest boundary - that is the
 * mechanism, not a property this repo can assert: `renderToStaticMarkup` does not run error
 * boundaries at all, and there is no jsdom here. What the test beside this file pins is the
 * DECISION and the FACE; the mechanism is React's.
 */
export class PanelBoundary extends Component<{ name: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Named, so a report says WHICH panel went. The screen is what tells the operator; this is for
    // whoever is asked to look afterwards.
    console.error(`mixoDental panel "${this.props.name}" stopped:`, error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <p className="panel-stopped" role="alert" data-ui={`panel-stopped-${this.props.name}`}>
        {t('This part of the app stopped. The rest still works.')}
      </p>
    );
  }
}
