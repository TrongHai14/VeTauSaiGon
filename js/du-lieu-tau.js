var THONG_TIN_WEB = { ten: 'Vé Tàu Sài Gòn', tenMien: 'https://vetausaigon.vn' };
var LIEN_HE = {
  soDienThoai: '0948170036', tenNguoiLienHe: 'Ms Nguyên',
  linkGoi: 'tel:0948170036', linkZalo: 'https://zalo.me/0948170036'
};
var DIA_CHI_MAC_DINH = '5 Nguyễn Tất Thành, Phường Xóm Chiếu, Hồ Chí Minh';
var CONG_TY = { ten: 'Công ty TNHH Nguyên Nguyên Global', mst: '0319143429', vaiTro: 'Đại lý chính thức' };

// Tạo danh sách ảnh: tên file theo thứ tự đánh số 2 chữ số, alt = moTa + số thứ tự trong danh sách.
// danhSoThuTu: các số thứ tự của file (ví dụ [1, 3, 4] -> loai-01.jpg, loai-03.jpg, loai-04.jpg).
function taoDanhSachAnh(slug, loai, danhSoThuTu, moTa) {
  var ketQua = [];
  for (var i = 0; i < danhSoThuTu.length; i++) {
    var so = danhSoThuTu[i];
    ketQua.push({
      src: 'anh/' + slug + '/' + loai + '-' + (so < 10 ? '0' : '') + so + '.jpg',
      alt: moTa + ' ' + (i + 1)
    });
  }
  return ketQua;
}

// Dãy số từ tu đến den (gồm cả hai đầu).
function dayso(tu, den) {
  var ketQua = [];
  for (var i = tu; i <= den; i++) ketQua.push(i);
  return ketQua;
}

var CHINH_SACH_TRE_EM_PRINCESS = [
  'Trẻ em dưới 6 tuổi: ăn chung với bố mẹ và được tặng kèm 1 phần soup cho bé. Mỗi người lớn được kèm tối đa 1 bé, bé phát sinh phụ thu 100.000 VND/bé.',
  'Trẻ em từ đủ 6 tuổi đến 11 tuổi: chọn thực đơn Donald Kid hoặc Pluto Kid.',
  'Trẻ em trên 11 tuổi: chọn thực đơn theo chính sách giá người lớn (thực đơn 3 món, 4 món và 5 món). Trường hợp trẻ em trên 11 tuổi và người lớn chọn thực đơn trẻ em (Donald hoặc Pluto) sẽ phụ thu 200.000 VND/khách.',
  'Trẻ em: chọn 1 thực đơn giống nhau hoặc 2 thực đơn trẻ em khác nhau.'
];

