<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import { dataStore, filteredGroupsStore, filteredThresholdStore, groupStore } from '../stores/networkStore';
    import { degreeBuckets } from './utils';
	import { Ticker, curveEaseInOut, MarkRenderGroup, Mark, PositionMap } from 'counterpoint-vis';

	let nodes = []
	let filteredNodes = [];
	let colors = [];

	let canvas;
	let simulation;
	let markSet;
	let positionMap;
	let ticker;
	let hoveredId;
	let draggingId;
	let initialMousePos;
	let currentTick = 0;
	let maxDegree = 0;

	let width = 0;
	let height = 0;
	const RADIUS = 6;

	function draw() {
		if (!canvas) return;
		let ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas dimensions and defaults
		ctx.resetTransform();
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
		ctx.strokeStyle = '#bbb';
		ctx.lineWidth = 1.0;

		// Draw links
		markSet.stage.forEach((mark) => {
			let x = mark.attr('x');
			let y = mark.attr('y');
			let filtered = mark.attr('filtered');
			let strokeStyle = mark.attr('strokeStyle');

			ctx.beginPath();
			mark.adj('neighbors').forEach((neighbor) => {
				let nx = neighbor.attr('x');
				let ny = neighbor.attr('y');
				let nborFiltered = neighbor.attr('filtered');
				let nborStrokeStyle = neighbor.attr('strokeStyle');

				if (filtered && nborFiltered) {
					ctx.strokeStyle = strokeStyle;
				} else {
					ctx.strokeStyle = filtered ? nborStrokeStyle : strokeStyle;
				}

				ctx.moveTo(x, y);
				ctx.lineTo(nx, ny);
				ctx.globalAlpha = 0.3;
			});
			ctx.stroke();
			ctx.closePath();
		});
		ctx.globalAlpha = 1.0;

		// Draw nodes
		markSet.stage.forEach((mark) => {
			ctx.save();
			let { x, y, name, radius, color, strokeStyle, labelSize } = mark.get();
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.strokeStyle = strokeStyle;
			ctx.stroke();
			ctx.closePath();
			ctx.restore();

			// Display node label on hover
			if (labelSize > 1) {
				ctx.save();
				ctx.font = `${labelSize.toFixed(2)}pt sans-serif`;
				ctx.strokeStyle = 'white';
				ctx.lineWidth = Math.round(0.25 * labelSize);
				ctx.fillStyle = 'black';
				ctx.textAlign = 'center';
				ctx.strokeText(name, x, y - radius - 4);
				ctx.fillText(name, x, y - radius - 4);
				ctx.restore();
			}
		});
	}

	onMount(async function () {
		const data = await d3.json('https://vega.github.io/vega-datasets/data/miserables.json');
		nodes = data.nodes;
		let links = data.links;

		// Compute degrees of each node
		let degrees = {};
		links.forEach(link => {
			const { source, target } = link;
			degrees[target] = (degrees[target] ? degrees[target] : 0) + 1;
			degrees[source] = (degrees[source] ? degrees[source] : 0) + 1;
		});

		// Augment nodes with degree info, bucketize based on number of degrees
		nodes = d3.map(nodes, node => {
			const { index, name, group } = node;
			const degree = degrees[index] ? degrees[index] : 0;
			let degreeBucket = 0;
			while (degreeBuckets[degreeBucket].max != null && degree > degreeBuckets[degreeBucket].max) {
				degreeBucket++;
			}
			if (degree > maxDegree) maxDegree = degree
			return { index, name, group, degree, degreeBucket };
		});

		dataStore.set({ nodes, links });

		// Set maximum and current filtered threshold to include nodes of any degree
		const maxDegreeRounded = Math.ceil(maxDegree / 10) * 10;
		filteredThresholdStore.set({
			value: 0,
			max: maxDegreeRounded
		});

		// Create color palette for node groups
		const groupArr = [...new Set(d3.map(nodes, d => d.group).sort((a, b) => a - b))];
		colors = d3.scaleOrdinal(groupArr, d3.schemeTableau10);
		const groups = groupArr.map(group => { return { id: group, color: colors(group) } });
		
		groupStore.set(groups);
		filteredGroupsStore.set(degreeBuckets.map(bucket => bucket.id));

		// Set canvas dimensions
		width = canvas.offsetWidth;
		height = canvas.offsetHeight;
		canvas.width = canvas.offsetWidth * window.devicePixelRatio;
		canvas.height = canvas.offsetHeight * window.devicePixelRatio;

		// Gray out unfiltered nodes
		function getColor(mark, n) {
			return mark.attr('filtered') ? colors(n.group) : '#e8e8e8';
		}

		// Use stronger edge strokes to link filtered nodes
		function getStroke(mark) {
			return mark.attr('filtered') ? '#bbb' : '#f0f0f0';
		}

		// Combine nodes inside a mark render group
		markSet = new MarkRenderGroup(
			nodes.map(
				(n, i) =>
					new Mark(i, {
						x: width / 2, // Animate outwards from center
						y: height / 2,
						index: n.index,
						name: n.name,
						filtered: () => filteredNodes.includes(n),
						color: (mark) => getColor(mark, n),
						labelSize: () => hoveredId === n.index ? 12 : 0,
						strokeStyle: getStroke,
						radius: RADIUS,
						degree: n.degree,
						degreeBucket: n.degreeBucket
					})
			)
		).configure({
			animationDuration: 200,
			animationCurve: curveEaseInOut,
			hitTest: (mark, location) => {
				let { x, y, radius } = mark.get();
				return (
					Math.abs(location[0] - x) <= radius &&
					Math.abs(location[1] - y) <= radius
				);
			},
		}).onEvent('mouseover', (mark) => (hoveredId = mark.id));

		positionMap = new PositionMap({
			maximumHitTestDistance: RADIUS * 3,
		}).add(markSet);

		ticker = new Ticker(markSet).onChange(draw).onChange(() => {
			// Only update the position map when coordinates change
			if (markSet.changed(['x', 'y'])) {
				positionMap.invalidate();
			}
		});

		// Use the adj() method to represent node edges
		markSet.forEach((m) =>
			m.adj('neighbors',
				markSet.filter((n) =>
					links.find(l => (l.source == m.id && l.target == n.id) || (l.source == n.id && l.target == m.id)))
					.getMarks()
		));

		// Apply force simulation to network
		simulation = d3
			.forceSimulation(nodes)
			.force('link', d3.forceLink(links).id(d => d.index).distance(RADIUS * 20).strength(2))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('x', d3.forceX(width / 2).strength(0.1))
			.force('y', d3.forceY(height / 2).strength(0.1))
			.force('collide', d3.forceCollide(RADIUS * 2))
			.force('charge', d3.forceManyBody().strength(-50))
			// .alphaDecay(0.036)
			.on('tick', () => {
				if (currentTick == 0 || markSet.changed('x') || markSet.changed('y')) {
					markSet
						.animateTo('x', (_, i) => nodes[i].x)
						.animateTo('y', (_, i) => nodes[i].y);
				}
				currentTick += 1;
			});

		draw();

		// Re-center network if screen dimensions change
		const resizeHandler = () => {
			if (!canvas) return;
			width = canvas.offsetWidth;
			height = canvas.offsetHeight;
			canvas.width = canvas.offsetWidth * window.devicePixelRatio;
			canvas.height = canvas.offsetHeight * window.devicePixelRatio;
			simulation.force('center', d3.forceCenter(width / 2, height / 2));
			simulation.alpha(1).restart();
		};
		window.addEventListener('resize', resizeHandler);
		return () => window.removeEventListener('resize', resizeHandler);
	});

	function handleMouseDown(e) {
		// Reheat simulation on new drag event
		if (!e.active) simulation.alphaTarget(0.3).restart();
		initialMousePos = [
			e.clientX - canvas.getBoundingClientRect().left,
			e.clientY - canvas.getBoundingClientRect().top,
		];

		let nearest = positionMap.hitTest(initialMousePos);
		if (!!nearest) {
			// Freeze the mark's x and y attributes in case they are animating
			// This allows us to click and drag even while the nodes are moving
			draggingId = nearest.id;
			let mark = markSet.get(draggingId);
			mark
				.setAttr('x', mark.attr('x'))
				.setAttr('y', mark.attr('y'));
			
			let node = simulation.nodes().find(n => n.index === draggingId);
			node.fx = e.x;
			node.fy = e.y;
		}
	}

	function handleMouseMove(e) {
		let mousePos = [
			e.clientX - canvas.getBoundingClientRect().left,
			e.clientY - canvas.getBoundingClientRect().top,
		];
		if (initialMousePos != null) {
			// Clicking and dragging - update the dragging mark's position
			if (draggingId != null) {
				// Update fixed position to cursor in the force simulation
				// This allows d3 to figure out how the other nodes should move
				let node = simulation.nodes().find(n => n.index === draggingId);
				node.fx = mousePos[0];
				node.fy = mousePos[1];

				// Propagate updated position to its instance in the mark set
				let mark = markSet.get(draggingId);
				mark
					.setAttr('x', mousePos[0])
					.setAttr('y', mousePos[1]);
			}
			initialMousePos = mousePos;
		} else {
			// Hovering - reset
			if (!positionMap.dispatchAt(mousePos, 'mouseover')) hoveredId = null;
		}
	}

	function handleMouseUp(e) {
		if (!e.active) simulation.alphaTarget(0);
		if (draggingId) {
			// Unset dragged node's fixed position
			let node = simulation.nodes().find(n => n.index === draggingId);
			node.fx = null;
			node.fy = null;
		}
		initialMousePos = null;
		draggingId = null;
	}

	const unsubscribeFilteredBuckets = filteredGroupsStore.subscribe(d => {
		filteredNodes = nodes.filter(node => d.find(bucket => bucket == node.degreeBucket));
		if (markSet) markSet.update('filtered');
	});

	const unsubscribeFilteredThreshold = filteredThresholdStore.subscribe(d => {
		const threshold = d.value;
		filteredNodes = nodes.filter(node => node.degree >= threshold);
		if (markSet) markSet.update('filtered');
	});

	onDestroy(() => {
		if (simulation) simulation.stop(); 
		if (ticker) ticker.stop();
		unsubscribeFilteredBuckets();
		unsubscribeFilteredThreshold();
	});

	// Display node label on hover
	$: hoveredId, markSet && markSet.animate('labelSize');
</script>

<canvas
	id='canvas'
	bind:this={canvas}
	on:mousemove={handleMouseMove}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
></canvas>

<style>
	#canvas {
		width: 100vw;
		height: 100vh;
		margin: 0;
	}
</style>
