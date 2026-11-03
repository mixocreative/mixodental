import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Catalogue } from './Catalogue';
import { startTheme } from '../ui/theme';
import '../fonts.css';
import '../styles.css';
import '../styles/theme.css';
import './kit.css';

/*
 * The designer's catalogue page (kit.html at the repo root; dev server only: `npm run dev`, then /mixodental/kit.html).
 * It is not an input of `npm run build`, so nothing here reaches the production bundle. No engine is loaded: every
 * control is shown with sample values.
 */
startTheme();
createRoot(document.getElementById('kit-root')!).render(<StrictMode><Catalogue /></StrictMode>);
