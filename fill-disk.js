const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const ENV_MAX_GB = process.env.MAX_STORAGE_GB;
const DEFAULT_MAX_MB = 500;

let targetSizeBytes;
let targetSizeDisplay;

if (ENV_MAX_GB) {
  const gb = parseFloat(ENV_MAX_GB);
  if (!isNaN(gb)) {
    targetSizeBytes = gb * 1024 * 1024 * 1024;
    targetSizeDisplay = `${gb} GB`;
  }
}

if (!targetSizeBytes) {
  targetSizeBytes = DEFAULT_MAX_MB * 1024 * 1024;
  targetSizeDisplay = `${DEFAULT_MAX_MB} MB`;
}

// Reduced chunk size for better granularity and control
const CHUNK_SIZE_MB = 5;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MB * 1024 * 1024;
const FILE_PATH = path.join(__dirname, 'temp_storage_fill.dat');
const WRITE_DELAY_MS = 100; // Delay between writes to allow eviction checks/stats to catch up

console.log(`Starting process to fill storage up to ${targetSizeDisplay} in ${CHUNK_SIZE_MB} MB batches...`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    let currentSize = 0;
    
    if (fs.existsSync(FILE_PATH)) {
      currentSize = fs.statSync(FILE_PATH).size;
      console.log(`Found existing file of size: ${(currentSize / (1024 * 1024)).toFixed(2)} MB`);
    }

    if (currentSize >= targetSizeBytes) {
        console.log("Existing file already meets or exceeds target size. Deleting and restarting fill to ensure resource consumption simulation...");
        fs.unlinkSync(FILE_PATH);
        currentSize = 0;
    }

    const fd = fs.openSync(FILE_PATH, 'a');
    
    const buffer = Buffer.alloc(CHUNK_SIZE_BYTES, '0');

    let lastCpuUsage = process.cpuUsage();
    let lastTime = process.hrtime.bigint();
    const totalCores = os.cpus().length;

    while (currentSize < targetSizeBytes) {
      try {
        const remainingBytes = targetSizeBytes - currentSize;
        const bytesToWrite = Math.min(remainingBytes, CHUNK_SIZE_BYTES);
        
        const writeBuffer = bytesToWrite === CHUNK_SIZE_BYTES 
          ? buffer 
          : buffer.subarray(0, bytesToWrite);

        fs.writeSync(fd, writeBuffer);
        
        // Force flush to disk to ensure 'du' sees the data and Kubelet has a chance to see it
        fs.fsyncSync(fd);

        currentSize += bytesToWrite;
        
        const sizeMB = (currentSize / (1024 * 1024)).toFixed(2);
        const sizeGB = (currentSize / (1024 * 1024 * 1024)).toFixed(2);
        
        const currentCpuUsage = process.cpuUsage();
        const cpuDelta = process.cpuUsage(lastCpuUsage);
        const currentTime = process.hrtime.bigint();
        
        // Time calculations
        const timeDeltaNs = Number(currentTime - lastTime); // Nanoseconds
        const timeDeltaMs = timeDeltaNs / 1_000_000; // Milliseconds
        
        // Update baselines for next iteration
        lastCpuUsage = currentCpuUsage;
        lastTime = currentTime;

        // CPU calculations
        const cpuDeltaTotalMs = (cpuDelta.user + cpuDelta.system) / 1000;
        const usageRatio = timeDeltaMs > 0 ? cpuDeltaTotalMs / timeDeltaMs : 0;
        const millicores = (usageRatio * 1000).toFixed(2);
        const percentage = (usageRatio * 100).toFixed(2);

        console.log(`Current storage usage: ${sizeMB} MB (${sizeGB} GB)`);
        console.log(`CPU Stats:`);
        console.log(`  - Total Cores Available: ${totalCores}`);
        console.log(`  - Current Usage: ${millicores}m (${percentage}% of 1 core)`);
        console.log(`  - Raw Consumption (Chunk): User ${(cpuDelta.user / 1000).toFixed(2)}ms, System ${(cpuDelta.system / 1000).toFixed(2)}ms`);
        console.log(`  - Total Accumulated: User ${(currentCpuUsage.user / 1000).toFixed(2)}ms, System ${(currentCpuUsage.system / 1000).toFixed(2)}ms`);

        // Add delay to slow down the fill rate
        await sleep(WRITE_DELAY_MS);

      } catch (writeError) {
        console.error(`Stopped writing due to error (likely disk full): ${writeError.message}`);
        break;
      }
    }

    fs.closeSync(fd);
    console.log('Storage fill process completed or stopped.');

  } catch (error) {
    console.error('Fatal error in storage fill script:', error);
    process.exit(1);
  }
})();
