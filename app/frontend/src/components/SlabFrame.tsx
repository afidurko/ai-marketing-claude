import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '../api';

export interface SlabFrameProps {
  src: string;
  alt: string;
  grader?: string;
  grade?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  showCert?: boolean;
  rarity?: string;
  className?: string;
  children?: ReactNode;
}

export function SlabFrame({
  src,
  alt,
  grader = 'PSA',
  grade = '8',
  size = 'md',
  interactive = true,
  showCert = true,
  rarity,
  className = '',
  children,
}: SlabFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [loaded, setLoaded] = useState(false);

  const handleMove = (e: MouseEvent) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (x - 0.5) * 14, y: (0.5 - y) * 14 });
    setGlare({ x: x * 100, y: y * 100 });
  };

  const handleLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  };

  return (
    <div
      ref={ref}
      className={`slab-frame slab-frame--${size} ${interactive ? 'slab-frame--interactive' : ''} ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        interactive
          ? {
              transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            }
          : undefined
      }
    >
      <div className="slab-case">
        <div className="slab-case-inner">
          <div className="slab-card-window">
            {!loaded && <div className="slab-shimmer" />}
            <img
              src={resolveImageUrl(src)}
              alt={alt}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={loaded ? 'slab-img loaded' : 'slab-img'}
            />
            <div
              className="slab-holo"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.45) 0%, transparent 45%), linear-gradient(115deg, transparent 30%, rgba(201,162,39,0.15) 45%, rgba(139,26,26,0.08) 55%, transparent 70%)`,
              }}
            />
            <div className="slab-sweep" />
            <div className="slab-grain" aria-hidden />
          </div>

          {showCert && (
            <div className="slab-cert-label">
              <span className="slab-cert-grader">{grader}</span>
              <span className="slab-cert-grade">{grade}</span>
            </div>
          )}

          {rarity === 'Legendary' && <div className="slab-legendary-glow" aria-hidden />}
        </div>
        <div className="slab-case-edge slab-case-edge--left" />
        <div className="slab-case-edge slab-case-edge--right" />
      </div>
      {children}
    </div>
  );
}

/** Floating hero slab with ambient animation */
export function HeroSlab({ src, alt, grader, grade }: Pick<SlabFrameProps, 'src' | 'alt' | 'grader' | 'grade'>) {
  return (
    <motion.div
      className="hero-slab-wrap"
      initial={{ opacity: 0, y: 30, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: -4 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-4, -2, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SlabFrame src={src} alt={alt} grader={grader} grade={grade} size="hero" interactive />
      </motion.div>
      <div className="hero-slab-shadow" aria-hidden />
    </motion.div>
  );
}

/** Full-size viewer for modals with subtle zoom on hover */
export function SlabViewer({
  src,
  alt,
  grader,
  grade,
  playerName,
  year,
  setName,
}: {
  src: string;
  alt: string;
  grader: string;
  grade: string;
  playerName: string;
  year: number;
  setName: string;
}) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="slab-viewer">
      <div
        className={`slab-viewer-stage ${zoomed ? 'zoomed' : ''}`}
        onClick={() => setZoomed(!zoomed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setZoomed(!zoomed)}
        aria-label={zoomed ? 'Zoom out slab' : 'Zoom in slab'}
      >
        <SlabFrame src={src} alt={alt} grader={grader} grade={grade} size="lg" interactive showCert />
      </div>
      <p className="slab-viewer-hint">{zoomed ? 'Click to zoom out' : 'Click slab to inspect'}</p>
      <div className="slab-viewer-meta">
        <span>{year} {setName}</span>
        <span>{grader} {grade}</span>
        <span>{playerName}</span>
      </div>
    </div>
  );
}
