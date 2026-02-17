'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';
import dynamic from 'next/dynamic';
import { PORTFOLIO_CONTENT } from './portfolio-template';
import { ContactSocialLinks } from './contact-section/ContactSocialLinks';
import { useContactForm } from './contact-section/useContactForm';

const FuturisticCard = dynamic(() => import('./FuturisticCard'), { ssr: false });
const LiquidGlassButton = dynamic(() => import('@/components/shared/ui/LiquidGlassButton'), {
  ssr: false,
});

export default function ContactSection() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );
  const themeFade = hexToRgba(themeColor, isDark ? 0.35 : 0.7);
  const { status, formData, handleSubmit, handleChange } = useContactForm();

  const socialLinks = PORTFOLIO_CONTENT.socials.links;

  return (
    <section id="contact" className="relative py-32 px-6 md:px-12 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
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
            Ready to upgrade your digital infrastructure? Establishing direct uplink...
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
              />
            </div>

            <LiquidGlassButton type="submit" className="w-full mt-6" icon={<Send size={18} />}>
              {status}
            </LiquidGlassButton>
          </form>
        </FuturisticCard>

        <ContactSocialLinks socialLinks={socialLinks} isDark={isDark} themeColor={themeColor} />
      </motion.div>
    </section>
  );
}
