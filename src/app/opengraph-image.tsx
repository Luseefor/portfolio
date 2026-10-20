import { socialImage } from '@/lib/social-image';
export const alt = 'Rijan Ghimire, software engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return socialImage('Mathematical software, developer tools, and web apps.', 'Selected work');
}
