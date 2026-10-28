var THONG_TIN_WEB = { ten: 'Vé Tàu Sài Gòn' };
var LIEN_HE = {
  soDienThoai: '0948170036', tenNguoiLienHe: 'Ms Nguyên',
  linkGoi: 'tel:0948170036', linkZalo: 'https://zalo.me/0948170036'
};
var DIA_CHI_MAC_DINH = '5 Nguyễn Tất Thành, Phường Xóm Chiếu, Hồ Chí Minh';
var CONG_TY = { ten: 'Công ty TNHH Nguyên Nguyên Global', mst: '0319143429', vaiTro: 'Đại lý chính thức' };

var CHINH_SACH_TRE_EM_PRINCESS = [
  'Trẻ em dưới 6 tuổi: ăn chung với bố mẹ và được tặng kèm 1 phần soup cho bé. Mỗi người lớn được kèm tối đa 1 bé, bé phát sinh phụ thu 100.000 VND/bé.',
  'Trẻ em từ đủ 6 tuổi đến 11 tuổi: chọn thực đơn Donald Kid hoặc Pluto Kid.',
  'Trẻ em trên 11 tuổi: chọn thực đơn theo chính sách giá người lớn (thực đơn 3 món, 4 món và 5 món). Trường hợp trẻ em trên 11 tuổi và người lớn chọn thực đơn trẻ em (Donald hoặc Pluto) sẽ phụ thu 200.000 VND/khách.',
  'Trẻ em: chọn 1 thực đơn giống nhau hoặc 2 thực đơn trẻ em khác nhau.'
];

// Indochina Star và Indochina Queen dùng chung một chính sách trẻ em.
var CHINH_SACH_TRE_EM_INDOCHINA = [
  'Trẻ em từ 0-4 tuổi (dưới 1m): miễn phí.',
  'Trẻ em từ 5-9 tuổi (từ 1m đến dưới 1,3m): tính 50% giá người lớn.',
  'Từ 10 tuổi (trên 1,3m): tính vé người lớn.'
];

