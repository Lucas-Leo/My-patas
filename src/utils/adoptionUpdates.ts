const listeners = new Set<() => void>();

export function notifyAdoptionUpdate() {
  listeners.forEach(listener => listener());
}

export function subscribeAdoptionUpdates(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
