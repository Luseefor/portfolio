'use client';

import { Globe, Cpu, Server } from 'lucide-react';
import { portfolioData, type ServiceIconKey } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

const SERVICE_ICONS: Record<ServiceIconKey, typeof Globe> = {
  globe: Globe,
  cpu: Cpu,
  server: Server,
};

export default function ServicesPanel({ theme }: ChestPanelTemplateProps) {
  return (
    <div className="space-y-3">
      {portfolioData.services.map((service) => {
        const Icon = SERVICE_ICONS[service.icon];
        return (
          <div
            key={service.id}
            className="rounded-2xl border border-white/10 bg-gradient-to-r from-black/45 to-white/[0.02] p-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg border border-white/10 p-2" style={{ color: theme.accent }}>
                <Icon size={14} />
              </div>
              <h4 className="text-base font-bold text-stone-100">{service.title}</h4>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">{service.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
