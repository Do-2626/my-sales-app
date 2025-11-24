'use client';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Settings for the application will be configured here.</p>
        <p className="mt-4 text-sm text-slate-600">For example, you could manage API keys, user profiles, or data export options.</p>
      </div>
    </div>
  );
}