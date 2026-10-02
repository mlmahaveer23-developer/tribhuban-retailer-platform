import { getCurrentUser } from '@/lib/auth/session';
import { Navbar } from '@/components/layout/Navbar';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentUser={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>© 2026 Tribhuban Concepts Pvt. Ltd. All rights reserved. Confidential Internal System.</p>
      </footer>
    </div>
  );
}
