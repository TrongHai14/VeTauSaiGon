// NGÀY HẾT CHỖ / CÒN ÍT CHỖ – Ms Nguyên sửa file này.
// Mỗi dòng: 'năm-tháng-ngày': 'het'  (hết chỗ, khách không chọn được)
//           'năm-tháng-ngày': 'it'   (còn ít chỗ, vẫn đặt được, hiện màu cam)
// Viết đúng dạng 2026-12-24 (4 số năm - 2 số tháng - 2 số ngày), có dấu nháy ' ' và dấu phẩy cuối dòng.
// Ngày không ghi = còn chỗ. Ngày đã qua tự khoá.
// Lỡ gõ sai làm file lỗi: web KHÔNG hỏng, chỉ coi mọi ngày là còn chỗ (bấm F12 > Console sẽ thấy báo lỗi).
// Sửa xong, web thật có thể mất khoảng 10 phút mới cập nhật.
var LICH_CHO = {
  'indochina-star': {
    // '2026-12-24': 'het',
  },
  'ben-nghe': {
  },
  'indochina-queen': {
    // '2026-12-31': 'it',
  },
  'elite-of-saigon': {
  },
  'saigon-princess': {
  },
  'ben-thanh-princess': {
  }
};

if (typeof module !== 'undefined') {
  module.exports = { LICH_CHO: LICH_CHO };
}
