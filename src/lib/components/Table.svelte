<script>
  import { onDestroy } from 'svelte';
    import { filteredStore } from '../stores/networkStore';

    let filteredNodes = [];
    const unsubscribe = filteredStore.subscribe(d => filteredNodes = d);
    onDestroy(unsubscribe);
</script>

<table id='table'>
    <thead>
        <tr>
            <th>Node</th>
            <th>Degree</th>
        </tr>
    </thead>
    <tbody>
        {#each filteredNodes as node}
            <tr>
                <td data-degree={node.degree} data-group={node.group}>{node.name}</td>
                <td>{node.degree}</td>
            </tr>
        {/each}
    </tbody>
</table>