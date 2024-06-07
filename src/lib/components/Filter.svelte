<script>
  import { onDestroy } from 'svelte';
    import { groupStore } from '../stores/networkStore';

    let groups = [];

    const unsubscribe = groupStore.subscribe(d => groups = d);
    onDestroy(unsubscribe);

    const handleClick = () => {
        // Toggle filter
    }
</script>

<div>
    {#each groups as group}
        <button on:click={handleClick}>
            {group}
        </button>
    {/each}
</div>