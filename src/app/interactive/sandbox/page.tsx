import type { Metadata } from 'next';
import Link from 'next/link';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import Workbench from '@/components/workbench/Workbench';
import { portfolioData } from '@/content/portfolio';
export const metadata: Metadata = {
  title: 'Fieldwork sandbox | Mathematical tools',
  description: 'Build mathematical surfaces, run parameter sweeps, and review AI experiment plans.',
  alternates: { canonical: '/interactive/sandbox' },
  robots: { index: false, follow: true },
};
export default function SandboxPage() {
  return (
    <PortfolioShell wide resumeHref={portfolioData.contact.resumeHref}>
      <Link
        href="/interactive"
        style={{ display: 'inline-block', font: '12px var(--mono)', paddingTop: 20 }}
      >
        ← Return to research grounds
      </Link>
      <Workbench />
    </PortfolioShell>
  );
}
