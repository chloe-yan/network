// Buckets used to group nodes by their degrees, boundaries are inclusive
export const degreeBuckets = [
    { id: '0', min: 0, max: 5 },
    { id: '1', min: 6, max: 10 },
    { id: '2', min: 11, max: 20 },
    { id: '3', min: 21, max: 30 },
    { id: '4', min: 30, max: null },
]

// Various metrics for comparing nodes
export const metrics = ['Degree', 'Closeness', 'Betweenness']

// Picks color from gradient scale, used to color nodes based on metric
export function mix(pct, color1 = [232, 52, 148], color2 = [52, 130, 232]) {
    let rgb = [
        Math.round(color1[0] * pct + color2[0] * (1 - pct)),
        Math.round(color1[1] * pct + color2[1] * (1 - pct)),
        Math.round(color1[2] * pct + color2[2] * (1 - pct))
    ];
    return rgb;
}