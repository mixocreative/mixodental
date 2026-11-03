import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './dental/editingMode';
import './workers/engineSource';
import App from './App';
import { geometryReady } from '@mixo-geocore/host/workers/geometryClient';
import { startTheme } from './ui/theme';
import './fonts.css';
import './styles.css';
import './styles/theme.css';
// The theme is worn before the first render, so no frame is drawn in the wrong colours.
startTheme();
// Interactive maths (transforms, pick, brush) is synchronous Rust: the engine is ready before the first render.
void geometryReady().then(() => createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>));
