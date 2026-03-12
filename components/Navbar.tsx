'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Upload, 
  Brain, 
  MessageSquare, 
  CreditCard, 
  LayoutDashboard, 
  User, 
  LogOut,
  Menu,
  X,
  Home // <-- Just add this right here
} from 'lucide-react';

// --- Navigation Data ---
const NAV_LINKS = [
  { href: '/upload', label: 'Analyze', icon: Upload },
  { href: '/practice', label: 'Practice', icon: Brain },
  { href: '/examples', label: 'Examples', icon: MessageSquare },
  { href: '/upgrade', label: 'Pricing', icon: CreditCard },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ── DESKTOP NAVBAR ───────────────────────────────────────────── */}
      <nav className="hidden md:flex sticky top-0 z-40 h-[72px] w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-8 items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 z-10 group">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-2 h-2 rounded-full bg-[#0a0a0a]" />
          </div>
          <span className="font-semibold tracking-tight text-white text-lg">
            ConvoCoach
          </span>
        </Link>

        {/* Center: Absolute Centered Navigation */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth & Upgrade */}
        <div className="flex items-center gap-4 z-10">
          <Link href="/upgrade">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-[0_0_20px_rgba(139,92,246,0.15)]"
            >
              Upgrade to Pro
            </motion.button>
          </Link>

          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none flex items-center justify-center rounded-full ring-2 ring-transparent hover:ring-white/10 transition-all"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={36}
                    height={36}
                    className="rounded-full border border-white/10"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-zinc-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* Minimal Desktop Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-1.5 z-50 backdrop-blur-xl"
                  >
                    <div className="px-3 py-3 border-b border-white/5 mb-1">
                      <p className="text-[14px] font-medium text-white truncate leading-tight">{session.user?.name}</p>
                      <p className="text-[12px] text-zinc-500 truncate mt-0.5">{session.user?.email}</p>
                    </div>
                    
                    <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" /> Dashboard
                    </Link>
                    
                    <div className="h-px bg-white/5 my-1" />
                    
                    <button 
                      onClick={() => { setIsDropdownOpen(false); signOut(); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-[14px] font-medium text-zinc-300 hover:text-white transition-colors ml-2"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ── MOBILE TOP BAR ─────────────────────────────────────────────── */}
      <nav className="md:hidden flex items-center justify-between px-5 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 z-10" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
          </div>
          <span className="font-semibold tracking-tight text-white text-base">ConvoCoach</span>
        </Link>
        
        <div className="flex items-center gap-3 z-10">
          <Link href="/upgrade" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="bg-violet-500 text-white text-[11px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-lg shadow-sm">
              Pro
            </button>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE SLIDING SIDE DRAWER ────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-[80vw] max-w-[320px] bg-[#050505] border-l border-white/10 z-50 flex flex-col md:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <span className="font-medium text-zinc-400 text-sm tracking-widest uppercase">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${pathname === '/' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                  <Home className="w-5 h-5" /> Home
                </Link>
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${pathname === link.href ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                    <link.icon className="w-5 h-5" /> {link.label}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer (Auth & User) */}
              <div className="p-5 border-t border-white/5 bg-[#0a0a0a]">
                {session ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="" width={40} height={40} className="rounded-full border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{session.user?.name}</div>
                        <div className="text-xs text-zinc-500 truncate">{session.user?.email}</div>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 w-full bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" /> My Dashboard
                    </Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setIsMobileMenuOpen(false); signIn('google'); }} className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-[15px] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                    Sign in to Account
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}