// =====================================================================
// CẤU HÌNH ẢNH, LOGO, THANH TOÁN – chỉ cần sửa file này.
// Đường dẫn ảnh tính từ thư mục gốc của web (cùng chỗ với index.html),
// ví dụ: 'anh/indochina-queen/menu-01.jpg'. Ô nào để trống ('' hoặc [])
// thì web tự dùng ảnh/biểu tượng mặc định. Hướng dẫn: tai-lieu/huong-dan-anh.md
// =====================================================================

var CAU_HINH = {
  // Logo: ảnh PNG/SVG nền trong suốt. Header cao 40px, footer cao 48px.
  logo: {
    header: '',          // ví dụ: 'anh/logo/logo-mau.png'
    footer: ''           // ví dụ: 'anh/logo/logo-trang.png' (logo màu trắng cho nền tối)
  },

  // Ảnh bìa trang chủ: các ảnh chạy lần lượt (mờ dần + phóng nhẹ).
  // Nên dùng ảnh ngang ≥ 1600px, mỗi ảnh < 500KB.
  anhBia: [
    'anh/indochina-queen/tau-01.jpg',
    'anh/saigon-princess/tau-01.jpg',
    'anh/elite-of-saigon/tau-01.jpg',
    'anh/ben-nghe/tau-08.jpg'
  ],
  // Video bìa (không bắt buộc): file .mp4 ngắn 10–20 giây, < 5MB. Có video thì video thay cho ảnh bìa.
  videoBia: '',

  // Giới thiệu công ty ở chân trang.
  gioiThieuCongTy: 'Công ty TNHH Nguyên Nguyên Global là đại lý chính thức phân phối vé du thuyền ăn tối trên sông Sài Gòn: ' +
    'Indochina Queen, Indochina Star, Bến Nghé, Elite of Saigon, Saigon Princess và Bến Thành Princess. ' +
    'Chúng tôi tư vấn chọn tàu, chọn thực đơn, giữ chỗ và xuất hóa đơn VAT cho khách lẻ, gia đình và doanh nghiệp.',

  // Tài khoản nhận tiền. maNganHang là mã BIN VietQR (ACB = 970416) để tự tạo mã QR có sẵn số tiền.
  // anhQR: nếu điền ảnh QR có sẵn thì web hiện ảnh đó thay cho QR tự tạo (khách phải tự nhập số tiền).
  thanhToan: {
    caNhan: {
      tieuDe: 'Chuyển khoản cá nhân (không xuất hóa đơn VAT)',
      nganHang: 'ACB', maNganHang: '970416',
      soTaiKhoan: '25960437', chuTaiKhoan: 'Lê Hoàng Thảo Nguyên',
      anhQR: ''
    },
    congTy: {
      tieuDe: 'Chuyển khoản công ty (xuất hóa đơn VAT)',
      nganHang: 'ACB', maNganHang: '970416',
      soTaiKhoan: '4988888666', chuTaiKhoan: 'Công Ty TNHH Nguyên Nguyên Global',
      anhQR: ''
    }
  },

  // Ảnh thực đơn cho TỪNG món khách chọn: điền 1 hoặc nhiều ảnh vào mảng [].
  // Ví dụ: 'INDO7': ['anh/indochina-queen/menu-01.jpg'],
  // Món nào chưa có ảnh thì nút “Xem menu” mở toàn bộ ảnh menu chung của tàu.
  anhThucDon: {
  'indochina-star': {   // Indochina Star – ảnh menu chung hiện có: anh/indochina-star/menu-01.jpg … menu-03.jpg
    'Buffet': {
      'Tầng 1': [],
      'Tầng 2': [],
    },
  },
  'ben-nghe': {   // Bến Nghé – ảnh menu chung hiện có: anh/ben-nghe/menu-01.jpg … menu-11.jpg
    'Buffet': {
      'Buffet': [],
    },
  },
  'indochina-queen': {   // Indochina Queen – ảnh menu chung hiện có: anh/indochina-queen/menu-01.jpg … menu-13.jpg
    'Buffet': {
      'Tầng 1': [],
      'Tầng 2': [],
      'Tầng 3': [],
    },
    'Set menu': {
      'INDO7': [],
      'INDO8': [],
      'INDO9': [],
      'INDO10': [],
      'INDO11': [],
      'INDO12': [],
      'INDO13': [],
      'INDO14': [],
      'INDO15': [],
      'INDO16': [],
      'INDO17': [],
    },
  },
  'elite-of-saigon': {   // Elite of Saigon – ảnh menu chung hiện có: anh/elite-of-saigon/menu-01.jpg … menu-14.jpg
    'Buffet – Tầng 1': {
      'Buffet': [],
    },
    'Set menu – Tầng 2': {
      'Menu Âu': [],
      'Menu Á': [],
      'Menu Việt': [],
      'Menu Ấn': [],
      'Menu Chay': [],
      'Menu Trẻ em': [],
    },
  },
  'saigon-princess': {   // Saigon Princess – ảnh menu chung hiện có: anh/saigon-princess/menu-01.jpg … menu-20.jpg
    'Set menu': {
      '3 món – Việt Nam': [],
      '3 món – Quốc tế (bò Nhật)': [],
      '3 món – Âu (bò New Zealand)': [],
      '3 món – Á Âu': [],
      '4 món – Á Âu (bò New Zealand)': [],
      '4 món – Á Âu (bò Nhật)': [],
      '4 món – Việt Nam': [],
      '4 món – Hải sản': [],
      '5 món – Tinh Hoa': [],
      '5 món – Thanh Vị (bò New Zealand)': [],
      '5 món – Thanh Vị (bò Nhật)': [],
      '5 món – Á Âu (bò Nhật)': [],
      '5 món – Hải sản': [],
      '5 món – Á Âu (bò New Zealand)': [],
      '5 món – Việt Nam': [],
      '5 món – Hương Việt': [],
      '5 món – Chay': [],
      '4 món – Chay': [],
      'Trẻ em – Donald': [],
      'Trẻ em – Pluto': [],
    },
  },
  'ben-thanh-princess': {   // Bến Thành Princess – ảnh menu chung hiện có: anh/ben-thanh-princess/menu-01.jpg … menu-20.jpg
    'Set menu': {
      '3 món – Quốc tế': [],
      '3 món – Á Âu': [],
      '3 món – Âu': [],
      '3 món – Việt Nam': [],
      '4 món – Á Âu (bò New Zealand)': [],
      '4 món – Á Âu (bò Nhật)': [],
      '4 món – Việt Nam': [],
      '4 món – Hải sản': [],
      '5 món – Mỹ Vị (bò New Zealand)': [],
      '5 món – Mỹ Vị (bò Nhật)': [],
      '5 món – Á Âu (bò New Zealand)': [],
      '5 món – Á Âu (bò Nhật)': [],
      '5 món – Nét Việt': [],
      '5 món – Hải sản': [],
      '5 món – Việt Nam': [],
      '5 món – Tinh Tế': [],
      '5 món – Chay': [],
      '4 món – Chay': [],
      'Trẻ em – Pluto': [],
      'Trẻ em – Donald': [],
    },
  },
  }
};

if (typeof module !== 'undefined') {
  module.exports = { CAU_HINH };
}
