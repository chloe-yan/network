<script>
    import FilterGroups from '../lib/components/FilterGroups.svelte';
    import FilterSlider from '../lib/components/FilterSlider.svelte'
    import Network from '../lib/components/Network.svelte';
    import NetworkScalability from '../lib/components/NetworkScalability.svelte';
    import Table from '../lib/components/Table.svelte';
    import ColorByMetric from '../lib/components/ColorByMetric.svelte';

    // Show filtered nodes only
    let checkbox = null;
    let showFilteredOnly = false;

    // Side menu controls
    let showDetails = true;
    const handleToggle = () => {
        showDetails = !showDetails
    }
</script>

<div class="wrapper" >
    <Network showFilteredOnly={showFilteredOnly} />
    <!-- <NetworkScalability/> -->
    <div class='side-menu'>
        <button class='toggle' on:click={handleToggle}></button>
        <div class={showDetails ? 'table-filter' : 'table-filter hide'}>
            <Table/>
            <!-- <FilterGroups/> -->
            <FilterSlider/>
            <ColorByMetric/>
            <div class='container'>
                <input on:click={() => {showFilteredOnly = checkbox.checked}} bind:this={checkbox} id='show-filtered-only' type='checkbox'/>
                <label for='show-filtered-only'>Show filtered nodes only</label>
            </div>
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
        transition: 0.4s ease-out;
    }

    .hide {
        transform: translateX(calc(-100% - 12px));
    }
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
        margin-top: -12px;
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