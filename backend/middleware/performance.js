import colors from 'colors';

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log performance metrics
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    
    // Color code based on response time
    let timeColor = colors.green;
    if (responseTime > 1000) timeColor = colors.red;
    else if (responseTime > 500) timeColor = colors.yellow;
    
    // Color code based on status code
    let statusColor = colors.green;
    if (statusCode >= 400) statusColor = colors.red;
    else if (statusCode >= 300) statusColor = colors.yellow;
    
    console.log(
      `${colors.cyan(method)} ${colors.white(url)} - ` +
      `${statusColor(statusCode)} - ` +
      `${timeColor(responseTime + 'ms')}`
    );
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(colors.yellow(`⚠️  Slow request detected: ${method} ${url} took ${responseTime}ms`));
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Memory usage monitoring
export const memoryMonitor = () => {
  const usage = process.memoryUsage();
  const formatMemory = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
  
  console.log(colors.blue('📊 Memory Usage:'));
  console.log(`   RSS: ${formatMemory(usage.rss)} MB`);
  console.log(`   Heap Used: ${formatMemory(usage.heapUsed)} MB`);
  console.log(`   Heap Total: ${formatMemory(usage.heapTotal)} MB`);
  console.log(`   External: ${formatMemory(usage.external)} MB`);
  
  // Warn if memory usage is high
  const heapUsedMB = formatMemory(usage.heapUsed);
  if (heapUsedMB > 100) {
    console.warn(colors.yellow(`⚠️  High memory usage detected: ${heapUsedMB} MB`));
  }
};

// Start memory monitoring
export const startMemoryMonitoring = (intervalMs = 60000) => {
  setInterval(memoryMonitor, intervalMs);
  console.log(colors.green(`📊 Memory monitoring started (interval: ${intervalMs}ms)`));
};