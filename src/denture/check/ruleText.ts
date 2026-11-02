import { t } from '../../i18n';
import type { RuleReason } from './ruleSpots';

/** Why the denture rules leave a spot unsupported, in plain words (a spot the check lists grey, "accepted by rule"). */
const TEXT: Record<RuleReason, string> = {
  'outside-allowed': 'Supports stand only on the outer side of the denture.',
  'no-support': 'Supports are not allowed on this side of the denture.',
  rim: 'The rim has its own line of supports.',
};

export const ruleReasonText = (reason: RuleReason): string => t(TEXT[reason]);

/** The keys, for the translation tests. */
export const RULE_REASON_KEYS = Object.values(TEXT);
