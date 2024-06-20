import { writable } from 'svelte/store'

// All nodes and connections from dataset
export const dataStore = writable({ nodes: [], links: [] });
// Filtered groups of nodes to visualize, categorized by degrees
export const filteredGroupsStore = writable([]);
// Filtered range of nodes to visualize, based individually on degrees
export const filteredThresholdStore = writable({
    value: 0,
    max: 0
});
// List of all groups
export const groupStore = writable([]);