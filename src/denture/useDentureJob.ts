import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { PrintScene, SceneCommand } from '../state/project';
import type { ViewRequest } from '../components/viewport/types';
import { createDentureWorker } from '../workers/factories';
import { DentureClient } from './engine/dentureClient';
import { isDentureJob } from './jobKind';
import { useDentureOrient } from './steps/orient/useDentureOrient';

/*
 * The denture job's entry for App (src/denture): it owns the denture worker client and wires each step's hook.
 * App asks `active` to choose between the aligner flow and this one; every engine call goes through the client.
 */

export interface DentureJobHost {
  dispatch: (command: SceneCommand) => void;
  send: (event: SessionEvent) => void;
  sceneRef: MutableRefObject<PrintScene>;
  sessionRef: MutableRefObject<EditSession>;
  session: EditSession;
  freeTransform: boolean;
  setStatus: (key: string, vars?: Record<string, string | number>) => void;
  requestView: (kind: ViewRequest['kind']) => void;
}

export function useDentureJob(host: DentureJobHost) {
  const clientRef = useRef<DentureClient>();
  const client = useCallback(() => (clientRef.current ??= new DentureClient(createDentureWorker)), []);
  useEffect(() => () => clientRef.current?.dispose(), []);
  const orient = useDentureOrient({ ...host, client });
  return { active: isDentureJob(host.session.dentalProfile), client, orient };
}
