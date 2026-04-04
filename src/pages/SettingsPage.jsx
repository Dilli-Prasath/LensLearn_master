/**
 * SettingsPage — Wraps SettingsPanel with store bindings.
 */
import SettingsPanel from '../components/SettingsPanel';
import { useSettingsStore, useConnectionStore } from '../store';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const connectionStatus = useConnectionStore((s) => s.status);

  // SettingsPanel expects { settings, onChange, connectionStatus }
  // We create a compatible onChange that merges into the store
  const handleChange = (updater) => {
    if (typeof updater === 'function') {
      const current = useSettingsStore.getState();
      const next = updater(current);
      useSettingsStore.getState().updateSettings(next);
    } else {
      useSettingsStore.getState().updateSettings(updater);
    }
  };

  return (
    <SettingsPanel
      settings={settings}
      onChange={handleChange}
      connectionStatus={connectionStatus}
    />
  );
}
