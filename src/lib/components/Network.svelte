<script>
	import {onMount} from 'svelte';
	import * as d3 from 'd3';
	
	let container;

	onMount(async function() {
		const data = await d3.json('https://vega.github.io/vega-datasets/data/miserables.json');
		let nodes = data.nodes;
		let links = data.links

		nodes = d3.map(nodes, n => n);
		links = d3.map(links, l => l);

		const width = window.innerWidth
		const height = window.innerHeight

		const groups = d3.map(nodes, d => d.group).sort()
		const colors = d3.scaleOrdinal(groups, d3.schemeTableau10);

		const simulation = d3.forceSimulation(nodes)
				.force("link", d3.forceManyBody())
				.force("charge", d3.forceLink(links).id(({index}) => index))
				.force("center",  d3.forceCenter())

		const svg = d3.create("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("viewBox", [-width / 2, -height / 2, width, height])

		const link = svg.append("g")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.selectAll("line")
			.data(links)
			.join("line");

		const node = svg.append("g")
			.attr("stroke", '#fff')
			.attr("stroke-opacity", 1)
			.attr("stroke-width", 1.5)
			.selectAll("circle")
			.data(nodes)
			.join("circle")
				.attr("r", 5)
			.call(d3.drag()
                .on('start', dragStart)
                .on('drag', drag)
                .on('end', dragEnd));

		node.attr("fill", (node) => colors(node.group))

		node.append("title")
			.text(({index: i}) => (d => `${d.name}\n${d.group}`));
	
		simulation.on('tick', () => {
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        });

        function dragStart(e, d) {
            if (!e.active) simulation.alphaTarget(0.3).restart();
            // Fix node's position at its current coordinates
            d.fx = d.x;
            d.fy = d.y;
        }

        function drag(e, d) {
            // Fix node's position to cursor coordinates
            d.fx = e.x;
            d.fy = e.y;
        }

        function dragEnd(e, d) {
            if (!e.active) simulation.alphaTarget(0); // Reset simulation forces
            // Release control of node's position
            d.fx = null;
            d.fy = null;
        }

		container.appendChild(svg.node())
	});
	
</script>

<div bind:this={container}></div>

<style>

</style>