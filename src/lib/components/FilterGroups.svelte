<script>
    import { onDestroy } from 'svelte';
    import { filteredGroupsStore } from '../stores/networkStore';
    import { degreeBuckets } from './utils'

    let filteredBuckets = [];
  
    const unsubscribeFilteredBuckets = filteredGroupsStore.subscribe(d => {
      filteredBuckets = d;
    });
  
    onDestroy(() => {
      unsubscribeFilteredBuckets();
    });
  
    const handleClick = (e) => {
      // Toggle group from filtered set
      const bucketId = e.target.dataset.bucket;

      if (filteredBuckets.includes(bucketId)) {
        filteredGroupsStore.set(filteredBuckets.filter(b => b != bucketId));
      } else {
        filteredGroupsStore.set([...filteredBuckets, bucketId]);
      }
    };
  </script>
  
  <div id='filter'>
    {#each degreeBuckets as bucket}
      <button 
        on:click={handleClick}
        data-bucket={bucket.id}
        data-selected={filteredBuckets.includes(bucket.id)} 
        style={`--filter-color: rgb(0, 0, 0, ${0.2 + 0.12 * bucket.id})`}>
        {bucket.max ? `${bucket.min}-${bucket.max}` : `${bucket.min}+`} 
      </button>
    {/each}
  </div>
  
<style>
    #filter {
        display: flex;
        flex-direction: row;
        justify-content: center;
        background: white;
        border-radius: 12px;
        box-shadow: 2px 2px 12px 4px hsla(0,0%,82%,.294);
        padding: 6px 10px;
        color: #232323;
    }
    
    button {
        background-color: white;
        border: none;
        transition: 0.1s;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 4px;
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