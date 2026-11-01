// Nạp trước mọi test: chặn mạng thật để test không ghi vào Google Sheet và email thật.
// Test nào cần mạng thì tự gán fetch giả.
global.fetch = function () {
  return Promise.reject(new Error('test khong duoc goi mang that'));
};
