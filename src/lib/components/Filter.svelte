<script>
    import { onDestroy } from 'svelte';
    import { filteredStore, groupStore } from '../stores/networkStore';
  
    let groups = [];
    let filteredGroups = [];
  
    const unsubscribeGroups = groupStore.subscribe(d => {
      groups = d;
    });
  
    const unsubscribeFilteredGroups = filteredStore.subscribe(d => {
      filteredGroups = d;
    });
  
    onDestroy(() => {
      unsubscribeGroups();
      unsubscribeFilteredGroups();
    });
  
    const handleClick = (e) => {
      // Toggle group from filtered set
      const groupId = e.target.dataset.group;
      const group = groups.find(g => g.id == groupId);
      console.log(group)
  
      if (filteredGroups.includes(group)) {
        filteredStore.set(filteredGroups.filter(g => g.id != groupId)); // Remove group
      } else {
        filteredStore.set([...filteredGroups, group]); // Add group
      }
    };
  </script>
  
  <div id='filter'>
    {#each groups as group}
      <button 
        on:click={handleClick} 
        data-group={group.id} 
        data-selected={filteredGroups.includes(group)} 
        style={`--filter-color: ${group.color}`}>
        {group.id}
      </button>
    {/each}
  </div>
  
<style>
    #filter {
        display: flex;
        flex-direction: row;
        background: white;
        border-radius: 12px;
        box-shadow: 2px 2px 12px 4px hsla(0,0%,82%,.294);
        padding: 6px 10px;
    }
    
    button {
        background-color: white;
        border: none;
        transition: 0.1s;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 2px;
        padding-bottom: 8px;
        border-radius: 10px;
    }

    button:hover {
        background-color: #f0f0f0;
        transition: 0.1s;
    }

    button::after {
        content: '';
        position: relative;
        display: inline-block;
        top: 2px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: white;
        border: 1.5px solid var(--filter-color);
        transition: background-color ease-in-out 0.05s;
    }

    [data-selected="true"]::after {
        width: 9px;
        height: 9px;
        background-color: var(--filter-color);
        border: none;
    }
</style>