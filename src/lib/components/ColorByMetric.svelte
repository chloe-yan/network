<script>
    import { onDestroy } from 'svelte';
    import { filteredThresholdStore, colorAssignmentsStore } from '../stores/networkStore';
    import { metrics, variants } from './utils'

    let checkbox = null;
    let variant = variants[0]
    let metric = metrics[variant][0];

    const handleClick = () => {
        colorAssignmentsStore.update(curr => ({
            ...curr,
            metric: checkbox.checked ? metric : 'Group'
        }))
    }

    const unsubscribeFilteredThreshold = filteredThresholdStore.subscribe(d => {
        variant = d.variant
        metric = d.metric;
    });

    onDestroy(() => {
        unsubscribeFilteredThreshold();
    });
</script>

{#if variant === 'Node'}
    <div class='container'>
        <input on:click={handleClick} bind:this={checkbox} id='color-by-degree' type='checkbox'/>
        <label for='color-by-degree'>Color nodes by {metric.toLowerCase()}</label>
    </div>
{/if}

<style>
    .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        width: 100%;
        border-radius: 8px;
        box-sizing: border-box;
        border-radius: 12px;
        height: 36px;
        margin-bottom: -12px;
    }

    input {
        margin-left: 16px;
    }

    label {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding-right: 16px;
        font-family: Inter;
        font-size: 13px;
    }

    input:hover, label:hover {
        cursor: pointer;
    }
</style>