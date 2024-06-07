import { writable } from 'svelte/store'

// All nodes and connections from dataset
export const dataStore = writable({ nodes: [], links: [] });
// Filtered nodes to visualize
export const filteredStore = writable([]);
// List of all groups
export const groupStore = writable([]);