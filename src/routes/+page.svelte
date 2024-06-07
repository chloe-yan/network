<script>
    import { onMount } from 'svelte';
    import Filter from '../lib/components/Filter.svelte';
    import Network from '../lib/components/Network.svelte';
    import Table from '../lib/components/Table.svelte';
    import { dataStore, filteredStore, groupStore } from '../lib/stores/networkStore';
</script>

<div class="wrapper" >
    <Network/>
    <Table/>
    <Filter/>
</div>

<style>
    .wrapper {
        position: absolute;
    }
</style>