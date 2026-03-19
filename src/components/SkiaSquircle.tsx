import { Group, Path, Skia, SkPath } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';

export interface SkiaSquircleProps {
    x: number;
    y: number;
    width: number;
    height: number;
    power?: number; // e.g., 4 for squircle, 2 for circle
    segments?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    backgroundOpacity?: number;
    strokeOpacity?: number;
    style?: 'fill' | 'stroke' | 'both';
}

// Global cache to avoid heavy CPU math on every frame/component
const UNIT_PATH_CACHE: Record<string, SkPath> = {};

export const getUnitSquirclePath = (power: number, segments: number): SkPath => {
    const key = `${power}-${segments}`;
    if (UNIT_PATH_CACHE[key]) return UNIT_PATH_CACHE[key];

    const p = Skia.Path.Make();
    const cx = 0.5;
    const cy = 0.5;
    const a = 0.5;
    const b = 0.5;

    for (let i = 0; i <= segments; i++) {
        const theta = (2 * Math.PI * i) / segments;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const rX = a * Math.pow(Math.abs(cosT), 2 / power);
        const rY = b * Math.pow(Math.abs(sinT), 2 / power);
        const px = cx + (cosT >= 0 ? 1 : -1) * rX;
        const py = cy + (sinT >= 0 ? 1 : -1) * rY;

        if (i === 0) p.moveTo(px, py);
        else p.lineTo(px, py);
    }
    p.close();

    UNIT_PATH_CACHE[key] = p;
    return p;
};

/**
 * Superellipse / Squircle component for Skia.
 * Performance optimized using Unit Path Caching and GPU-side scaling.
 */
export const SkiaSquircle: React.FC<SkiaSquircleProps> = ({
    x,
    y,
    width,
    height,
    power = 2.8,         // Lowered to 2.8 for a softer, more organic "curvy" feel
    segments = 48,
    color,
    strokeColor,
    strokeWidth = 2.0,   // Increased from 1.5 for better visibility
    backgroundOpacity = 1,
    strokeOpacity = 1,
    style = 'fill',
}) => {
    const unitPath = useMemo(() => getUnitSquirclePath(power, segments), [power, segments]);

    // Apply translation and scaling on the GPU via Group transform
    // We scale the 1x1 unit path to width x height and move to x, y
    return (
        <Group transform={[{ translateX: x }, { translateY: y }, { scaleX: width }, { scaleY: height }]}>
            {(style === 'fill' || style === 'both') && color && (
                <Path
                    path={unitPath}
                    color={color}
                    opacity={backgroundOpacity}
                    style="fill"
                    antiAlias={true}
                />
            )}

            {(style === 'stroke' || style === 'both' || strokeColor) && (
                <Path
                    path={unitPath}
                    color={strokeColor || color}
                    opacity={strokeOpacity}
                    style="stroke"
                    strokeWidth={strokeWidth / Math.max(width, height)} // Compensate for Group scale
                    antiAlias={true}
                    strokeCap="round"
                    strokeJoin="round"
                />
            )}
        </Group>
    );
};