var DANH_SACH_TAU = [
  {
    slug: 'indochina-star',
    ten: 'Indochina Star',
    moTaNgan: 'Buffet tối trên du thuyền Indochina Star qua sông Sài Gòn: đón khách 18h00, tàu chạy 19h45, cập bến 21h15, có nhạc và múa dân tộc.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 368 khách' },
      { nhan: 'Kích thước', giaTri: 'Dài 48,9 m, rộng 12,2 m, vỏ thép' },
      { nhan: 'Số tầng', giaTri: '3 tầng: tầng trệt, tầng giữa, sân thượng' },
      { nhan: 'Điểm nổi bật', giaTri: 'Sân thượng nhìn 360° ra sông Sài Gòn' },
      { nhan: 'Phù hợp', giaTri: 'Ăn tối, tiếp khách, sự kiện' }
    ],
    noiBat: ['Buffet ở tầng 1 và tầng 2, tầng thượng ngắm cảnh', 'Nhạc, múa dân tộc và nhạc Philippines trên boong', 'Ngắm cầu Thủ Thiêm, Landmark 81 về đêm'],
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
    chinhSachTreEm: CHINH_SACH_TRE_EM_INDOCHINA,
    giaiTri: [
      'Tầng 1: nhạc dân tộc và 2 bài múa dân tộc.',
      'Tầng 2: nhạc dân tộc và 2 bài múa dân tộc.',
      'Boong tàu: nhạc Philippines sôi động.'
    ]
  },
  {
    slug: 'ben-nghe',
    ten: 'Bến Nghé',
    moTaNgan: 'Du thuyền Bến Nghé ăn tối buffet và set menu trên sông Sài Gòn: đón khách 17h15, khởi hành 20h00, cập bến 21h30, nhạc sống hằng đêm.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 1.000 khách' },
      { nhan: 'Kích thước', giaTri: 'Dài 67,3 m, rộng 16,3 m' },
      { nhan: 'Số tầng', giaTri: '4 tầng' },
      { nhan: 'Đại sảnh', giaTri: '2 sảnh ở tầng 2 và tầng 3, mỗi sảnh khoảng 400 khách, có sân khấu, âm thanh, màn hình LED' },
      { nhan: 'Phòng VIP', giaTri: '12 phòng ở tầng 1, 10–24 khách/phòng' },
      { nhan: 'Phù hợp', giaTri: 'Gala dinner, tiệc cưới, Year End Party, hội nghị' }
    ],
    noiBat: ['Lên tàu sớm, dùng bữa từ 19h00', 'Nhạc sống hằng đêm từ 19h đến 21h15', 'Cuối tuần có belly dance hoặc múa cổ trang'],
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
      },
      {
        // Theo ảnh thực đơn Bến Nghé (giá công bố / khách). Ảnh từng set: anhThucDon['ben-nghe']['Set menu'] trong js/cau-hinh.js.
        tieuDe: 'Set menu',
        ghiChu: 'Giá công bố / khách. Mỗi set có tặng tráng miệng, trà đá hoặc nước lọc, khăn lạnh.',
        dong: [
          { ten: 'Menu Bến Nghé 1', tenPhu: null, gia: 469000 },
          { ten: 'Menu Bến Nghé 2', tenPhu: null, gia: 469000 },
          { ten: 'Menu Bến Nghé 3', tenPhu: null, gia: 579000 },
          { ten: 'Menu Bến Nghé 4', tenPhu: null, gia: 579000 },
          { ten: 'Menu Bến Nghé 5', tenPhu: null, gia: 689000 },
          { ten: 'Menu Bến Nghé 6', tenPhu: null, gia: 689000 },
          { ten: 'Menu Bến Nghé 7', tenPhu: 'Chay', gia: 469000 },
          { ten: 'Menu Bến Nghé 8', tenPhu: 'Chay', gia: 579000 }
        ]
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
    ]
  },
  {
    slug: 'indochina-queen',
    ten: 'Indochina Queen',
    moTaNgan: 'Indochina Queen – Tàu Nữ Hoàng Đông Dương: buffet và set menu trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h45, cập bến 21h15.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 600 khách' },
      { nhan: 'Kích thước', giaTri: 'Dài 74 m, rộng 13,7 m, vỏ thép' },
      { nhan: 'Số tầng', giaTri: '3 tầng' },
      { nhan: 'Bố trí', giaTri: 'Tầng trệt 120 khách, tầng giữa 220 khách, tầng 3 ngoài trời 190 khách và phòng VIP 70 khách' },
      { nhan: 'Phù hợp', giaTri: 'Sinh nhật, gala dinner, hội nghị, tiệc công ty' }
    ],
    noiBat: ['Buffet không giới hạn ở 3 tầng', 'Sảnh VIP tầng 3 với 11 set menu', 'Nhạc dân tộc, nhạc Philippines và múa dân tộc'],
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
    chinhSachTreEm: CHINH_SACH_TRE_EM_INDOCHINA,
    giaiTri: [
      'Sảnh tầng 1 và sảnh VIP: nhạc dân tộc và 02 bài múa dân tộc (biểu diễn từ 30-45 phút).',
      'Sảnh tầng 2 và tầng 3: nhạc Philippines và 02 bài múa dân tộc (biểu diễn từ 30-45 phút).',
      'Ban nhạc có thể thay đổi tùy theo tình hình thực tế.'
    ]
  },
  {
    slug: 'elite-of-saigon',
    ten: 'Elite of Saigon',
    moTaNgan: 'Elite of Saigon: buffet, set menu và set chill trên du thuyền sông Sài Gòn, có live band, DJ, hồ bơi và pháo hoa cuối tuần.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 500 khách' },
      { nhan: 'Kích thước', giaTri: 'Dài 75 m, rộng 13,9 m, cao 11,5 m' },
      { nhan: 'Số tầng', giaTri: '3 tầng' },
      { nhan: 'Vận hành', giaTri: '2 động cơ Hyundai, chạy êm và ổn định' },
      { nhan: 'Phù hợp', giaTri: 'Ăn tối, gala dinner, tiệc công ty, hội nghị' }
    ],
    noiBat: ['Buffet, set menu và set chill theo từng tầng', 'Live band hằng đêm, DJ và dancer từ thứ 5 đến chủ nhật', 'Mid-week Chill thứ 3 và thứ 5: tặng 2 bia + nachos'],
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
        noiDung: 'Chỉ thứ 3 và thứ 5: tặng 2 bia + nachos (bò hoặc gà), áp dụng kèm buffet hoặc set menu.'
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
    ]
  },
  {
    slug: 'saigon-princess',
    ten: 'Saigon Princess',
    moTaNgan: 'Saigon Princess: du thuyền ăn tối set menu 3, 4, 5 món trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h30, cập bến 21h30.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 250 khách mỗi chuyến' },
      { nhan: 'Số tầng', giaTri: '3 tầng' },
      { nhan: 'Tầng trệt', giaTri: 'Sảnh Thủ Thiêm, 100 khách' },
      { nhan: 'Tầng giữa', giaTri: 'Sảnh Bến Thành 78 khách, sảnh Nhà Bè 38 khách' },
      { nhan: 'Sân thượng', giaTri: 'Sundeck ngoài trời, ngắm hoàng hôn và thành phố về đêm' },
      { nhan: 'Phù hợp', giaTri: 'Gala dinner, hội nghị, tiếp khách VIP, tiệc gia đình' }
    ],
    noiBat: ['20 set menu 3, 4, 5 món', 'Band nhạc Philippines, ảo thuật, violin', 'Tặng trang trí tiệc sinh nhật, kỷ niệm'],
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
        noiDung: 'Tặng kèm gói trang trí cơ bản đối với tiệc sinh nhật và kỷ niệm.'
      }
    ],
    chinhSachTreEm: CHINH_SACH_TRE_EM_PRINCESS,
    giaiTri: [
      'Chương trình giải trí theo ngày: band nhạc Philippines biểu diễn từ 15-30 phút tại mỗi sảnh ăn tối, ảo thuật, violin… tùy ngày.'
    ]
  },
  {
    slug: 'ben-thanh-princess',
    ten: 'Bến Thành Princess',
    moTaNgan: 'Bến Thành Princess: du thuyền ăn tối set menu 3, 4, 5 món trên sông Sài Gòn, đón khách 18h00, tàu chạy 19h30, cập bến 21h30.',
    // Giới thiệu: chỉ còn các điểm nổi bật và phần tổng quan (thongSo); gioiThieu để trống thì không hiện đoạn chữ.
    gioiThieu: '',
    // Tổng quan tàu (mục Giới thiệu và thẻ tàu), theo file "Tổng quan từng tàu.docx".
    thongSo: [
      { nhan: 'Sức chứa', giaTri: 'Tối đa 350 khách' },
      { nhan: 'Số tầng', giaTri: '3 tầng' },
      { nhan: 'Phòng VIP', giaTri: '18 phòng riêng: 14 phòng 12 khách, 4 phòng 10 khách' },
      { nhan: 'Sảnh tiệc chính', giaTri: 'Khoảng 70 khách' },
      { nhan: 'Panorama Lounge', giaTri: 'Nhóm khoảng 60 khách' },
      { nhan: 'Phù hợp', giaTri: 'Tiếp đối tác, ký kết, sum họp gia đình' }
    ],
    noiBat: ['20 set menu, có trà hoặc cà phê sau món chính', 'Live band quốc tế và Việt Nam', 'Ảo thuật tại bàn hằng ngày'],
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
    ]
  }
];
// Ô đếm trẻ em ở trang đặt chỗ, theo từng tàu và từng loại (buffet / setMenu).
// mienPhi: nhãn ô trẻ miễn phí. nuaGia: nhãn ô trẻ tính 50% giá (null = tàu không tính kiểu 50% cho loại này).
// ghiChu: dòng nhắc thêm dưới ô đếm.
// beMienPhiMoiNguoiLon: số bé miễn phí tối đa cho mỗi người lớn (không ghi = quy định chung 2 người lớn kèm 1 bé).
// phuThuBeVuot: phụ thu cố định cho mỗi bé miễn phí vượt giới hạn (VND); không ghi = Ms Nguyên báo phụ phí sau.
// treEm50VuotTinhNguoiLon: true = mỗi 2 người lớn chỉ kèm 1 trẻ tính 50%, trẻ 50% thứ 2 trở đi tính giá người lớn.
// canhBaoTongTre: true = 2 người lớn chỉ được kèm 1 trẻ em (tính cả trẻ mua vé và bé miễn phí); vượt thì báo phụ phí bổ sung.
var GIA_TRE_EM = {
  'indochina-star': {
    buffet: { mienPhi: '0–4 tuổi (dưới 1m)', nuaGia: '5–9 tuổi (1m – dưới 1,3m)', ghiChu: 'Từ 10 tuổi (trên 1,3m) tính như người lớn.' }
  },
  'ben-nghe': {
    buffet: { mienPhi: 'Dưới 4 tuổi, không đặt suất ăn', nuaGia: '4–8 tuổi (hoặc dưới 4 tuổi có đặt suất ăn)', ghiChu: 'Từ 9 tuổi tính như người lớn.' },
    setMenu: { mienPhi: 'Dưới 4 tuổi, không đặt suất ăn', nuaGia: null, ghiChu: 'Trẻ 4–8 tuổi tính ½ suất, từ 9 tuổi tính 1 suất: vui lòng ghi số bé ở ô Ghi chú, Ms Nguyên sẽ báo giá.' }
  },
  'indochina-queen': {
    // Giống Indochina Star.
    buffet: { mienPhi: '0–4 tuổi (dưới 1m)', nuaGia: '5–9 tuổi (1m – dưới 1,3m)', ghiChu: 'Từ 10 tuổi (trên 1,3m) tính như người lớn.' },
    setMenu: { mienPhi: '0–4 tuổi (dưới 1m)', nuaGia: null, ghiChu: 'Trẻ 5–9 tuổi (1m – dưới 1,3m) dùng set menu tính 50% giá set: vui lòng ghi số bé ở ô Ghi chú, Ms Nguyên sẽ báo giá. Từ 10 tuổi (trên 1,3m) tính như người lớn.' }
  },
  'elite-of-saigon': {
    buffet: { mienPhi: 'Dưới 4 tuổi (01 bé đi cùng 02 người lớn)', nuaGia: '4 – dưới 11 tuổi', ghiChu: null },
    setMenu: { mienPhi: 'Dưới 4 tuổi (01 bé đi cùng 02 người lớn)', nuaGia: null, ghiChu: 'Trẻ 4 – dưới 11 tuổi: chọn “Menu Trẻ em” trong danh sách thực đơn.' }
  },
  'saigon-princess': {
    setMenu: { mienPhi: 'Dưới 6 tuổi (ăn chung với bố mẹ, tặng 1 phần soup)', nuaGia: null, beMienPhiMoiNguoiLon: 1, phuThuBeVuot: 100000, ghiChu: 'Mỗi người lớn kèm tối đa 1 bé dưới 6 tuổi, bé phát sinh phụ thu 100.000 VND/bé. Trẻ 6–11 tuổi: chọn thực đơn Trẻ em (Donald hoặc Pluto).' }
  },
  'ben-thanh-princess': {
    setMenu: { mienPhi: 'Dưới 6 tuổi (ăn chung với bố mẹ, tặng 1 phần soup)', nuaGia: null, beMienPhiMoiNguoiLon: 1, phuThuBeVuot: 100000, ghiChu: 'Mỗi người lớn kèm tối đa 1 bé dưới 6 tuổi, bé phát sinh phụ thu 100.000 VND/bé. Trẻ 6–11 tuổi: chọn thực đơn Trẻ em (Donald hoặc Pluto).' }
  }
};
var LINK_BAN_DO = 'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('5 Nguyễn Tất Thành, Xóm Chiếu, Hồ Chí Minh (cạnh Bến Nhà Rồng)');

