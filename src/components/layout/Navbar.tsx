'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppUser, UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  PlusCircle, 
  ClipboardCheck, 
  ShieldCheck, 
  BarChart3, 
  CalendarClock, 
  Menu, 
  X, 
  UserCircle2,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentUser: AppUser;
}

export function Navbar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setRoleSwitchOpen(false);
    let email = 'coordinator@tribhuban.com';
    let full_name = 'Suresh Coordinator';
    let id = 'user_coord_1';

    if (role === 'admin') {
      email = 'admin@tribhuban.com';
      full_name = 'Mahaveer Admin';
      id = 'user_admin_1';
    } else if (role === 'reviewer') {
      email = 'reviewer@tribhuban.com';
      full_name = 'Pooja Commercial Reviewer';
      id = 'user_reviewer_1';
    }

    const updatedUser: AppUser = {
      id,
      email,
      full_name,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Store in cookie for session persistence
    document.cookie = `tribhuban_auth_user=${JSON.stringify(updatedUser)}; path=/; max-age=86400; SameSite=Lax`;
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Building2 },
    { href: '/retailers/new', label: '+ New Retailer', icon: PlusCircle, roles: ['coordinator', 'admin'] },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin', label: 'Admin Hub', icon: ShieldCheck, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(
    (l) => !l.roles || l.roles.includes(currentUser.role)
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                T
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-navy-900 leading-none tracking-tight">TRIBHUBAN</span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Retailer Platform</span>
              </div>
            </Link>
            <Badge variant="default" className="hidden sm:inline-flex text-[10px] tracking-wide">
              V1
            </Badge>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Role indicator and user profile switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 transition"
              >
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">{currentUser.full_name}</span>
                <Badge
                  variant={
                    currentUser.role === 'admin'
                      ? 'danger'
                      : currentUser.role === 'reviewer'
                      ? 'warning'
                      : 'info'
                  }
                  className="uppercase text-[9px] px-1.5 py-0"
                >
                  {currentUser.role}
                </Badge>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {roleSwitchOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 text-xs">
                  <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                    <p className="font-medium text-slate-900">Switch Active Role</p>
                    <p className="text-[11px] text-slate-500">Preview RBAC & workflows</p>
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('coordinator')}
                    className={`w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'coordinator' ? 'font-semibold text-brand-600 bg-brand-50' : 'text-slate-700'
                    }`}
                  >
                    <span>COORDINATOR</span>
                    <span className="text-[10px] text-slate-400">Field sales</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('reviewer')}
                    className={`w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'reviewer' ? 'font-semibold text-amber-600 bg-amber-50' : 'text-slate-700'
                    }`}
                  >
                    <span>REVIEWER</span>
                    <span className="text-[10px] text-slate-400">Assessment</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'admin' ? 'font-semibold text-rose-600 bg-rose-50' : 'text-slate-700'
                    }`}
                  >
                    <span>ADMIN</span>
                    <span className="text-[10px] text-slate-400">Full control</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
