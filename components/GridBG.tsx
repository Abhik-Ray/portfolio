import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface GridBGProps {
    contactRef?: React.RefObject<HTMLDivElement | null>;
}

// The grid was designed on an 800-unit-wide canvas stretched to the screen width.
const DESIGN_WIDTH = 800;
const TILE = 100; // grid spacing, in design units
const STROKE = 0.5; // line width, in design units
const DRIFT = 50; // max mouse drift either way, in design units

const PRIMARY_COLOR = "oklch(0.87 0.148144 202.8755)";
const FOREGROUND_COLOR = "oklch(0.3 0.148144 202.8755)";

function useDesignScale() {
    const [scale, setScale] = useState(() =>
        typeof window === "undefined" ? 1 : window.innerWidth / DESIGN_WIDTH,
    );
    useEffect(() => {
        const onResize = () => setScale(window.innerWidth / DESIGN_WIDTH);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return scale;
}

function GridLines({ color, scale, id }: { color: string; scale: number; id: string }) {
    const tile = TILE * scale;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <defs>
                <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
                    <line x1="0" y1={tile} x2={tile} y2={tile} stroke={color} strokeWidth={STROKE * scale} />
                    <line x1={tile} y1="0" x2={tile} y2={tile} stroke={color} strokeWidth={STROKE * scale} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
    );
}

/**
 * Animated grid background.
 *
 * The grid is drawn once and only moved (transform) and cross-faded (opacity),
 * which the browser does on the GPU without repainting. Animating the SVG
 * pattern or its stroke colour directly forced a full-screen repaint every
 * frame while scrolling and for seconds after each mouse move.
 */
export default function GridBG({ contactRef }: GridBGProps) {
    const scale = useDesignScale();

    // Track mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Slow, heavily damped follow for the drift effect
    const patternX = useSpring(mouseX, { stiffness: 20, damping: 110 });
    const patternY = useSpring(mouseY, { stiffness: 20, damping: 110 });

    // Map mouse position to a pixel offset of -DRIFT..DRIFT design units
    const toOffset = (v: number, size: number) =>
        (Math.min(Math.max(v / size, 0), 1) * 2 - 1) * DRIFT * scale;
    const x = useTransform(patternX, (v) => toOffset(v, window.innerWidth));
    const y = useTransform(patternY, (v) => toOffset(v, window.innerHeight));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // Track scroll progress from start until hero parent div is completely off screen
    const { scrollYProgress } = useScroll({
        offset: ["0vh", "100vh"],
    });

    // Track scroll progress for Contact section
    const { scrollYProgress: contactScrollProgress } = useScroll({
        target: contactRef,
        offset: ["start end", "start start"],
    });

    // How much of the bright grid shows over the dim one: bright in the hero,
    // fading to dim as you scroll, then bright again approaching Contact.
    const brightOpacity = useTransform(
        [scrollYProgress, contactScrollProgress],
        ([hero, contact]) => {
            const contactVal = contact as number;
            if (contactVal > 0) return Math.min(contactVal, 1);
            return 1 - Math.min(hero as number, 1);
        },
    );

    // Oversize the moving layer by one tile on each side so drifting never
    // exposes an edge; a whole tile keeps the lines where they were.
    const margin = TILE * scale;

    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0" style={{ opacity: 0.6 }}>
                <motion.div
                    className="absolute"
                    style={{ x, y, inset: -margin, willChange: "transform" }}
                >
                    <GridLines id="grid-dim" color={FOREGROUND_COLOR} scale={scale} />
                    <motion.div
                        className="absolute inset-0"
                        style={{ opacity: brightOpacity, willChange: "opacity" }}
                    >
                        <GridLines id="grid-bright" color={PRIMARY_COLOR} scale={scale} />
                    </motion.div>
                </motion.div>
            </div>
            {/* Interlacing overlay for CRT screen effect (static) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
                <defs>
                    <pattern id="interlace" width="100%" height={4 * scale} patternUnits="userSpaceOnUse">
                        <rect width="100%" height={2 * scale} fill="white" fillOpacity="0.03" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#interlace)" />
            </svg>
        </div>
    );
}
