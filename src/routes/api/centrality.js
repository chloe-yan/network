export async function get() {
  const data = await d3.json('https://vega.github.io/vega-datasets/data/miserables.json');
  nodes = data.nodes;
  let links = data.links;

  // Return array of { id: [node id], metric: [metric] }
  const metrics = calculateCentralityMetrics(graphData);
    return {
      status: 200,
      body: metrics,
  };
}