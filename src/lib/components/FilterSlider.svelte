<script>
  import { onDestroy } from 'svelte';
  import { filteredThresholdStore } from '../stores/networkStore';
  import { fly, fade } from "svelte/transition";
  import { metrics, mix } from './utils';

  let min = 0;
  let max = 0;
  let startValue = 0;
  let endValue = 0;
  let startPct = 0;
  let endPct = 1;

  let metric = metrics[0];
  let precision = 0;

  let wrapper = null;
  let container = null;
  let startHandle;
	let selectedRange;
	let slider;

  let isDraggingStart = false;
  let isDraggingEnd = false;
  let isHoveringStart = false;
  let isHoveringEnd = false;

  const unsubscribeFilteredThreshold = filteredThresholdStore.subscribe(d => {
    startValue = d.startValue;
    endValue = d.endValue;
    metric = d.metric;
    max = d.maxes[metric];
    min = d.mins[metric];
    precision = d.precisions[metric]
  });

  onDestroy(() => {
    unsubscribeFilteredThreshold();
  })

  function setRange(start, end) {
    filteredThresholdStore.update(curr => ({
      ...curr,
      startValue: start,
      endValue: end,
    }))
  }

	function handleMousedown(event, handleType) {
		event.preventDefault();
		let x = event.clientX || event.touches[0].clientX;
		const onMouseMove = (moveEvent) => {
			const clientX = moveEvent.clientX || moveEvent.touches[0].clientX;
			const dx = clientX - x;
			x = clientX;
			const { left, right } = slider.getBoundingClientRect();
			const parentWidth = right - left;
			const p = Math.min(Math.max((clientX - left) / parentWidth, 0), 1);
			if (handleType === 'start') {
				startValue = p * max;
        startPct = p;

        let color = mix((x / parentWidth));
        let rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        wrapper.style = `--start-color: ${rgb}`;
			} else if (handleType === 'end') {
				endValue = p * max;
        endPct = p;

        let color = mix((x / parentWidth));
        let rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        container.style = `--end-color: ${rgb}`;
			} else if (handleType === 'selectedRange') {
				const { width } = selectedRange.getBoundingClientRect();
				const startHandleLeft = startHandle.getBoundingClientRect().left;
				const pxStart = Math.max(Math.min(0, (startHandleLeft + dx) - left), parentWidth - width);
				const pxEnd = Math.max(Math.min(width, (pxStart + width) - left), parentWidth);
				const pStart = pxStart / parentWidth;
				const pEnd = pxEnd / parentWidth;
				startPct = pStart;
				endPct = pEnd;
			}
		};

		const onMouseUp = () => {
      isDraggingStart = false;
      isDraggingEnd = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('touchmove', onMouseMove);
			window.removeEventListener('touchend', onMouseUp);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('touchmove', onMouseMove);
		window.addEventListener('touchend', onMouseUp);
	}

	function handleStartMouseDown(event) {
    isDraggingStart = true;
		handleMousedown(event, 'start');
	}

	function handleEndMouseDown(event) {
    isDraggingEnd = true;
		handleMousedown(event, 'end');
	}

	function handleSelectedRangeMouseDown(event) {
		handleMousedown(event, 'selectedRange');
	}

  $: isDraggingEnd && setRange(startValue, endValue);
  $: isDraggingStart && setRange(startValue, endValue);
</script>

<div bind:this={wrapper} class="wrapper">
  <p id="min">{min}</p>
  <div bind:this={container} class="double-range-container">
    <div class="slider" bind:this={slider}>
      <div
        class="selected-range"
        bind:this={selectedRange}
        on:mousedown|preventDefault|stopPropagation={handleSelectedRangeMouseDown}
        on:touchstart|preventDefault|stopPropagation={handleSelectedRangeMouseDown}
        style="
          left: {startPct * 100}%;
          right: {(1 - endPct) * 100}%;
        "
      >
      {#if isDraggingStart || isHoveringStart}
        <div
          class="tooltip-start"
          in:fly={{ y: 7, duration: 200 }}
          out:fade={{ duration: 100 }}
        >
          {startValue.toFixed(precision)}
        </div>
      {/if}
      </div>
      <div
        class="handle"
        bind:this={startHandle}
        data-which="start"
        on:mousedown|preventDefault|stopPropagation={handleStartMouseDown}
        on:touchstart|preventDefault|stopPropagation={handleStartMouseDown}
        on:mouseenter={() => isHoveringStart = true}
        on:mouseleave={() => isHoveringStart = false}
        style="
          left: {startPct * 100}%
        "
      ></div>
      <div
        class="handle"
        data-which="end"
        on:mousedown|preventDefault|stopPropagation={handleEndMouseDown}
        on:touchstart|preventDefault|stopPropagation={handleEndMouseDown}
        on:mouseenter={() => isHoveringEnd = true}
        on:mouseleave={() => isHoveringEnd = false}
        style="
          left: {endPct * 100}%
        "
      >
      {#if isDraggingEnd || isHoveringEnd}
      <div
        class="tooltip-end"
        in:fly={{ y: 7, duration: 200 }}
        out:fade={{ duration: 100 }}
      >
        {endValue.toFixed(precision)}
      </div>
    {/if}
    </div>
    </div>
  </div>
  <p id="max">{max}</p>
</div>

<style>
  #min, #max {
    font-family: Inter;
    font-size: 12px;
    font-weight: 500;
  }

  #min {
    padding: 6px;
    margin-left: 12px;
  }

  #max {
    padding: 6px;
    margin-right: 12px;
  }

  .wrapper {
    --start-color: rgb(52, 130, 232);
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
    background: white;
    width: 100%;
    border-radius: 8px;
    border: 2px solid #f4f4f4;
    box-sizing: border-box;
    border-radius: 12px;
    box-shadow: 2px 2px 12px 4px #d1d1d14b;
  }

	.double-range-container {
    --end-color: rgb(232, 52, 148);
		width: 100%;
		height: 20px;
		user-select: none;
		box-sizing: border-box;
		white-space: nowrap;
    display: flex;
    justify-content: center;
    
	}
	.slider {
		position: relative;
		width: calc(100% - 26px);
		height: 6px;
		top: 50%;
		transform: translate(0, -50%);
		background-color: #e2e2e2;
    box-sizing: border-box;
		border-radius: 1px;
	}

	.handle {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 18px;
    height: 18px;
    background-color: white;
    cursor: pointer;
    border-radius: 50%;
    margin-top: -6.5px;
    box-shadow: var(
      --position-boxshadow,
      0 1px 1px 0 rgba(0, 0, 0, 0.14),
      0 0px 2px 1px rgba(0, 0, 0, 0.2)
    );
    margin-left: -9px;
	}

	.selected-range {
		top: 0;
		position: absolute;
    background: linear-gradient(45deg, var(--start-color), var(--end-color));
		bottom: 0;
	}

  .tooltip-start, .tooltip-end {
    pointer-events: none;
    position: absolute;
    top: 30px;
    font-family: Inter;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .tooltip-start {
    margin-left: -12.5px;
    margin-top: -8px;
    background: var(--start-color);
  }

  .tooltip-end {
    background: var(--end-color);
  }

  .tooltip-start::after, .tooltip-end::after {
    content: "";
    display: block;
    position: absolute;
    height: 7px;
    width: 7px;
    top: -3px;
    left: calc(50% - 3px);
    clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
    background-color: var(--start-color);
    transform: rotate(135deg);
    border-radius: 0 0 0 2px;
  }
  
  .tooltip-start::after {
    background-color: var(--start-color);
  }

  .tooltip-end::after {
    background-color: var(--end-color);
  }
  
</style>