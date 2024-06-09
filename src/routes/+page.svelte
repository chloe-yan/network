<script>
    import { onMount } from 'svelte';
    import Filter from '../lib/components/Filter.svelte';
    import Network from '../lib/components/Network.svelte';
    import Table from '../lib/components/Table.svelte';
    import { dataStore, filteredStore, groupStore } from '../lib/stores/networkStore';

    let showDetails = true;

    const handleToggle = () => {
        showDetails = !showDetails
    }
</script>

<div class="wrapper" >
    <Network/>
    <div class='side-menu'>
        <button class='toggle' on:click={handleToggle}></button>
        <div class={showDetails ? 'table-filter' : 'table-filter hide'}>
            <Table/>
            <Filter/>
        </div>
    </div>
</div>

<style>
    .wrapper {
        position: absolute;
        margin: 0;
    }

    .toggle {
        width: 30px;
        height: 30px;
        background-image: url('../lib/images/menu.svg');
        background-size: 100% 100%;
        display: block;
        padding: 10px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        background-repeat: no-repeat;
        background-position: center;
        background-color: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: 0.1s;
    }

    .toggle:hover {
        background-color: #f0f0f0;
        transition: 0.1s;
    }

    .side-menu {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 24px;
        left: 12px;
        gap: 8px;
    }

    .table-filter {
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: 0.6s ease-out;
    }

    .hide {
        transform: translateX(calc(-100% - 12px));
    }
</style>