import { redirect } from 'next/navigation';

export default function HomePage() {
  // In a real app, this page could be a landing page or a login form.
  // For this migration, we'll redirect directly to the dashboard.
  redirect('/dashboard');
}