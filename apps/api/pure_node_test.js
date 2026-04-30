const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'diagnosis.log');
const msg = `[${new Date().toISOString()}] PURE NODE TEST OK\n`;
fs.appendFileSync(logPath, msg);
console.log('Pure Node Test Finished');
process.exit(0);