var DANH_SACH_TAU = [
  {
    slug: 'indochina-star',
    ten: 'Indochina Star',
    moTaNgan: 'Buffet tối trên du thuyền Indochina Star qua sông Sài Gòn: đón khách 18h00, tàu chạy 19h45, cập bến 21h15, có nhạc và múa dân tộc.',
    anhDaiDien: 'anh/indochina-star/tau-01.jpg',
    gioChay: { donKhach: '18h00', khoiHanh: '19h45', capBen: '21h15', ghiChu: null },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: ['Cảng Sài Gòn', 'Cầu Thủ Thiêm', 'Landmark 81', 'Cầu Sài Gòn'],
    bangGia: [
      {
        tieuDe: 'Buffet',
        ghiChu: 'Giá đã bao gồm VAT. Tầng 3 là tầng thượng để khách ngắm cảnh khi lên tàu.',
        dong: [
          { ten: 'Tầng 1', tenPhu: null, gia: 615600 },
          { ten: 'Tầng 2', tenPhu: null, gia: 669600 }
        ]
      }
    ],
    khuyenMai: [],
    chinhSachTreEm: [
      'Trẻ em từ 0-4 tuổi (dưới 1m): miễn phí.',
      'Trẻ em từ 5-9 tuổi (từ 1m đến dưới 1,3m): tính 50% giá người lớn.',
      'Từ 10 tuổi (trên 1,3m): tính vé người lớn.'
    ],
    giaiTri: [
      'Tầng 1: nhạc dân tộc và 2 bài múa dân tộc.',
      'Tầng 2: nhạc dân tộc và 2 bài múa dân tộc.',
      'Boong tàu: nhạc Philippines sôi động.'
    ],
    anhTau: taoDanhSachAnh('indochina-star', 'tau', [1, 2], 'Du thuyền Indochina Star'),
    anhMenu: taoDanhSachAnh('indochina-star', 'menu', [1, 2, 3], 'Thực đơn buffet tàu Indochina Star'),
    anhKhac: []
  },
  {
    slug: 'ben-nghe',
    ten: 'Bến Nghé',
    moTaNgan: 'Du thuyền Bến Nghé ăn tối buffet và set menu trên sông Sài Gòn: đón khách 17h15, khởi hành 20h00, cập bến 21h30, nhạc sống hằng đêm.',
    anhDaiDien: 'anh/ben-nghe/tau-08.jpg',
    moTaGia: 'Set menu từ 469.000đ · Buffet 733.320đ',
    gioChay: {
      donKhach: '17h15', khoiHanh: '20h00', capBen: '21h30',
      ghiChu: 'Quý khách chỉ cần có mặt trước 20h00. Từ 19h00 đến 20h00 quý khách đã có thể dùng dịch vụ trên tàu (ăn uống, nghe nhạc…) trong lúc tàu chưa khởi hành.'
    },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: [
      'Cảng Sài Gòn (đường Nguyễn Tất Thành, cạnh Bến Nhà Rồng)',
      'Cảng Bến Nghé', 'Cầu Tân Thuận', 'Đảo Kim Cương', 'Cảng Sài Gòn'
    ],
    bangGia: [
      {
        tieuDe: 'Buffet',
        ghiChu: 'Đã bao gồm VAT và vé lên tàu, chưa bao gồm nước uống.',
        dong: [{ ten: 'Buffet', tenPhu: null, gia: 733320 }]
      }
    ],
    khuyenMai: [],
    chinhSachTreEm: [
      'Trẻ em từ 9 tuổi trở lên: tính 1 suất như người lớn.',
      'Trẻ em từ 4 – 8 tuổi: tính 50% = ½ suất.',
      'Trẻ em dưới 4 tuổi: nếu đặt ăn tính 50% = ½ suất, nếu không đặt thì xếp ghế, trẻ ăn cùng gia đình.',
      'Đối với nhóm khách có quá nhiều trẻ em thì phải cân đối lại cho đủ khẩu phần.'
    ],
    giaiTri: [
      'Chương trình nhạc sống hằng đêm từ 19h đến 21h15.',
      'Cuối tuần (thứ sáu đến chủ nhật) có thêm belly dance hoặc múa cổ trang.',
      'Riêng tầng thượng cuối tuần đang thử nghiệm DJ.'
    ],
    anhTau: taoDanhSachAnh('ben-nghe', 'tau', dayso(1, 13), 'Du thuyền Bến Nghé'),
    anhMenu: taoDanhSachAnh('ben-nghe', 'menu', dayso(1, 11), 'Thực đơn tàu Bến Nghé'),
    anhKhac: taoDanhSachAnh('ben-nghe', 'khac', dayso(1, 16), 'Món buffet tàu Bến Nghé')
  },
  {
    slug: 'indochina-queen',
    ten: 'Indochina Queen',
    moTaNgan: 'Indochina Queen – Tàu Nữ Hoàng Đông Dương: buffet và set menu trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h45, cập bến 21h15.',
    anhDaiDien: 'anh/indochina-queen/tau-01.jpg',
    gioChay: { donKhach: '18h00', khoiHanh: '19h45', capBen: '21h15', ghiChu: null },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: [
      'Cảng Sài Gòn', 'Bến Nhà Rồng', 'Bến Bạch Đằng', 'Cầu Ba Son',
      'Cầu Tân Thuận (Quận 7)', 'Quay lại Cảng Sài Gòn (nơi đón khách) để trả khách'
    ],
    bangGia: [
      {
        tieuDe: 'Buffet',
        ghiChu: 'Tiệc buffet không giới hạn, giá đã bao gồm VAT.',
        dong: [
          { ten: 'Tầng 1', tenPhu: null, gia: 561600 },
          { ten: 'Tầng 2', tenPhu: null, gia: 615600 },
          { ten: 'Tầng 3', tenPhu: null, gia: 669600 }
        ]
      },
      {
        tieuDe: 'Set menu',
        ghiChu: 'Set menu chỉ phục vụ ở tầng 3 (sảnh VIP).',
        dong: [
          { ten: 'INDO7', tenPhu: null, gia: 723600 },
          { ten: 'INDO8', tenPhu: null, gia: 723600 },
          { ten: 'INDO9', tenPhu: null, gia: 831600 },
          { ten: 'INDO10', tenPhu: null, gia: 831600 },
          { ten: 'INDO11', tenPhu: null, gia: 939600 },
          { ten: 'INDO12', tenPhu: null, gia: 939600 },
          { ten: 'INDO13', tenPhu: null, gia: 1047600 },
          { ten: 'INDO14', tenPhu: null, gia: 1047600 },
          { ten: 'INDO15', tenPhu: null, gia: 1209600 },
          { ten: 'INDO16', tenPhu: null, gia: 1425600 },
          { ten: 'INDO17', tenPhu: null, gia: 1641600 }
        ]
      }
    ],
    khuyenMai: [],
    chinhSachTreEm: [
      'Trẻ 1–4 tuổi (dưới 1m): miễn phí lên tàu, bố mẹ tự lo ăn cho bé.',
      'Trẻ 5–9 tuổi (1m – dưới 1,3m): 50% giá người lớn. Set menu có tôm càng, cua… thì trẻ tính 70%.',
      'Trẻ từ 10 tuổi (trên 1,3m): tính như người lớn.',
      'Hai người lớn được kèm 01 trẻ 1m–1,3m, từ trẻ thứ 2 tính như người lớn.'
    ],
    giaiTri: [
      'Sảnh tầng 1 và sảnh VIP: nhạc dân tộc và 02 bài múa dân tộc (biểu diễn từ 30-45 phút).',
      'Sảnh tầng 2 và tầng 3: nhạc Philippines và 02 bài múa dân tộc (biểu diễn từ 30-45 phút).',
      'Ban nhạc có thể thay đổi tùy theo tình hình thực tế.'
    ],
    anhTau: taoDanhSachAnh('indochina-queen', 'tau', dayso(1, 12), 'Du thuyền Indochina Queen'),
    anhMenu: taoDanhSachAnh('indochina-queen', 'menu', dayso(1, 13), 'Thực đơn tàu Indochina Queen'),
    anhKhac: []
  },
  {
    slug: 'elite-of-saigon',
    ten: 'Elite of Saigon',
    moTaNgan: 'Elite of Saigon: buffet, set menu và set chill trên du thuyền sông Sài Gòn, có live band, DJ, hồ bơi và pháo hoa cuối tuần.',
    anhDaiDien: 'anh/elite-of-saigon/tau-01.jpg',
    gioChay: { donKhach: '18h00', khoiHanh: '19h30', capBen: '22h00', ghiChu: null },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: [
      'Bến Nhà Rồng', 'Bến Bạch Đằng', 'Công viên Thủ Đức', 'Cầu Ba Son',
      'Cầu Thủ Thiêm', 'Landmark 81', 'Quay lại Bến Nhà Rồng'
    ],
    bangGia: [
      {
        tieuDe: 'Buffet – Tầng 1',
        ghiChu: 'Giá công bố, đã bao gồm VAT và phí dịch vụ. Chưa bao gồm đồ uống và chi phí cá nhân khác.',
        dong: [{ ten: 'Buffet', tenPhu: null, gia: 2189000 }]
      },
      {
        tieuDe: 'Set menu – Tầng 2',
        ghiChu: 'Giá công bố, đã bao gồm VAT và phí dịch vụ. Chưa bao gồm đồ uống và chi phí cá nhân khác.',
        dong: [
          { ten: 'Menu Âu', tenPhu: null, gia: 2519000 },
          { ten: 'Menu Á', tenPhu: null, gia: 2299000 },
          { ten: 'Menu Việt', tenPhu: null, gia: 2299000 },
          { ten: 'Menu Ấn', tenPhu: null, gia: 2299000 },
          { ten: 'Menu Chay', tenPhu: 'Việt/Ấn chay', gia: 1969000 },
          { ten: 'Menu Trẻ em', tenPhu: null, gia: 1749000 }
        ]
      },
      {
        tieuDe: 'Set chill – Tầng 3 (sân thượng)',
        ghiChu: null,
        dong: []
      },
      {
        tieuDe: 'Phụ thu dùng set menu trên tầng 3',
        ghiChu: 'Dành cho khách muốn dùng set menu trên tầng 3 thay vì tầng 2. Phụ thu tính theo mỗi khách.',
        dong: [
          { ten: 'Thứ 2 – Thứ 4', tenPhu: 'Không tặng set chill', gia: 490000 },
          { ten: 'Thứ 5 – Chủ nhật', tenPhu: 'Tặng set chill', gia: 988000 }
        ]
      }
    ],
    khuyenMai: [
      {
        tieuDe: 'Mid-week Chill',
        noiDung: 'Chỉ thứ 3 và thứ 5: tặng 2 bia + nachos (bò hoặc gà), áp dụng kèm buffet hoặc set menu.',
        anh: 'anh/elite-of-saigon/khac-02.jpg'
      }
    ],
    chinhSachTreEm: [
      'Buffet: dưới 4 tuổi miễn phí 01 trẻ em khi đi kèm đủ 02 người lớn. Các trẻ em dưới 4 tuổi không đi kèm đủ 2 người lớn, hoặc từ 4 đến dưới 11 tuổi: 50% của một người lớn.',
      'Set menu: dưới 4 tuổi miễn phí 01 trẻ em khi đi kèm đủ 02 người lớn. Các trẻ em dưới 4 tuổi không đi kèm đủ 2 người lớn, hoặc từ 4 đến dưới 11 tuổi: nếu dùng bữa thì tính đủ set Trẻ em, nếu không dùng bữa thì tính 50% set Trẻ em.',
      'Set chill: dưới 4 tuổi miễn phí 01 trẻ em khi đi kèm đủ 02 người lớn. Các trẻ em dưới 4 tuổi không đi kèm đủ 2 người lớn, hoặc từ 4 đến dưới 11 tuổi: nếu dùng bữa thì tính 85% của một người lớn, nếu không dùng bữa thì tính 50% của một người lớn.'
    ],
    giaiTri: [
      'Thứ 2 – Thứ 3 – Thứ 4 hằng tuần: band nhạc biểu diễn live, múa cổ phong (không có dancer, không có DJ).',
      'Thứ 5 – Thứ 6 – Thứ 7 – Chủ nhật: band nhạc biểu diễn live, dancer và DJ.'
    ],
    anhTau: taoDanhSachAnh('elite-of-saigon', 'tau', dayso(1, 10), 'Du thuyền Elite of Saigon'),
    anhMenu: taoDanhSachAnh('elite-of-saigon', 'menu', dayso(1, 14), 'Thực đơn tàu Elite of Saigon'),
    anhKhac: [
      { src: 'anh/elite-of-saigon/khac-01.jpg', alt: 'Sơ đồ lộ trình du thuyền Elite of Saigon' },
      { src: 'anh/elite-of-saigon/khac-03.jpg', alt: 'Thực đơn set chill của Elite of Saigon' },
      { src: 'anh/elite-of-saigon/khac-04.jpg', alt: 'Set chill đồ nguội trên tàu Elite of Saigon' },
      { src: 'anh/elite-of-saigon/khac-05.jpg', alt: 'Set chill bia và đồ nguội trên tàu Elite of Saigon' }
    ]
  },
  {
    slug: 'saigon-princess',
    ten: 'Saigon Princess',
    moTaNgan: 'Saigon Princess: du thuyền ăn tối set menu 3, 4, 5 món trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h30, cập bến 21h30.',
    anhDaiDien: 'anh/saigon-princess/tau-01.jpg',
    gioChay: { donKhach: '18h00', khoiHanh: '19h30', capBen: '21h30', ghiChu: null },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: [
      'Cảng Sài Gòn', 'Bến Nhà Rồng', 'Bến Bạch Đằng', 'Landmark 81',
      'Cảng Khánh Hội', 'Bến Nghé', 'Cảng Sài Gòn'
    ],
    bangGia: [
      {
        tieuDe: 'Set menu',
        ghiChu: 'Giá đã bao gồm thuế, phí phục vụ và vé lên tàu.',
        dong: [
          { ten: '3 món – Việt Nam', tenPhu: 'Vietnamese', gia: 980000 },
          { ten: '3 món – Quốc tế (bò Nhật)', tenPhu: 'International', gia: 980000 },
          { ten: '3 món – Âu (bò New Zealand)', tenPhu: 'Western', gia: 1200000 },
          { ten: '3 món – Á Âu', tenPhu: 'Fusion', gia: 980000 },
          { ten: '4 món – Á Âu (bò New Zealand)', tenPhu: 'Fusion', gia: 1350000 },
          { ten: '4 món – Á Âu (bò Nhật)', tenPhu: 'Fusion', gia: 1350000 },
          { ten: '4 món – Việt Nam', tenPhu: 'Vietnamese', gia: 1350000 },
          { ten: '4 món – Hải sản', tenPhu: 'Seafood', gia: 1350000 },
          { ten: '5 món – Tinh Hoa', tenPhu: 'Essence', gia: 1880000 },
          { ten: '5 món – Thanh Vị (bò New Zealand)', tenPhu: 'Delicate', gia: 1880000 },
          { ten: '5 món – Thanh Vị (bò Nhật)', tenPhu: 'Delicate', gia: 1880000 },
          { ten: '5 món – Á Âu (bò Nhật)', tenPhu: 'Fusion', gia: 1880000 },
          { ten: '5 món – Hải sản', tenPhu: 'Seafood', gia: 1880000 },
          { ten: '5 món – Á Âu (bò New Zealand)', tenPhu: 'Fusion', gia: 1880000 },
          { ten: '5 món – Việt Nam', tenPhu: 'Vietnamese', gia: 1650000 },
          { ten: '5 món – Hương Việt', tenPhu: 'Vietnamese Delights', gia: 1650000 },
          { ten: '5 món – Chay', tenPhu: 'Vegetarian', gia: 1250000 },
          { ten: '4 món – Chay', tenPhu: 'Vegetarian', gia: 950000 },
          { ten: 'Trẻ em – Donald', tenPhu: 'Kid\'s menu', gia: 850000 },
          { ten: 'Trẻ em – Pluto', tenPhu: 'Kid\'s menu', gia: 850000 }
        ]
      }
    ],
    khuyenMai: [
      {
        tieuDe: 'Gói trang trí cơ bản',
        noiDung: 'Tặng kèm gói trang trí cơ bản đối với tiệc sinh nhật và kỷ niệm.',
        anh: null
      }
    ],
    chinhSachTreEm: CHINH_SACH_TRE_EM_PRINCESS,
    giaiTri: [
      'Chương trình giải trí theo ngày: band nhạc Philippines biểu diễn từ 15-30 phút tại mỗi sảnh ăn tối, ảo thuật, violin… tùy ngày.'
    ],
    anhTau: taoDanhSachAnh('saigon-princess', 'tau', dayso(1, 10), 'Du thuyền Saigon Princess'),
    anhMenu: taoDanhSachAnh('saigon-princess', 'menu', dayso(1, 20), 'Thực đơn tàu Saigon Princess'),
    anhKhac: [
      { src: 'anh/saigon-princess/khac-01.jpg', alt: 'Thông tin đón khách và lộ trình tàu Saigon Princess' }
    ]
  },
  {
    slug: 'ben-thanh-princess',
    ten: 'Bến Thành Princess',
    moTaNgan: 'Bến Thành Princess: du thuyền ăn tối set menu 3, 4, 5 món trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h30, cập bến 21h30.',
    anhDaiDien: 'anh/ben-thanh-princess/tau-01.jpg',
    gioChay: { donKhach: '18h00', khoiHanh: '19h30', capBen: '21h30', ghiChu: null },
    diaChi: DIA_CHI_MAC_DINH,
    loTrinh: [
      'Cảng Sài Gòn', 'Bến Cảng Nhà Rồng', 'Tòa nhà Vietcombank', 'Cầu Ba Son',
      'Vinhomes Central Park', 'Cầu Thủ Thiêm', 'Landmark 81'
    ],
    bangGia: [
      {
        tieuDe: 'Set menu',
        ghiChu: 'Giá đã bao gồm thuế, phí phục vụ và vé lên tàu. Đã bao gồm 1 ly trà hoặc cà phê sau món chính, không bao gồm các loại thức uống khác.',
        dong: [
          { ten: '3 món – Quốc tế', tenPhu: 'International', gia: 980000 },
          { ten: '3 món – Á Âu', tenPhu: 'Fusion', gia: 980000 },
          { ten: '3 món – Âu', tenPhu: 'Western', gia: 1200000 },
          { ten: '3 món – Việt Nam', tenPhu: 'Vietnamese', gia: 980000 },
          { ten: '4 món – Á Âu (bò New Zealand)', tenPhu: 'Fusion', gia: 1350000 },
          { ten: '4 món – Á Âu (bò Nhật)', tenPhu: 'Fusion', gia: 1350000 },
          { ten: '4 món – Việt Nam', tenPhu: 'Vietnamese', gia: 1350000 },
          { ten: '4 món – Hải sản', tenPhu: 'Seafood', gia: 1350000 },
          { ten: '5 món – Mỹ Vị (bò New Zealand)', tenPhu: 'Delicacy', gia: 1880000 },
          { ten: '5 món – Mỹ Vị (bò Nhật)', tenPhu: 'Delicacy', gia: 1880000 },
          { ten: '5 món – Á Âu (bò New Zealand)', tenPhu: 'Fusion', gia: 1880000 },
          { ten: '5 món – Á Âu (bò Nhật)', tenPhu: 'Fusion', gia: 1880000 },
          { ten: '5 món – Nét Việt', tenPhu: 'Soul of Vietnam', gia: 1650000 },
          { ten: '5 món – Hải sản', tenPhu: 'Seafood', gia: 1880000 },
          { ten: '5 món – Việt Nam', tenPhu: 'Vietnamese', gia: 1650000 },
          { ten: '5 món – Tinh Tế', tenPhu: 'Subtle Choices', gia: 1880000 },
          { ten: '5 món – Chay', tenPhu: 'Vegetarian', gia: 1250000 },
          { ten: '4 món – Chay', tenPhu: 'Vegetarian', gia: 950000 },
          { ten: 'Trẻ em – Pluto', tenPhu: 'Kid\'s menu', gia: 850000 },
          { ten: 'Trẻ em – Donald', tenPhu: 'Kid\'s menu', gia: 850000 }
        ]
      }
    ],
    khuyenMai: [],
    chinhSachTreEm: CHINH_SACH_TRE_EM_PRINCESS,
    giaiTri: [
      'Ban nhạc Việt Nam (Live band): thứ 4 và thứ 7 hằng tuần.',
      'Ban nhạc quốc tế (International live band): hằng ngày, trừ thứ 4 và thứ 7.',
      'Ảo thuật tại bàn (Close-up magic): hằng ngày.'
    ],
    anhTau: taoDanhSachAnh('ben-thanh-princess', 'tau', dayso(1, 6), 'Du thuyền Bến Thành Princess'),
    anhMenu: taoDanhSachAnh('ben-thanh-princess', 'menu', dayso(1, 20), 'Thực đơn tàu Bến Thành Princess'),
    anhKhac: [
      { src: 'anh/ben-thanh-princess/khac-01.jpg', alt: 'Thông tin đón khách tàu Bến Thành Princess' },
      { src: 'anh/ben-thanh-princess/khac-02.jpg', alt: 'Dịch vụ giải trí trên tàu Bến Thành Princess' }
    ]
  }
];
// Ô đếm trẻ em ở trang đặt chỗ, theo từng tàu và từng loại (buffet / setMenu).
// mienPhi: nhãn ô trẻ miễn phí. nuaGia: nhãn ô trẻ tính 50% giá (null = tàu không tính kiểu 50% cho loại này).
// ghiChu: dòng nhắc thêm dưới ô đếm.
var GIA_TRE_EM = {
  'indochina-star': {
    buffet: { mienPhi: '0–4 tuổi (dưới 1m)', nuaGia: '5–9 tuổi (1m – dưới 1,3m)', ghiChu: 'Từ 10 tuổi (trên 1,3m) tính như người lớn.' }
  },
  'ben-nghe': {
    buffet: { mienPhi: 'Dưới 4 tuổi, không đặt suất ăn', nuaGia: '4–8 tuổi (hoặc dưới 4 tuổi có đặt suất ăn)', ghiChu: 'Từ 9 tuổi tính như người lớn.' }
  },
  'indochina-queen': {
    buffet: { mienPhi: '1–4 tuổi (dưới 1m)', nuaGia: '5–9 tuổi (1m – dưới 1,3m)', ghiChu: 'Từ 10 tuổi (trên 1,3m) tính như người lớn. Hai người lớn kèm 01 trẻ 1m–1,3m, từ trẻ thứ 2 tính như người lớn.' },
    setMenu: { mienPhi: '1–4 tuổi (dưới 1m)', nuaGia: null, ghiChu: 'Trẻ 5–9 tuổi dùng set menu tính 50% (70% với set có tôm càng, cua): vui lòng ghi số bé ở ô Ghi chú, Ms Nguyên sẽ báo giá.' }
  },
  'elite-of-saigon': {
    buffet: { mienPhi: 'Dưới 4 tuổi (01 bé đi cùng 02 người lớn)', nuaGia: '4 – dưới 11 tuổi', ghiChu: null },
    setMenu: { mienPhi: 'Dưới 4 tuổi (01 bé đi cùng 02 người lớn)', nuaGia: null, ghiChu: 'Trẻ 4 – dưới 11 tuổi: chọn “Menu Trẻ em” trong danh sách thực đơn.' }
  },
  'saigon-princess': {
    setMenu: { mienPhi: 'Dưới 6 tuổi (ăn chung với bố mẹ, tặng 1 phần soup)', nuaGia: null, ghiChu: 'Mỗi người lớn kèm tối đa 1 bé dưới 6 tuổi, bé phát sinh phụ thu 100.000 VND/bé. Trẻ 6–11 tuổi: chọn thực đơn Trẻ em (Donald hoặc Pluto).' }
  },
  'ben-thanh-princess': {
    setMenu: { mienPhi: 'Dưới 6 tuổi (ăn chung với bố mẹ, tặng 1 phần soup)', nuaGia: null, ghiChu: 'Mỗi người lớn kèm tối đa 1 bé dưới 6 tuổi, bé phát sinh phụ thu 100.000 VND/bé. Trẻ 6–11 tuổi: chọn thực đơn Trẻ em (Donald hoặc Pluto).' }
  }
};
var LINK_BAN_DO = 'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('5 Nguyễn Tất Thành, Xóm Chiếu, Hồ Chí Minh (cạnh Bến Nhà Rồng)');

