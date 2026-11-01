import type { ReactNode } from 'react';
import type { CommandId, ResolvedCommand } from '@mixo-geocore/editing/commands';
import { t } from '../i18n';
import { hint } from './hint';

/**
 * A button that shows one registry command (editing/commands): its label, its hint with the key
 * (or why it is off), its role (`primary` red, `destructive` danger), its pressed state and its
 * enabled state come from the row, and a press runs the command the row names. `locked`: the
 * control sits in a locked region, inert, so a click falls through to the panel's lock note.
 */
export function CommandButton({ command, run, className, locked = false, uiName, children }: {
  command: ResolvedCommand;
  run: (id: CommandId) => void;
  className?: string;
  locked?: boolean;
  /** The stable `data-ui` name designers style it by. */
  uiName?: string;
  children?: ReactNode;
}) {
  const reason = command.enabled ? undefined : command.disabledReason;
  const classes = [command.role === 'destructive' ? 'danger' : command.role === 'primary' ? 'primary' : undefined, className].filter(Boolean).join(' ');
  return <button
    {...(classes ? { className: classes } : {})}
    {...(locked ? { inert: '' } : {})}
    {...(uiName ? { 'data-ui': uiName } : {})}
    aria-pressed={command.pressed}
    onClick={() => run(command.runs)}
    disabled={!command.enabled}
    {...hint(reason?.key ?? command.hint, reason ? reason.vars : command.hintVars, reason ? undefined : command.shortcut)}
  >{t(command.label)}{children}</button>;
}
