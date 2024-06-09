<script>
	import {onMount, onDestroy} from 'svelte';
	import * as d3 from 'd3';
	import { dataStore, filteredStore, groupStore } from '../stores/networkStore';

	let network;

	onMount(async function() {
		const data = await d3.json('https://vega.github.io/vega-datasets/data/miserables.json');
		let nodes = data.nodes;
		let links = data.links;

		let degrees = {}
		links.forEach(link => {
			const { source, target } = link;
			degrees[target] = (degrees[target] ? degrees[target] : 0) + 1
			degrees[source] = (degrees[source] ? degrees[source] : 0) + 1
		})

		nodes = d3.map(nodes, node => {
			const { index, name, group } = node
			return { index, name, group, degree: degrees[index] ? degrees[index] : 0 }
		});
		links = d3.map(links, l => l);
		dataStore.set({ nodes, links })

		const width = window.innerWidth
		const height = window.innerHeight

		const groupArr = [... new Set(d3.map(nodes, d => d.group).sort((a, b) => a - b))]

		const colors = d3.scaleOrdinal(groupArr, d3.schemeTableau10)

		const groups = groupArr.map(group => {return { id: group, color: colors(group) }})
		groupStore.set(groups)
		filteredStore.set(groups)

		let simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceManyBody())
			.force("charge", d3.forceLink(links).id(({index}) => index))
			.force("center",  d3.forceCenter())

		let svg = d3.create("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", [-width / 2, -height / 2, width, height])

		const link = svg.append("g")
			.attr("stroke", "#A9A9A9")
			.attr("stroke-opacity", 0.8)
			.attr("stroke-width", 0.5)
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
				.attr("r", 6)
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

		network.appendChild(svg.node())

		const resizeHandler = () => {
			// Re-center network
			svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
		}
		window.addEventListener('resize', resizeHandler)
		return () => window.removeEventListener('resize', resizeHandler)
	});
	
</script>

<div id='network' bind:this={network}></div>

<style>
	#network {
		margin: 0;
	}
</style>