const CHUNK_SIZE_MB = 100;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MB * 1024 * 1024;
const ENV_MAX_GB = process.env.MAX_MEMORY_GB;

// Array to hold references to our memory chunks so they don't get garbage collected
const memoryHog = [];

console.log(`Starting process to fill MEMORY in ${CHUNK_SIZE_MB} MB batches...`);

if (ENV_MAX_GB) {
    console.log(`Target limit: ${ENV_MAX_GB} GB (or until crash)`);
} else {
    console.log(`Target limit: Unlimited (until crash)`);
}

try {
  let totalAllocated = 0;
  let targetBytes = ENV_MAX_GB ? parseFloat(ENV_MAX_GB) * 1024 * 1024 * 1024 : Infinity;

  while (totalAllocated < targetBytes) {
    // Allocate a new buffer
    const buffer = Buffer.alloc(CHUNK_SIZE_BYTES, 'a');
    memoryHog.push(buffer);
    
    totalAllocated += CHUNK_SIZE_BYTES;
    
    const used = process.memoryUsage();
    const heapUsedMB = (used.heapUsed / 1024 / 1024).toFixed(2);
    const rssMB = (used.rss / 1024 / 1024).toFixed(2);
    
    console.log(`Allocated +${CHUNK_SIZE_MB} MB. Total Allocated: ${(totalAllocated / 1024 / 1024).toFixed(2)} MB`);
    console.log(`System Report - Heap: ${heapUsedMB} MB, RSS: ${rssMB} MB`);
    
    // Small delay to allow I/O (logging) to flush before next allocation might crash it
    // and to make the climb visible
  }
  
  console.log("Stopped: Reached target memory limit.");
  
} catch (error) {
  console.error('Caught error (might be OOM):', error.message);
  // If it's a true OOM, the process might just be killed by the OS/V8 before this catch block.
}

