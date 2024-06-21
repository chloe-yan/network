<script>
  import { onDestroy } from 'svelte';
    import { dataStore, filteredGroupsStore, filteredThresholdStore, groupStore } from '../stores/networkStore';

    let allNodes = [];
    let groups = [];
    let filteredNodes = [];
    let isDropdownOpen = false;
    const metrics = ['Degree', 'Centrality', 'Other']
    let currentMetric = metrics[0]

    const handleDropdown = (e) => {
        isDropdownOpen = !isDropdownOpen
    }

    const handleSelectMetric = (e) => {
        const metric = e.target.id;
        console.log(metric)
    }

    const unsubscribeData = dataStore.subscribe(d => allNodes = d.nodes);
    const unsubscribeGroups = groupStore.subscribe(d => groups = d);
	const unsubscribeFilteredBuckets = filteredGroupsStore.subscribe(d => {
		filteredNodes = allNodes.filter(node => d.find(bucket => bucket == node.degreeBucket)).sort((a, b) => b.degree - a.degree);
	});
    const unsubscribeFilteredThreshold = filteredThresholdStore.subscribe(d => {
        filteredNodes = allNodes.filter(node => node.degree >= d.value).sort((a, b) => b.degree - a.degree);
    });

    onDestroy(() => {
        unsubscribeData();
        unsubscribeGroups();
        unsubscribeFilteredBuckets();
        unsubscribeFilteredThreshold();
    });
</script>

<table>
    <thead>
        <tr>
            <th id='node-header'>Node</th>
            <th id='deg-header' on:click={handleDropdown}>
                <div>
                    <div id='current-metric'>{currentMetric}</div>
                    {#if isDropdownOpen}
                        <div class='dropdown'>
                            {#each metrics as metric}
                                {#if metric !== currentMetric}
                                <button
                                    class='metric'
                                    id={metric}
                                    on:click={handleSelectMetric}
                                >{metric}</button>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
            </th>
        </tr>
    </thead>
    <tbody>
        {#each filteredNodes as node}
            <tr>
                <td key={node.id} class='node-name' data-degree={node.degree} data-group={node.group} style={`--group-color: ${groups[node.group].color}`}>{node.name}</td>
                <td class='node-metric'>{node.degree}</td>
            </tr>
        {/each}
    </tbody>
</table>
 

<style>
    table {
        font-family: Inter;
        font-size: 14px;
        background: white;
        padding: 6px 10px;
        border: 2px solid rgb(244, 244, 244);
        border-radius: 12px;
        box-shadow: 2px 2px 12px 4px hsla(0,0%,82%,.294);
        height: 300px;
        display: block;
        overflow: scroll;
        color: #232323;
    }

    .node-name::before {
        content: '';
        display: inline-block;
        position: relative;
        width: 5px;
        height: 5px;
        top: -2px;
        right: 8px;
        background-color: var(--group-color);
        border-radius: 50%;
    }

    th {
        padding: 6px 12px;
        /* background: red; */
    }

    thead {
        position: sticky;
    }

    #node-header {
        width: 100%;
        min-width: 150px;
    }

    #deg-header {
        width: 50px;
        border-radius: 8px;
        transition: 0.1s ease-out;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-right: 24px;
    }

    #deg-header::after {
        content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16px' height='16px' viewBox='0 0 24 24' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M16.5303 8.96967C16.8232 9.26256 16.8232 9.73744 16.5303 10.0303L12.5303 14.0303C12.2374 14.3232 11.7626 14.3232 11.4697 14.0303L7.46967 10.0303C7.17678 9.73744 7.17678 9.26256 7.46967 8.96967C7.76256 8.67678 8.23744 8.67678 8.53033 8.96967L12 12.4393L15.4697 8.96967C15.7626 8.67678 16.2374 8.67678 16.5303 8.96967Z' fill='%23000000'/%3E%3C/svg%3E");
        margin-left: 2px;
        margin-top: 5px;
    }

    #deg-header:hover {
        cursor: pointer;
        background: rgb(244, 244, 244);
    }

    td, th {
        text-align: left;
    }

    .node-name {
        padding-left: 24px;
    }

    .node-metric {
        padding-left: 12px;
    }

    tbody {
        max-height: 300px;
        overflow-y: scroll;
    }

    .dropdown {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: white;
        margin-top: 14px;
        margin-left: -14px;
        padding: 10px;
        border: 2px solid rgb(244, 244, 244);
        border-radius: 8px;
        box-shadow: 4px 2px 12px 4px hsla(0, 0%, 82%, 0.432);
        width: 80px;
    }

    .metric {
        margin: 0;
        font-weight: 500;
        transition: 0.1s ease-out;
        background: none;
        border: none;
        text-align: left;
        font-family: Inter;
        font-size: 14px;
        font-weight: 400;
        display: flex;
        flex-direction: row;
        gap: 4px;
        padding: 1px 2px;
        cursor: pointer;
}

    .metric:hover::after {
        content: '•';
        color: gray;
    }

</style>