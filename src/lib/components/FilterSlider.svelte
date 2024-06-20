<script>
  import { onDestroy } from 'svelte';
  import { filteredThresholdStore } from '../stores/networkStore';
  import { fly, fade } from "svelte/transition";

  let min = 0;
  let max = 0;
  let value = 0;
  let id = null;

  let bar = null;
  let position = null;
  let progress = null;
  let slider = null;

  let sliderX = null;
  let isDragging = false;
  let isHovering = false;

  const unsubscribeFilteredThreshold = filteredThresholdStore.subscribe(d => {
    value = d.value;
    max = d.max;
  });

  onDestroy(() => {
    unsubscribeFilteredThreshold();
  })

  function resizeWindow() {
    // Adjust position to account for new viewport size
    sliderX = slider.getBoundingClientRect().left;
  }

  function setValue(value) {
    filteredThresholdStore.set({
      value: value,
      max: max
    })
  }

  function onTrackEvent(e) {
    // Update value immediately before beginning drag
    updateValueOnEvent(e);
    isDragging = !!position;
  }

  function onDragEnd(e) {
    // If using mouse - remove pointer event shield
    if (e.type === "mouseup" && isMouseInElement(e, position)) {
      isHovering = true;
    }
    isDragging = false;
  }

  // Check if mouse event cords overlay with an slider's area
  function isMouseInElement(e, slider) {
    let rect = slider.getBoundingClientRect();
    let { clientX: x, clientY: y } = e;
    if (x < rect.left || x >= rect.right) return false;
    if (y < rect.top || y >= rect.bottom) return false;
    return true;
  }

  // Accessible keypress handling
  function onKeyPress(e) {
    if ((e.key === "ArrowUp" || e.key === "ArrowRight") && value > max) {
      setValue(max);
    }
    if ((e.key === "ArrowDown" || e.key === "ArrowLeft") && value < min) {
      setValue(min);
    }
  }

  function getValue(clientX) {
    // Find distance between cursor and start of slider
    let delta = clientX - (sliderX + 10);

    // Find progress percentage, subtract 5px offset from each end
    let percent = (delta * 100) / (bar.clientWidth - 10);

    // Clamp percentage to fit within the [min, max] range
    setValue(parseInt((percent * (max - min)) / 100) + min);
  }

  // Handle drags, clicks, and touches as update events
  function updateValueOnEvent(e) {
    // Click/touch
    if (!isDragging && e.type !== "touchstart" && e.type !== "mousedown") {
      return false;
    }

    // Drag
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    
    const clientX = e.type === "touchmove" || e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    getValue(clientX);
  }

  $: if (slider) sliderX = slider.getBoundingClientRect().left;
  $: if (progress && position) {
    // Clamp value to fit within [min, max] range
    value = Math.max(min, Math.min(max, value));
    let percent = ((value - min) * 100) / (max - min);
    let offsetLeft = (bar.clientWidth - 10) * (percent / 100) + 5;
    
    // Update current position
    position.style.left = `${offsetLeft}px`;
    progress.style.width = `${offsetLeft}px`;
  }
  </script>
  
<svelte:window
  on:touchmove|nonpassive={updateValueOnEvent}
  on:touchcancel={onDragEnd}
  on:touchend={onDragEnd}
  on:mousemove={updateValueOnEvent}
  on:mouseup={onDragEnd}
  on:resize={resizeWindow}
/>
<div class="slider-wrapper">
  <p id="min">{min}</p>
  <div
    class="slider"
    tabindex="0"
    on:keydown={onKeyPress}
    bind:this={slider}
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    {id}
    on:mousedown={onTrackEvent}
    on:touchstart={onTrackEvent}
  >
    <div class="bar" bind:this={bar}>
      <div class="progress" bind:this={progress} />
      <div
        class="position"
        class:position-drag={isDragging}
        bind:this={position}
        on:touchstart={() => isDragging = !!position}
        on:mousedown={() => isDragging = !!position}
        on:mouseover={() => (isHovering = true)}
        on:mouseout={() => (isHovering = false)}
      >
        {#if isDragging || isHovering}
          <div
            class="tooltip"
            in:fly={{ y: 7, duration: 200 }}
            out:fade={{ duration: 100 }}
          >
            {value}
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

  .slider-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
    background: white;
    width: 100%;
    border-radius: 8px;
    border: 2px solid #f4f4f4;
    border-radius: 12px;
    box-shadow: 2px 2px 12px 4px #d1d1d14b;
  }

  .slider {
    box-sizing: border-box;
    width: 100%;
    position: relative;
    padding: 0.5rem;
    box-sizing: border-box;
    outline: none;
  }

  .bar {
    height: 6px;
    background: #d0d0d0;
    border-radius: 6px;
  }

  .progress {
    position: absolute;
    width: 0px;
    height: 6px;
    background: #4696ff;
    border-radius: 6px;
  }

  .position {
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
  }

  .position-drag {
    box-shadow: 0 1px 1px 0 rgba(59, 160, 255, 0.14),
      0 1px 2px 1px rgba(0, 0, 0, 0.2),
      0 0 0 4px rgba(106, 175, 255, 0.3);
  }

  .tooltip {
    pointer-events: none;
    position: absolute;
    top: 30px;
    font-family: Inter;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    color: white;
    background: #3482e8;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .tooltip::after {
    content: "";
    display: block;
    position: absolute;
    height: 7px;
    width: 7px;
    top: -3px;
    left: calc(50% - 3px);
    clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
    background-color: #6185ff;
    transform: rotate(135deg);
    border-radius: 0 0 0 2px;
  }
</style>