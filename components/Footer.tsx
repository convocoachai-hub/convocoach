'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import logoImg from '@/app/logo.png'; // Using your custom logo

const FOOTER_LINKS = {
  Product: [
    { label: 'Analyze Chat', href: '/upload' },
    { label: 'Practice Mode', href: '/practice' },
    { label: 'Examples', href: '/examples' },
    { label: 'Pricing', href: '/upgrade' },
  ],
  Resources: [
    { label: 'Dating Psychology', href: '#' },
    { label: 'Texting Guides', href: '#' },
    { label: 'Attraction Signals', href: '#' },
    { label: 'Help Center', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-16 md:pt-24 pb-10 px-6 font-sans overflow-hidden">
      
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Section: Brand & Links */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:w-2/5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <Image 
                src={logoImg} 
                alt="ConvoCoach Logo" 
                width={32} 
                height={32} 
                className="object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-semibold tracking-tight text-white text-xl">
                ConvoCoach
              </span>
            </Link>
            <p className="text-[14px] text-zinc-400 leading-relaxed max-w-sm">
              Stop guessing if they like you. Advanced AI conversation intelligence to detect attraction, fix dry texts, and stop you from being left on read.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns (2 cols on mobile, 3 cols on desktop) */}
          <div className="lg:w-3/5 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-5">
                <h4 className="text-white font-medium text-[15px] tracking-tight">{title}</h4>
                <ul className="flex flex-col gap-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="text-[14px] text-zinc-500 hover:text-zinc-200 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright & Divider */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-[13px] text-zinc-600 font-medium">
            © {new Date().getFullYear()} ConvoCoach. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[13px] text-zinc-600 font-medium">
            <span>Built for people who want to be impossible to ignore.</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}