// Chính sách chung (theo update.docx). Mỗi mục: { id, tieuDe, nhom: [{ tieuDe (có thể null), dong: [...] }] }.
var CHINH_SACH_CHUNG = [
  {
    id: 'tre-em-chung', tieuDe: 'Chính sách trẻ em',
    nhom: [{ tieuDe: null, dong: [
      // Mỗi tàu một chính sách (độ tuổi, chiều cao, số bé miễn phí): không ghi quy định chung ở đây.
      // Chính sách từng tàu: chinhSachTreEm của từng tàu (trang tàu) và GIA_TRE_EM (ô đếm trẻ em, trang FAQ, trang chính sách).
      'Mỗi tàu có chính sách trẻ em riêng (độ tuổi, chiều cao, số bé miễn phí đi kèm người lớn).',
      'Xem mục “Chính sách trẻ em” trên trang của từng tàu, hoặc ô đếm trẻ em khi đặt chỗ.',
      'Nếu số trẻ em vượt quá quy định của tàu, Ms Nguyên sẽ thông báo lại phụ phí bổ sung (nếu có).'
    ] }]
  },
  {
    id: 'dieu-kien-ve', tieuDe: 'Điều kiện vé',
    nhom: [
      { tieuDe: null, dong: [
        'Xác nhận: quý khách sẽ nhận được vé trong vòng 24 giờ kể từ khi đặt và thanh toán thành công.',
        'Chỗ trên tàu do Ms Nguyên xác nhận với tàu sau khi quý khách thanh toán. Nếu tàu hết chỗ ngày đã chọn, Nguyên Nguyên hoàn 100% số tiền hoặc đổi sang ngày khác theo lựa chọn của quý khách.',
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
