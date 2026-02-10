'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';
import dynamic from 'next/dynamic';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });
const LiquidGlassButton = dynamic(() => import('@/components/shared/ui/LiquidGlassButton'), {
  ssr: false,
});
const PORTFOLIO_CONTENT = {
  contact: {
    email: 'ghimirerijan199@gmail.com',
    github: 'https://github.com/Luseefor',
    linkedin: 'https://www.linkedin.com/in/rijan-ghimire-37ba4a2b0/',
    instagram: 'https://www.instagram.com/rijanghimire1/',
  },
};

export default function ContactSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.7);
  const [status, setStatus] = useState('Transmit Signal');

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(' transmitting...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Signal Received');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('Transmit Signal'), 3000);
      } else {
        setStatus('Transmission Failed');
        setTimeout(() => setStatus('Transmit Signal'), 3000);
      }
    } catch (error) {
      console.error('Transmission Error:', error);
      setStatus('Connection Error');
      setTimeout(() => setStatus('Transmit Signal'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const socialLinks = [
    { icon: Github, href: PORTFOLIO_CONTENT.contact.github },
    { icon: Linkedin, href: PORTFOLIO_CONTENT.contact.linkedin },
    { icon: Instagram, href: PORTFOLIO_CONTENT.contact.instagram },
    { icon: Mail, href: `mailto:${PORTFOLIO_CONTENT.contact.email}` },
  ];

  return (
    <section id="contact" className="relative py-32 px-6 md:px-12 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: themeColor }}
            />
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-slate-500">
              Transmission // OPEN
            </span>
          </div>
          <h2
            className={`font-black mb-6 md:mb-8 uppercase tracking-tighter leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.75rem)' }}
          >
            Get in{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeFade})` }}
            >
              Touch
            </span>
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light ${
              isDark ? 'text-slate-200' : 'text-slate-600'
            }`}
          >
            Ready to upgrade your digital infrastructure? establishing direct uplink...
          </p>
        </div>

        <FuturisticCard themeColor={themeColor} isDark={isDark} className="p-8 md:p-12 text-left">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">
                  Identity
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Full Name"
                  className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-opacity-50 transition-all font-mono text-sm ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-600'
                      : 'bg-white border border-black/10 text-slate-900 placeholder:text-slate-400'
                  }`}
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = themeColor)}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(15,23,42,0.12)')
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">
                  Frequency
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-opacity-50 transition-all font-mono text-sm ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-600'
                      : 'bg-white border border-black/10 text-slate-900 placeholder:text-slate-400'
                  }`}
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = themeColor)}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(15,23,42,0.12)')
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">
                Packet Data
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your project connection..."
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-opacity-50 transition-all font-mono text-sm resize-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-600'
                    : 'bg-white border border-black/10 text-slate-900 placeholder:text-slate-400'
                }`}
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = themeColor)}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(15,23,42,0.12)')
                }
              />
            </div>

            <LiquidGlassButton type="submit" className="w-full mt-6" icon={<Send size={18} />}>
              {status}
            </LiquidGlassButton>
          </form>
        </FuturisticCard>

        {/* Social Footer */}
        <div className="flex justify-center gap-6 mt-16">
          {socialLinks.map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, color: themeColor }}
              className={`transition-colors p-2 ${
                isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <item.icon size={24} />
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <div className={`mt-12 text-xs font-mono uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
          <p>
            &copy; {new Date().getFullYear()} Rijan Ghimire.{' '}
            <span className="hidden md:inline">All rights reserved.</span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
