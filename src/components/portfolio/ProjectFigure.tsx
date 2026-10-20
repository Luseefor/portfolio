import Image from 'next/image';
import { projectImages } from '@/content/project-images';
import styles from './portfolio.module.css';

export default function ProjectFigure({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const image = projectImages[slug];
  if (!image) return null;
  return (
    <figure className={compact ? styles.projectPreview : styles.projectFigure}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={compact ? '(max-width: 640px) 100vw, 320px' : '(max-width: 864px) 100vw, 800px'}
      />
      {!compact ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}
