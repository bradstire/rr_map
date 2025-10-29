import { useCallback, useRef, useState, useEffect } from 'react';
import styles from './redrocks.module.css';

type Pin = {
  id: string;
  xPercent: number;
  yPercent: number;
  xOffset?: number; // Pixel offset in rendered coordinates
  yOffset?: number; // Pixel offset in rendered coordinates
};

// Coordinates from your grid reference image
const SAMPLE_PINS: Pin[] = [
  { id: 'p1', xPercent: 49, yPercent: 63, yOffset: 9 }, // 60% of 15px down
  { id: 'p2', xPercent: 59, yPercent: 66, xOffset: 9 }, // 60% of 15px right
  { id: 'p3', xPercent: 36, yPercent: 52, xOffset: 438, yOffset: -198 }, // +90px (60% of +150px) more to the right
  { id: 'p4', xPercent: 64, yPercent: 55, xOffset: 69 }, // 60% of +115px right
  { id: 'p5', xPercent: 49, yPercent: 55, xOffset: -81 }, // -90 + 9 (60% of 15px right)
  { id: 'p6', xPercent: 36, yPercent: 38, xOffset: 87, yOffset: 6 }, // 90 - 3 (60% of 5px left)
  { id: 'p7', xPercent: 49, yPercent: 45, xOffset: -120, yOffset: 84 }, // -129 + 9 (60% of 15px right)
  { id: 'p8', xPercent: 44, yPercent: 45, xOffset: -162 }, // 60% of requested: 162px left
];

export default function RedRocksMap() {
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [imageBounds, setImageBounds] = useState<{ width: number; height: number; left: number; top: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const openExpanded = useCallback((pinId: string) => {
    setActivePinId(pinId);
    setHoveredPinId(null); // Hide hover when expanded
  }, []);

  const closeExpanded = useCallback(() => {
    setActivePinId(null);
  }, []);

  // Calculate image bounds for accurate pixel positioning
  useEffect(() => {
    const updateBounds = () => {
      if (imageRef.current && wrapperRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        setImageBounds({
          width: rect.width,
          height: rect.height,
          left: rect.left - wrapperRect.left,
          top: rect.top - wrapperRect.top,
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    const img = imageRef.current;
    if (img) {
      img.addEventListener('load', updateBounds);
    }

    return () => {
      window.removeEventListener('resize', updateBounds);
      if (img) {
        img.removeEventListener('load', updateBounds);
      }
    };
  }, []);

  return (
    <div className={styles.pageRoot}>
      <div className={styles.mapWrapper} ref={wrapperRef} onClick={activePinId ? closeExpanded : undefined}>
        <img
          ref={imageRef}
          className={styles.mapImage}
          src="/redrocksmap_.png"
          alt="Red Rocks map"
          onLoad={() => {
            if (imageRef.current && wrapperRef.current) {
              const rect = imageRef.current.getBoundingClientRect();
              const wrapperRect = wrapperRef.current.getBoundingClientRect();
              setImageBounds({
                width: rect.width,
                height: rect.height,
                left: rect.left - wrapperRect.left,
                top: rect.top - wrapperRect.top,
              });
            }
          }}
        />
        {imageBounds && SAMPLE_PINS.map((pin) => {
          // Calculate pixel position based on actual rendered image size
          const pixelX = imageBounds.left + (pin.xPercent / 100) * imageBounds.width + (pin.xOffset || 0);
          const pixelY = imageBounds.top + (pin.yPercent / 100) * imageBounds.height + (pin.yOffset || 0);
          
          return (
            <button
              key={pin.id}
              className={styles.pinButton}
              style={{ 
                left: `${pixelX}px`, 
                top: `${pixelY}px`,
                backgroundImage: `url('/pin.png')`,
                backgroundSize: '40px 40px',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center bottom'
              }}
              onMouseEnter={() => !activePinId && setHoveredPinId(pin.id)}
              onMouseLeave={() => setHoveredPinId((id) => (id === pin.id ? null : id))}
              onClick={() => openExpanded(pin.id)}
              aria-label={`Open view for pin ${pin.id}`}
            />
          );
        })}
        {/* Hover cards rendered separately to ensure they appear above pins */}
        {imageBounds && hoveredPinId && !activePinId && (() => {
          const pin = SAMPLE_PINS.find(p => p.id === hoveredPinId);
          if (!pin) return null;
          const pixelX = imageBounds.left + (pin.xPercent / 100) * imageBounds.width + (pin.xOffset || 0);
          const pixelY = imageBounds.top + (pin.yPercent / 100) * imageBounds.height + (pin.yOffset || 0);
          return (
            <div
              key={`hover-${pin.id}`}
              className={styles.hoverCard}
              style={{
                left: `${pixelX}px`,
                top: `${pixelY - 277}px`, // Position above pin (52px gap + 225px card height)
              }}
              onMouseEnter={() => setHoveredPinId(pin.id)}
              onMouseLeave={() => setHoveredPinId(null)}
              onClick={() => openExpanded(pin.id)}
            >
              <div className={styles.hoverBadge}>CHEAPEST</div>
              <div className={styles.hoverImageWrap}>
                <img src={`/assets/${pin.id.replace('p', '').padStart(2, '0')}_rr.png`} alt={`Pin ${pin.id.replace('p', '')} reference`} />
              </div>
            </div>
          );
        })()}
        {/* Expanded image view - inline on the map */}
        {imageBounds && activePinId && (() => {
          const pin = SAMPLE_PINS.find(p => p.id === activePinId);
          if (!pin) return null;
          return (
            <div
              className={styles.expandedCard}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} aria-label="Close" onClick={closeExpanded}>×</button>
              <div className={styles.expandedBadge}>CHEAPEST</div>
              <div className={styles.expandedImageWrap}>
                <img src={`/assets/${pin.id.replace('p', '').padStart(2, '0')}_rr.png`} alt={`Pin ${pin.id.replace('p', '')} expanded view`} />
              </div>
            </div>
          );
        })()}
        {!imageBounds && <div style={{ display: 'none' }}>Loading map...</div>}
      </div>
    </div>
  );
}


