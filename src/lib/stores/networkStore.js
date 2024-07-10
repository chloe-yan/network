import { writable } from 'svelte/store'
import { metrics, variants } from '../components/utils';

// All nodes and connections from dataset
export const dataStore = writable({ nodes: [], links: [], coOccurrences: [] });

// Filtered groups of nodes to visualize, categorized by degrees
export const filteredGroupsStore = writable([]);

// Filtered range of nodes to visualize, based individually on degrees
export const filteredThresholdStore = writable({
    value: 0,
    mins: {},
    maxes: {},
    variant: variants[0],
    metric: metrics[variants[0]][0],
    precisions: {}
});

// List of all groups
export const groupStore = writable([]);

// Color assignments for nodes
export const colorAssignmentsStore = writable({
    metric: 'Group',
    groupColors: (groupId) => {},
    degreeColors: (id) => {},
    betweennessColors: (id) => {},
    closenessColors: (id) => {},
    coOccurrenceColors: (id) => {},
});