import { useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tiltAmount?: number;
  glowColor?: string;
}

export default function TiltCard({
  children,
  className = "",
  style = {},
  tiltAmount = 12,
  glowColor = "rgba(212, 168, 67, 0.25)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltAmount;
    const rotateY = ((x - centerX) / centerX) * tiltAmount;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale3d(1.01, 1.01, 1.01)`;
    card.style.transition = "transform 0.1s ease-out";

    // Move glow to follow mouse
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    glow.style.background = `radial-gradient(600px circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 60%)`;
    glow.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)";
    card.style.transition = "transform 0.4s ease-out";
    glow.style.opacity = "0";
    glow.style.transition = "opacity 0.4s ease-out";
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <div
        ref={cardRef}
        className={className}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          willChange: "transform",
          backfaceVisibility: "hidden",
          ...style,
        }}
      >
        {/* Mouse-following glow */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 1,
            mixBlendMode: "screen",
          }}
        />
        {children}
      </div>
    </div>
  );
}
