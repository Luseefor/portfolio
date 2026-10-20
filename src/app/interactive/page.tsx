import type { Metadata } from 'next';
import PortfolioShell from '@/components/portfolio/PortfolioShell';
import FieldworkGame from '@/components/fieldwork/FieldworkGame';
import { portfolioData } from '@/content/portfolio';
const title = 'Fieldwork | Open mathematical workbench';
const description =
  'Drive a survey rover through a mathematical research courtyard, calibrate a wave table, and record a verified experiment.';
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/interactive' },
  openGraph: { title, description, type: 'website', url: '/interactive' },
  twitter: { card: 'summary_large_image', title, description },
};
export default function InteractivePage() {
  return (
    <PortfolioShell resumeHref={portfolioData.contact.resumeHref} wide>
      <FieldworkGame />
    </PortfolioShell>
  );
}
