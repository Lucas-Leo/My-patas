import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { subscribeAdoptionUpdates } from '../src/utils/adoptionUpdates';

// Poll only the visible screen, without overlapping requests or background traffic.
export function useAdoptionRefresh(load: (isCurrent: () => boolean) => Promise<void>, key = '') {
  const callback = useRef(load);
  callback.current = load;
  useFocusEffect(useCallback(() => {
    let active = true;
    let busy = false;
    let pending = false;
    let revision = 0;
    const visible = () => active && AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
    const refresh = async () => {
      if (!visible()) return;
      if (busy) { pending = true; revision++; return; }
      busy = true;
      const version = ++revision;
      try {
        await callback.current(() => visible() && version === revision);
      } catch {
        // Keep the last successful data; the next refresh retries.
      } finally {
        busy = false;
        if (pending && visible()) { pending = false; void refresh(); }
      }
    };
    void refresh();
    const timer = setInterval(() => { if (!busy) void refresh(); }, 5000);
    const unsubscribe = subscribeAdoptionUpdates(() => { void refresh(); });
    const appState = AppState.addEventListener('change', state => {
      revision++;
      if (state === 'active') void refresh();
    });
    return () => { active = false; clearInterval(timer); unsubscribe(); appState.remove(); };
  }, [key]));
}
