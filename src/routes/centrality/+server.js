import { json } from '@sveltejs/kit';
import graphology from 'graphology';
import betweenness from 'graphology-metrics/centrality/betweenness';
import closeness from 'graphology-metrics/centrality/closeness';

const { UndirectedGraph } = graphology;

export async function POST({ request }) {
  const { nodes, links } = await request.json();
  
  const graph = new UndirectedGraph();

  nodes.forEach(node => {
    graph.addNode(node.index);
  });

  links.forEach(link => {
    graph.addEdge(link.source, link.target);
  });

  const betweennessCentrality = betweenness(graph);
  const closenessCentrality = closeness(graph);
  const numDecimalPlaces = 2;

  const metrics = {};

  graph.nodes().forEach(node => {
    const index = parseInt(node)
    metrics[index] = {
      betweenness: betweennessCentrality[index].toFixed(numDecimalPlaces),
      closeness: closenessCentrality[index].toFixed(numDecimalPlaces),
    };
  });

  return json(metrics);
}