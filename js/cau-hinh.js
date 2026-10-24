// =====================================================================
// CẤU HÌNH ẢNH, LOGO, THANH TOÁN – chỉ cần sửa file này.
//
// CÁCH ĐƯA ẢNH VÀO: chép ảnh vào thư mục anh/ ĐÚNG TÊN FILE ghi bên dưới
// (ví dụ anh/indochina-queen/dai-dien.jpg). Không cần sửa code: có file là web tự hiện.
// Ô nào chưa có file thì web hiện khung "Hình ảnh đang cập nhật"; khi mở trên máy
// (localhost) khung đó ghi luôn tên file cần đưa vào.
//
// Muốn dùng tên file khác thì sửa đường dẫn ở đây. Muốn bỏ một ảnh thì xoá dòng đó.
// Kiểm tra ảnh nào còn thiếu:  node cong-cu/kiem-tra-anh.js
// Hướng dẫn chi tiết: tai-lieu/huong-dan-anh.md
// Ảnh JPG, mỗi ảnh < 500KB, rộng tối đa 1600px. Tên file không dấu, không khoảng trắng.
// =====================================================================

var CAU_HINH = {
  // Địa chỉ web khi chạy thật (dùng cho link chia sẻ Zalo/Facebook). Có tên miền riêng thì đổi ở đây
  // rồi chạy: node cong-cu/tao-trang.js
  tenMien: 'https://vetausaigon.vn',

  // Logo PNG nền trong suốt. Chưa có file thì web dùng biểu tượng con tàu.
  logo: {
    // Logo Nguyên Nguyên Travel nền trong suốt; web tự đặt nền xanh đậm theo tông màu trang.
    header: 'anh/logo/logo-nguyen-nguyen-trong-suot.png',  // cạnh chữ "Vé Tàu Sài Gòn" ở header, hiện cao 44px
    footer: 'anh/logo/logo-nguyen-nguyen-trong-suot.png'   // ở chân trang, hiện cao 96px
  },

  // Lịch còn chỗ online (Google Sheet + Apps Script, xem cong-cu/google-sheet/HUONG-DAN.md).
  // url: link Web App dạng https://script.google.com/macros/s/.../exec. Để trống = chỉ dùng js/lich-cho-du-lieu.js.
  lichChoOnline: {
    url: ''
  },

  // Nút mạng xã hội ở chân trang. Để trống ('') thì nút đó không hiện trên web.
  // Sửa xong chạy "Tạo lại các trang HTML" (node cong-cu/tao-trang.js).
  mangXaHoi: {
    facebook: 'https://www.facebook.com/share/19dfPzqptZ/',
    zalo: 'https://zalo.me/0948170036',
    tiktok: 'https://www.tiktok.com/@nguyennguyentravel',
    // Nút Messenger trong nút liên hệ nổi (m.me/<tên trang Facebook>). Để trống thì không hiện.
    messenger: 'https://m.me/antoitrenduthuyensaigon'
  },

  // Ảnh bìa trang chủ: chạy lần lượt (mờ dần + phóng nhẹ). Ảnh ngang ≥ 1600px.
  anhBia: [
    'anh/bia/bia-01.jpg',
    'anh/bia/bia-02.jpg',
    'anh/bia/bia-03.jpg',
    'anh/bia/bia-04.jpg'
  ],
  // Video bìa (không bắt buộc): .mp4 10–20 giây, < 5MB. Có video thì video thay ảnh bìa.
  videoBia: '',

  // Giới thiệu công ty ở chân trang.
  gioiThieuCongTy: 'Công ty TNHH Nguyên Nguyên Global là đại lý chính thức phân phối vé du thuyền ăn tối trên sông Sài Gòn: Indochina Queen, Indochina Star, Bến Nghé, Elite of Saigon, Saigon Princess và Bến Thành Princess. Chúng tôi tư vấn chọn tàu, chọn thực đơn, giữ chỗ và xuất hóa đơn VAT cho khách lẻ, gia đình và doanh nghiệp.',

  // Tài khoản nhận tiền. maNganHang là mã BIN VietQR (ACB = 970416).
  thanhToan: {
    caNhan: {
      tieuDe: 'Chuyển khoản cá nhân (không xuất hóa đơn VAT)',
      nganHang: 'ACB', maNganHang: '970416',
      soTaiKhoan: '25960437', chuTaiKhoan: 'Lê Hoàng Thảo Nguyên',
      anhQR: ''   // để trống = web tự tạo mã VietQR có sẵn số tiền (khuyên dùng)
    },
    congTy: {
      tieuDe: 'Chuyển khoản công ty (xuất hóa đơn VAT)',
      nganHang: 'ACB', maNganHang: '970416',
      soTaiKhoan: '4988888666', chuTaiKhoan: 'Công Ty TNHH Nguyên Nguyên Global',
      anhQR: ''   // để trống = web tự tạo mã VietQR có sẵn số tiền (khuyên dùng)
    }
  },

  // Khoá công khai để kiểm tra chữ ký trên phiếu (chống làm giả). Lấy ở xac-nhan.html → "Tạo khoá ký phiếu",
  // dán đúng dòng web đưa ra vào đây rồi push lên GitHub. null = chưa cài (phiếu chưa ký được).
  khoaCongKhai: {"kty":"EC","crv":"P-256","x":"Y28h2vJXQGDorkOGL8iCgAEV0sh7UNPnW1j9sx6GM2g","y":"Gxq_2r4GNjEMadg-VEBKAySkdFUuSNDr9fOklC9BT40"},

  // Ảnh từng tàu: ảnh đại diện, thư viện ảnh (tối đa bao nhiêu cũng được), ảnh khuyến mãi.
  anhTau: {
    'indochina-star': {   // Indochina Star
      daiDien: 'anh/indochina-star/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/indochina-star/tau-01.jpg',
        'anh/indochina-star/tau-02.jpg',
        'anh/indochina-star/tau-03.jpg',
        'anh/indochina-star/tau-04.jpg',
        'anh/indochina-star/tau-05.jpg',
        'anh/indochina-star/tau-06.jpg',
        'anh/indochina-star/tau-07.jpg',
        'anh/indochina-star/tau-08.jpg'
      ],
      khuyenMai: {}
    },
    'ben-nghe': {   // Bến Nghé
      daiDien: 'anh/ben-nghe/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/ben-nghe/tau-01.jpg',
        'anh/ben-nghe/tau-02.jpg',
        'anh/ben-nghe/tau-03.jpg',
        'anh/ben-nghe/tau-04.jpg',
        'anh/ben-nghe/tau-05.jpg',
        'anh/ben-nghe/tau-06.jpg',
        'anh/ben-nghe/tau-07.jpg',
        'anh/ben-nghe/tau-08.jpg'
      ],
      khuyenMai: {}
    },
    'indochina-queen': {   // Indochina Queen
      daiDien: 'anh/indochina-queen/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/indochina-queen/tau-01.jpg',
        'anh/indochina-queen/tau-02.jpg',
        'anh/indochina-queen/tau-03.jpg',
        'anh/indochina-queen/tau-04.jpg',
        'anh/indochina-queen/tau-05.jpg',
        'anh/indochina-queen/tau-06.jpg',
        'anh/indochina-queen/tau-07.jpg',
        'anh/indochina-queen/tau-08.jpg'
      ],
      khuyenMai: {}
    },
    'elite-of-saigon': {   // Elite of Saigon
      daiDien: 'anh/elite-of-saigon/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/elite-of-saigon/tau-01.jpg',
        'anh/elite-of-saigon/tau-02.jpg',
        'anh/elite-of-saigon/tau-03.jpg',
        'anh/elite-of-saigon/tau-04.jpg',
        'anh/elite-of-saigon/tau-05.jpg',
        'anh/elite-of-saigon/tau-06.jpg',
        'anh/elite-of-saigon/tau-07.jpg',
        'anh/elite-of-saigon/tau-08.jpg'
      ],
      khuyenMai: {
        'Mid-week Chill': 'anh/elite-of-saigon/khuyen-mai-mid-week-chill.jpg'
      }
    },
    'saigon-princess': {   // Saigon Princess
      daiDien: 'anh/saigon-princess/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/saigon-princess/tau-01.jpg',
        'anh/saigon-princess/tau-02.jpg',
        'anh/saigon-princess/tau-03.jpg',
        'anh/saigon-princess/tau-04.jpg',
        'anh/saigon-princess/tau-05.jpg',
        'anh/saigon-princess/tau-06.jpg',
        'anh/saigon-princess/tau-07.jpg',
        'anh/saigon-princess/tau-08.jpg'
      ],
      khuyenMai: {
        'Gói trang trí cơ bản': 'anh/saigon-princess/khuyen-mai-goi-trang-tri-co-ban.jpg'
      }
    },
    'ben-thanh-princess': {   // Bến Thành Princess
      daiDien: 'anh/ben-thanh-princess/dai-dien.jpg',   // ảnh ngoài tàu đẹp nhất: thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link
      thuVien: [
        'anh/ben-thanh-princess/tau-01.jpg',
        'anh/ben-thanh-princess/tau-02.jpg',
        'anh/ben-thanh-princess/tau-03.jpg',
        'anh/ben-thanh-princess/tau-04.jpg',
        'anh/ben-thanh-princess/tau-05.jpg',
        'anh/ben-thanh-princess/tau-06.jpg',
        'anh/ben-thanh-princess/tau-07.jpg',
        'anh/ben-thanh-princess/tau-08.jpg'
      ],
      khuyenMai: {}
    },
  },

  // Ảnh thực đơn cho TỪNG món khách chọn (nút "Xem menu"). Một món có thể nhiều ảnh:
  //   'INDO8': ['anh/indochina-queen/menu/set-indo8.jpg', 'anh/indochina-queen/menu/set-indo8-2.jpg'],
  // KHÔNG sửa tên món bên trái dấu ":" (phải khớp bảng giá trong js/du-lieu-tau.js).
  anhThucDon: {
    'indochina-star': {   // Indochina Star
      'Buffet': {
        'Tầng 1': ['anh/indochina-star/menu/buffet-tang-1.jpg'],
        'Tầng 2': ['anh/indochina-star/menu/buffet-tang-2.jpg'],
      },
    },
    'ben-nghe': {   // Bến Nghé
      'Buffet': {
        'Buffet': ['anh/ben-nghe/menu/buffet.jpg'],
      },
    },
    'indochina-queen': {   // Indochina Queen
      'Buffet': {
        'Tầng 1': ['anh/indochina-queen/menu/buffet-tang-1.jpg'],
        'Tầng 2': ['anh/indochina-queen/menu/buffet-tang-2.jpg'],
        'Tầng 3': ['anh/indochina-queen/menu/buffet-tang-3.jpg'],
      },
      'Set menu': {
        'INDO7': ['anh/indochina-queen/menu/set-indo7.jpg'],
        'INDO8': ['anh/indochina-queen/menu/set-indo8.jpg'],
        'INDO9': ['anh/indochina-queen/menu/set-indo9.jpg'],
        'INDO10': ['anh/indochina-queen/menu/set-indo10.jpg'],
        'INDO11': ['anh/indochina-queen/menu/set-indo11.jpg'],
        'INDO12': ['anh/indochina-queen/menu/set-indo12.jpg'],
        'INDO13': ['anh/indochina-queen/menu/set-indo13.jpg'],
        'INDO14': ['anh/indochina-queen/menu/set-indo14.jpg'],
        'INDO15': ['anh/indochina-queen/menu/set-indo15.jpg'],
        'INDO16': ['anh/indochina-queen/menu/set-indo16.jpg'],
        'INDO17': ['anh/indochina-queen/menu/set-indo17.jpg'],
      },
    },
    'elite-of-saigon': {   // Elite of Saigon
      'Buffet – Tầng 1': {
        'Buffet': ['anh/elite-of-saigon/menu/buffet.jpg'],
      },
      'Set menu – Tầng 2': {
        'Menu Âu': ['anh/elite-of-saigon/menu/set-menu-au.jpg'],
        'Menu Á': ['anh/elite-of-saigon/menu/set-menu-a.jpg'],
        'Menu Việt': ['anh/elite-of-saigon/menu/set-menu-viet.jpg'],
        'Menu Ấn': ['anh/elite-of-saigon/menu/set-menu-an.jpg'],
        'Menu Chay': ['anh/elite-of-saigon/menu/set-menu-chay.jpg'],
        'Menu Trẻ em': ['anh/elite-of-saigon/menu/set-menu-tre-em.jpg'],
      },
    },
    'saigon-princess': {   // Saigon Princess
      'Set menu': {
        '3 món – Việt Nam': ['anh/saigon-princess/menu/set-3-mon-viet-nam.jpg'],
        '3 món – Quốc tế (bò Nhật)': ['anh/saigon-princess/menu/set-3-mon-quoc-te-bo-nhat.jpg'],
        '3 món – Âu (bò New Zealand)': ['anh/saigon-princess/menu/set-3-mon-au-bo-new-zealand.jpg'],
        '3 món – Á Âu': ['anh/saigon-princess/menu/set-3-mon-a-au.jpg'],
        '4 món – Á Âu (bò New Zealand)': ['anh/saigon-princess/menu/set-4-mon-a-au-bo-new-zealand.jpg'],
        '4 món – Á Âu (bò Nhật)': ['anh/saigon-princess/menu/set-4-mon-a-au-bo-nhat.jpg'],
        '4 món – Việt Nam': ['anh/saigon-princess/menu/set-4-mon-viet-nam.jpg'],
        '4 món – Hải sản': ['anh/saigon-princess/menu/set-4-mon-hai-san.jpg'],
        '5 món – Tinh Hoa': ['anh/saigon-princess/menu/set-5-mon-tinh-hoa.jpg'],
        '5 món – Thanh Vị (bò New Zealand)': ['anh/saigon-princess/menu/set-5-mon-thanh-vi-bo-new-zealand.jpg'],
        '5 món – Thanh Vị (bò Nhật)': ['anh/saigon-princess/menu/set-5-mon-thanh-vi-bo-nhat.jpg'],
        '5 món – Á Âu (bò Nhật)': ['anh/saigon-princess/menu/set-5-mon-a-au-bo-nhat.jpg'],
        '5 món – Hải sản': ['anh/saigon-princess/menu/set-5-mon-hai-san.jpg'],
        '5 món – Á Âu (bò New Zealand)': ['anh/saigon-princess/menu/set-5-mon-a-au-bo-new-zealand.jpg'],
        '5 món – Việt Nam': ['anh/saigon-princess/menu/set-5-mon-viet-nam.jpg'],
        '5 món – Hương Việt': ['anh/saigon-princess/menu/set-5-mon-huong-viet.jpg'],
        '5 món – Chay': ['anh/saigon-princess/menu/set-5-mon-chay.jpg'],
        '4 món – Chay': ['anh/saigon-princess/menu/set-4-mon-chay.jpg'],
        'Trẻ em – Donald': ['anh/saigon-princess/menu/set-tre-em-donald.jpg'],
        'Trẻ em – Pluto': ['anh/saigon-princess/menu/set-tre-em-pluto.jpg'],
      },
    },
    'ben-thanh-princess': {   // Bến Thành Princess
      'Set menu': {
        '3 món – Quốc tế': ['anh/ben-thanh-princess/menu/set-3-mon-quoc-te.jpg'],
        '3 món – Á Âu': ['anh/ben-thanh-princess/menu/set-3-mon-a-au.jpg'],
        '3 món – Âu': ['anh/ben-thanh-princess/menu/set-3-mon-au.jpg'],
        '3 món – Việt Nam': ['anh/ben-thanh-princess/menu/set-3-mon-viet-nam.jpg'],
        '4 món – Á Âu (bò New Zealand)': ['anh/ben-thanh-princess/menu/set-4-mon-a-au-bo-new-zealand.jpg'],
        '4 món – Á Âu (bò Nhật)': ['anh/ben-thanh-princess/menu/set-4-mon-a-au-bo-nhat.jpg'],
        '4 món – Việt Nam': ['anh/ben-thanh-princess/menu/set-4-mon-viet-nam.jpg'],
        '4 món – Hải sản': ['anh/ben-thanh-princess/menu/set-4-mon-hai-san.jpg'],
        '5 món – Mỹ Vị (bò New Zealand)': ['anh/ben-thanh-princess/menu/set-5-mon-my-vi-bo-new-zealand.jpg'],
        '5 món – Mỹ Vị (bò Nhật)': ['anh/ben-thanh-princess/menu/set-5-mon-my-vi-bo-nhat.jpg'],
        '5 món – Á Âu (bò New Zealand)': ['anh/ben-thanh-princess/menu/set-5-mon-a-au-bo-new-zealand.jpg'],
        '5 món – Á Âu (bò Nhật)': ['anh/ben-thanh-princess/menu/set-5-mon-a-au-bo-nhat.jpg'],
        '5 món – Nét Việt': ['anh/ben-thanh-princess/menu/set-5-mon-net-viet.jpg'],
        '5 món – Hải sản': ['anh/ben-thanh-princess/menu/set-5-mon-hai-san.jpg'],
        '5 món – Việt Nam': ['anh/ben-thanh-princess/menu/set-5-mon-viet-nam.jpg'],
        '5 món – Tinh Tế': ['anh/ben-thanh-princess/menu/set-5-mon-tinh-te.jpg'],
        '5 món – Chay': ['anh/ben-thanh-princess/menu/set-5-mon-chay.jpg'],
        '4 món – Chay': ['anh/ben-thanh-princess/menu/set-4-mon-chay.jpg'],
        'Trẻ em – Pluto': ['anh/ben-thanh-princess/menu/set-tre-em-pluto.jpg'],
        'Trẻ em – Donald': ['anh/ben-thanh-princess/menu/set-tre-em-donald.jpg'],
      },
    },
  }
};

if (typeof module !== 'undefined') {
  module.exports = { CAU_HINH: CAU_HINH };
}
