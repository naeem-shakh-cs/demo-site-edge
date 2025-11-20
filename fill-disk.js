const fs = require('fs');
const path = require('path');

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

const CHUNK_SIZE_MB = 100;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MB * 1024 * 1024;
const FILE_PATH = path.join(__dirname, 'temp_storage_fill.dat');

console.log(`Starting process to fill storage up to ${targetSizeDisplay} in ${CHUNK_SIZE_MB} MB batches...`);

try {
  let currentSize = 0;
  // Since this runs after 'next build', artifacts from previous runs might persist if not cleaned.
  // We should check if file exists.
  if (fs.existsSync(FILE_PATH)) {
    currentSize = fs.statSync(FILE_PATH).size;
    console.log(`Found existing file of size: ${(currentSize / (1024 * 1024)).toFixed(2)} MB`);
  }

  // If we are already at or above target size, we might want to stop or maybe the user wants to fill MORE?
  // The user said "keep on using more and more storage". 
  // If the file is already 500MB from a previous run, and we run again with 500MB limit, 
  // it will see currentSize >= targetSizeBytes and skip the loop.
  // That explains the empty output in the user screenshot!
  
  // Let's clarify intent: Does "build" imply a fresh start for this file? 
  // Usually build processes clean dist folders but maybe not root files.
  // I will add a cleanup step at the START if we want to guarantee filling 500MB *added* 
  // OR just say "Storage fill process completed" immediately if full.
  
  // However, typically a "build" command should probably clean up its own temporary trash from previous runs 
  // if it's meant to simulate resource consumption *during* that build.
  // Let's delete the file if it exists and starts fresh, OR communicate why it skipped.
  
  // Given the user wants to test "using more and more storage", it's likely a stress test.
  // If the file is already there, the test is "already done". 
  // Let's force a fresh start so every "npm run build" actually consumes resources.
  
  if (currentSize >= targetSizeBytes) {
      console.log("Existing file already meets or exceeds target size. Deleting and restarting fill to ensure resource consumption simulation...");
      fs.unlinkSync(FILE_PATH);
      currentSize = 0;
  }

  const fd = fs.openSync(FILE_PATH, 'a');
  
  // Create a buffer filled with some data
  const buffer = Buffer.alloc(CHUNK_SIZE_BYTES, '0');

  while (currentSize < targetSizeBytes) {
    try {
      // Check if we need to write a partial chunk to hit exact size
      const remainingBytes = targetSizeBytes - currentSize;
      const bytesToWrite = Math.min(remainingBytes, CHUNK_SIZE_BYTES);
      
      // If bytesToWrite is smaller than chunk size, slice the buffer
      const writeBuffer = bytesToWrite === CHUNK_SIZE_BYTES 
        ? buffer 
        : buffer.subarray(0, bytesToWrite);

      fs.writeSync(fd, writeBuffer);
      currentSize += bytesToWrite;
      
      const sizeMB = (currentSize / (1024 * 1024)).toFixed(2);
      const sizeGB = (currentSize / (1024 * 1024 * 1024)).toFixed(2);
      
      console.log(`Current storage usage: ${sizeMB} MB (${sizeGB} GB)`);
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
