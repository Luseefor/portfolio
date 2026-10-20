export const projectImages: Record<
  string,
  { src: string; width: number; height: number; alt: string; caption: string }
> = {
  'synthex-ui': {
    src: '/images/projects/synthex-ui.png',
    width: 1440,
    height: 900,
    alt: 'Synthex UI component examples in the live preview',
    caption: 'Component examples from the public Synthex UI preview.',
  },
  vinculum: {
    src: '/images/projects/vinculum.png',
    width: 1600,
    height: 1000,
    alt: 'Vinculum editor showing a mathematical surface and its expression',
    caption:
      'The Vinculum editor, with an expression, plotted surface, and inspector. Screenshot from the repository.',
  },
  faredelta: {
    src: '/images/projects/faredelta.png',
    width: 1200,
    height: 369,
    alt: 'FareDelta flexible-date search form with nearby-airport options',
    caption:
      'Flexible departure windows and nearby airports in the FareDelta search form. Screenshot from the repository.',
  },
};
