import { createExtensionPoint, createRegistry } from '../core/registry.js';

export const workspaceExtensions = createExtensionPoint('pracovní plochy');

const stepKinds = createRegistry('Druh kroku');

export function registerStepKind(entry) {
  if (typeof entry?.kind !== 'string' || typeof entry.createEditor !== 'function') {
    throw new Error('Druh kroku potřebuje kind a createEditor(host, options)');
  }
  return stepKinds.add({ id: entry.kind, ...entry });
}

export function stepKind(kind) {
  return stepKinds.get(kind);
}
