'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

const SOCIAL_ICON_BY_KIND = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

type SocialLink = {
  kind: keyof typeof SOCIAL_ICON_BY_KIND;
  url: string;
};

type ContactSocialLinksProps = {
  socialLinks: SocialLink[];
  isDark: boolean;
  themeColor: string;
};

export function ContactSocialLinks({ socialLinks, isDark, themeColor }: ContactSocialLinksProps) {
  return (
    <>
      <div className="flex justify-center gap-6 mt-16">
        {socialLinks.map((item, index) => {
          const Icon = SOCIAL_ICON_BY_KIND[item.kind];
          return (
            <motion.a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, color: themeColor }}
              className={`transition-colors p-2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Icon size={24} />
            </motion.a>
          );
        })}
      </div>

      <div className={`mt-12 text-xs font-mono uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
        <p>
          &copy; {new Date().getFullYear()} Rijan Ghimire.{' '}
          <span className="hidden md:inline">All rights reserved.</span>
        </p>
      </div>
    </>
  );
}
