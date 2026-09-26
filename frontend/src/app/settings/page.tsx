/**
 * Settings shell. Managing saved API keys / preferences is scoped in more
 * detail as later phases add features that need per-user settings.
 */
export default function SettingsPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-600">
        Preferences and saved settings will live here.
      </p>
    </section>
  );
}