// Chính sách chung (theo update.docx). Mỗi mục: { id, tieuDe, nhom: [{ tieuDe (có thể null), dong: [...] }] }.
var CHINH_SACH_CHUNG = [
  {
    id: 'tre-em-chung', tieuDe: 'Chính sách trẻ em',
    nhom: [{ tieuDe: null, dong: [
      'Trẻ từ 0–4 tuổi (dưới 1m): miễn phí lên tàu, bố mẹ tự lo. 2 người lớn chỉ được kèm 1 bé miễn phí, bé thứ 2 mua vé trẻ em.',
      'Trẻ từ 5–9 tuổi (từ 1,0m đến dưới 1,3m): mua vé trẻ em (tính 50%).',
      'Trẻ em từ 10 tuổi trở lên (từ 1,3m): mua vé người lớn.',
      '2 người lớn chỉ được kèm 1 trẻ em; nếu số trẻ em vượt quá quy định sẽ được thông báo lại phụ phí bổ sung.',
      'Một số tàu có chính sách trẻ em riêng, xem mục “Chính sách trẻ em” trên trang của từng tàu.'
    ] }]
  },
  {
    id: 'dieu-kien-ve', tieuDe: 'Điều kiện vé',
    nhom: [
      { tieuDe: null, dong: [
        'Xác nhận: quý khách sẽ nhận được vé trong vòng 24 giờ kể từ khi đặt và thanh toán thành công.',
        'Vé chỉ có giá trị vào đúng ngày đăng ký.'
      ] },
      { tieuDe: 'Giá đã bao gồm', dong: ['Vé lên tàu.', 'Ăn buffet hoặc set menu theo vé đã đặt.', 'Thuế, phí vào cảng.'] },
      { tieuDe: 'Giá chưa bao gồm', dong: ['Nước uống (khách mua và thanh toán trực tiếp tại tàu).'] }
    ]
  },
  {
    id: 'doi-tra', tieuDe: 'Chính sách đổi trả vé',
    nhom: [
      { tieuDe: 'Hoàn/Hủy vé', dong: ['Không áp dụng hoàn tiền hoặc hủy vé trong ngày sử dụng dịch vụ.'] },
      { tieuDe: 'Đổi ngày sử dụng', dong: [
        'Hỗ trợ linh hoạt đổi sang ngày khác nếu quý khách thông báo trước 2–3 ngày (tùy thuộc vào số lượng vé và tình trạng chỗ).',
        'Yêu cầu đổi ngày chỉ hoàn tất khi nhân viên tư vấn xác nhận và gửi lại mã vé điện tử mới cho quý khách.'
      ] }
    ]
  },
  {
    id: 'huong-dan-ve', tieuDe: 'Hướng dẫn sử dụng vé',
    nhom: [{ tieuDe: null, dong: [
      'Sau khi đặt thành công, quý khách sẽ nhận được vé điện tử bằng file PDF qua email dùng để lên tàu.',
      'Xuất trình vé qua điện thoại cho nhân viên để lên tàu.',
      'Địa điểm tổ chức: 05 Nguyễn Tất Thành, phường Xóm Chiếu (bên cạnh Bến Nhà Rồng). Có bãi giữ xe.'
    ] }]
  },
  {
    id: 'luu-y', tieuDe: 'Lưu ý quan trọng',
    nhom: [{ tieuDe: null, dong: [
      'Nếu quý khách đến trễ hơn giờ tàu chạy, tàu có quyền từ chối phục vụ.',
      'Nhà hàng sẽ tính thêm phí phục vụ nếu khách hàng mang đồ ăn, thức uống từ bên ngoài vào nhà hàng.',
      'Vui lòng xuất trình CMND/hộ chiếu có ảnh (bản photo/hình chụp) để đối chiếu nếu được yêu cầu.',
      'Một số món ăn trong thực đơn có thể thay đổi tùy theo mùa và theo tình hình sẵn có của nguyên vật liệu.',
      'Trong điều kiện thời tiết xấu, tàu có thể thay đổi lịch trình để đảm bảo an toàn tối đa cho du khách.'
    ] }]
  }
];

// Các dòng của một nhóm trong chính sách chung (theo id mục và tiêu đề nhóm).
function layDongChinhSach(idMuc, tieuDeNhom) {
  for (var i = 0; i < CHINH_SACH_CHUNG.length; i++) {
    if (CHINH_SACH_CHUNG[i].id !== idMuc) continue;
    for (var j = 0; j < CHINH_SACH_CHUNG[i].nhom.length; j++) {
      if (CHINH_SACH_CHUNG[i].nhom[j].tieuDe === tieuDeNhom) return CHINH_SACH_CHUNG[i].nhom[j].dong;
    }
  }
  return [];
}

if (typeof module !== 'undefined') {
  module.exports = {
    THONG_TIN_WEB, LIEN_HE, DIA_CHI_MAC_DINH, CONG_TY, DANH_SACH_TAU, GIA_TRE_EM,
    CHINH_SACH_CHUNG, LINK_BAN_DO, layDongChinhSach
  };
}
