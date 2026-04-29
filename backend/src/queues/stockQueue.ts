import Bull from 'bull';

const stockAlertQueue = new Bull('stockAlert', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Process the job
stockAlertQueue.process(async (job) => {
  const { productName, stock, threshold, warehouseName } = job.data;
  console.log(`🚨 LOW STOCK ALERT: ${productName} in ${warehouseName} — Stock: ${stock}, Threshold: ${threshold}`);
});

// Log completed jobs
stockAlertQueue.on('completed', (job) => {
  console.log(`Stock alert job ${job.id} completed`);
});

// Log failed jobs
stockAlertQueue.on('failed', (job, err) => {
  console.log(`Stock alert job ${job.id} failed:`, err.message);
});

export default stockAlertQueue;