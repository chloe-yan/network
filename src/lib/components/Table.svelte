<script>
  import { onDestroy } from 'svelte';
    import { dataStore, filteredStore, groupStore } from '../stores/networkStore';

    let allNodes = [];
    let groups = [];
    let filteredNodes = [];

    const unsubscribeData = dataStore.subscribe(d => allNodes = d.nodes);
    const unsubscribeGroups = groupStore.subscribe(d => groups = d);
    const unsubscribeFilteredGroups = filteredStore.subscribe(groups => {
        filteredNodes = allNodes.filter(node => groups.find(g => g.id == node.group)).sort((a, b) => b.degree - a.degree)
    });
    onDestroy(() => {
        unsubscribeData();
        unsubscribeGroups()
        unsubscribeFilteredGroups()
    });
</script>

<table>
    <thead>
        <tr>
            <th id='node-header'>Node</th>
            <th id='deg-header'>Degree</th>
        </tr>
    </thead>
    <tbody>
        {#each filteredNodes as node}
            <tr>
                <td key={node.id} class='node-name' data-degree={node.degree} data-group={node.group} style={`--group-color: ${groups[node.group].color}`}>{node.name}</td>
                <td>{node.degree}</td>
            </tr>
        {/each}
    </tbody>
</table>
 

<style>
    table {
        font-family: Inter;
        font-size: 14px;
        background: white;
        padding: 10px 20px;
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

    thead {
        position: sticky;
    }

    #node-header {
        width: 100%;
        max-width: 150px;
    }

    #deg-header {
        width: 50px;
    }

    td, th {
        text-align: left;
    }

    tbody {
        max-height: 300px;
        overflow-y: scroll;
    }

</style>