import { socialImage } from '@/lib/social-image';
export const alt = 'Fieldwork. An open mathematical workbench by Rijan Ghimire.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return socialImage('Fieldwork', 'Open mathematical workbench');
}
