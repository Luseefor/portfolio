import { socialImage } from '@/lib/social-image';
export const alt = 'Small steps. Growing errors. An interactive paper by Rijan Ghimire.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return socialImage('Small steps. Growing errors.', 'Interactive paper / 01');
}
