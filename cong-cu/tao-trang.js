// Tạo lại index.html, dat-cho.html, xac-nhan.html và tau/*.html với header/footer chung.
// Chạy: node cong-cu/tao-trang.js   (sau khi sửa header/footer hoặc thêm tàu trong js/du-lieu-tau.js)
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..');
const { DANH_SACH_TAU, CONG_TY, CHINH_SACH_CHUNG, LINK_BAN_DO } = require(path.join(GOC, 'js/du-lieu-tau.js'));
const { CAU_HINH } = require(path.join(GOC, 'js/cau-hinh.js'));
const { escapeHtml: e, taoKhoiChinhSach, giaThapNhat, layNhanTau, dinhDangGia } = require(path.join(GOC, 'js/hien-thi.js'));

const FONT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap">';
const SVG = (noiDung) => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + noiDung + '</svg>';
const ICON_TAU = SVG('<path d="M3 17l1.5 3h15L21 17"/><path d="M5 17l-1-5h16l-1 5"/><path d="M7 12V7h10v5"/><path d="M12 4v3"/>');
const ICON_DT = SVG('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>');
const ICON_NGUOI = SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>');
const ICON_THE = SVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>');
const TEN_MIEN = String(CAU_HINH.tenMien || '').replace(/\/+$/, '');
// Ảnh chia sẻ link: ảnh đại diện của tàu, trang chung dùng ảnh bìa đầu tiên.
const anhChiaSe = (slug) => (slug ? (CAU_HINH.anhTau[slug] || {}).daiDien : CAU_HINH.anhBia[0]) || '';
const SCRIPT_CHUNG = ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js'];
// ?v=<mã nội dung>: file đổi thì đường dẫn đổi, trình duyệt khách tự tải bản mới (không dùng bản cũ trong bộ nhớ đệm).
const maPhienBan = (rel) => require('crypto').createHash('sha1').update(fs.readFileSync(path.join(GOC, rel))).digest('hex').slice(0, 8);
const script = (tt, ds) => ds.map((s) => `  <script src="${tt}js/${s}?v=${maPhienBan('js/' + s)}"></script>`).join('\n');

function dau(tt, { tieuDe, moTa, anh, url, anChiMuc }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(tieuDe)}</title>
  <meta name="description" content="${e(moTa)}">
  <meta property="og:title" content="${e(tieuDe)}">
  <meta property="og:description" content="${e(moTa)}">
${anh && fs.existsSync(path.join(GOC, anh)) ? '  <meta property="og:image" content="' + TEN_MIEN + '/' + anh + '">\n' : ''}  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="vi_VN">
  <meta name="theme-color" content="#0194f3">${anChiMuc ? '\n  <meta name="robots" content="noindex, nofollow">' : ''}
  ${FONT}
  <link rel="stylesheet" href="${tt}css/style.css?v=${maPhienBan('css/style.css')}">
</head>`;
}

// Logo: <span data-logo="header|footer"> được js/hien-thi.js thay bằng ảnh logo nếu đã điền trong js/cau-hinh.js.
function header(tt) {
  return `  <header class="dau-trang">
    <div class="khung">
      <a class="logo" href="${tt}index.html"><span class="logo-hinh" data-logo="header">${ICON_TAU}</span><span>Vé Tàu <b>Sài Gòn</b></span></a>
      <nav class="menu-chinh">
        <a href="${tt}index.html#danh-sach">Du thuyền</a>
        <a href="${tt}dat-cho.html">Đặt chỗ</a>
        <a href="#lien-he">Liên hệ</a>
      </nav>
      <a class="nut nut-xanh" href="tel:0948170036">${ICON_DT}<span>0948170036</span></a>
      <a class="logo-goc-phai" href="${tt}index.html" aria-label="${e(CONG_TY.ten)}"><span data-logo="gocPhai" hidden></span></a>
    </div>
  </header>`;
}

function footer(tt) {
  const lienKet = DANH_SACH_TAU.map((t) => `            <li><a href="${tt}tau/${t.slug}.html">${e(t.ten)}</a></li>`).join('\n');
  return `  <footer class="chan-trang" id="lien-he">
    <div class="khung">
      <div class="chan-trang-luoi">
        <div class="chan-trang-cong-ty">
          <a class="logo" href="${tt}index.html"><span class="logo-hinh" data-logo="footer">${ICON_TAU}</span><span>Vé Tàu Sài Gòn</span></a>
          <p class="huy-hieu-lon">★ ${e(CONG_TY.vaiTro)}</p>
          <h3>${e(CONG_TY.ten)}</h3>
          <p data-gioi-thieu>${e(CAU_HINH.gioiThieuCongTy)}</p>
        </div>
        <div>
          <h3>Du thuyền</h3>
          <ul>
${lienKet}
          </ul>
        </div>
        <div>
          <h3>Thông tin liên hệ</h3>
          <ul class="ds-lien-he">
            <li><span>Mã số thuế</span><b>${CONG_TY.mst}</b></li>
            <li><span>Hotline</span><b>Ms Nguyên – <a href="tel:0948170036">0948170036</a></b></li>
            <li><span>Zalo</span><b><a href="https://zalo.me/0948170036" target="_blank" rel="noopener">0948170036</a></b></li>
            <li><span>Điểm đón khách</span><b>5 Nguyễn Tất Thành, Phường Xóm Chiếu, Hồ Chí Minh (cạnh Bến Nhà Rồng) · <a href="${e(LINK_BAN_DO)}" target="_blank" rel="noopener">Xem bản đồ</a></b></li>
          </ul>
          <h3 style="margin-top:16px">Hỗ trợ khách hàng</h3>
          <ul>
${CHINH_SACH_CHUNG.map((m) => `            <li><a href="${tt}chinh-sach.html#${m.id}">${e(m.tieuDe)}</a></li>`).join('\n')}
          </ul>
        </div>
      </div>
      <ul class="dai-uy-tin">
        <li>★ ${e(CONG_TY.vaiTro)}</li>
        <li>MST ${CONG_TY.mst}</li>
        <li>Xuất hóa đơn VAT</li>
        <li>Chỉ nhận chuyển khoản ACB ghi trên web</li>
        <li>Vé có chữ ký số + mã QR</li>
      </ul>
      <div class="cong-ty">
        <p>© ${new Date().getFullYear()} <strong>${e(CONG_TY.ten)}</strong> · MST: ${CONG_TY.mst} <span class="huy-hieu">${e(CONG_TY.vaiTro)}</span></p>
        <p>Hotline: Ms Nguyên · SĐT: <a href="tel:0948170036">0948170036</a></p>
      </div>
    </div>
  </footer>
  <div class="thanh-lien-he" id="thanh-lien-he">
    <a class="nut nut-xanh" href="tel:0948170036">Gọi 0948170036</a>
    <a class="nut nut-zalo" href="https://zalo.me/0948170036" target="_blank" rel="noopener">Nhắn Zalo</a>
  </div>`;
}

const MO_TA_CHU = 'Đặt vé du thuyền ăn tối trên sông Sài Gòn: 6 tàu, buffet và set menu, đón khách tại Cảng Sài Gòn. Liên hệ Ms Nguyên 0948170036.';
// --ra <thư mục>: ghi ra thư mục khác (test dùng để so với file trong repo mà không ghi đè).
const viTriRa = process.argv.indexOf('--ra');
const THU_MUC_RA = viTriRa > 0 && process.argv[viTriRa + 1] ? path.resolve(process.argv[viTriRa + 1]) : GOC;
const ghi = (ten, html) => {
  fs.mkdirSync(path.dirname(path.join(THU_MUC_RA, ten)), { recursive: true });
  fs.writeFileSync(path.join(THU_MUC_RA, ten), html);
};

// ---------- index.html ----------
ghi('index.html', `${dau('', { tieuDe: 'Vé Tàu Sài Gòn – Du thuyền ăn tối sông Sài Gòn', moTa: MO_TA_CHU, anh: anhChiaSe(null), url: TEN_MIEN + '/' })}
<body>
${header('')}
  <section class="hero">
    <div class="khung">
      <span class="nhan-hero">★ ${e(CONG_TY.vaiTro)} · 6 du thuyền</span>
      <h1>Du thuyền ăn tối trên sông Sài Gòn</h1>
      <p>Buffet, set menu và nhạc sống trên 6 du thuyền. Chọn tàu, chọn thực đơn và đặt chỗ trong vài phút.</p>
    </div>
  </section>
  <main class="khung">
    <form class="o-tim-kiem" id="form-tim">
      <div class="o-tim-kiem-tieu-de"><span class="tab-tim">${ICON_TAU}Du thuyền ăn tối</span></div>
      <div class="luoi-tim">
        <div class="truong-tim"><label for="tim-tau">Du thuyền</label><select id="tim-tau" name="tau"><option value="">Tất cả du thuyền</option></select></div>
        <div class="truong-tim"><label for="tim-ngay">Ngày lên tàu</label><input type="date" id="tim-ngay" name="ngay"><div class="ngay-nhanh" id="ngay-nhanh"></div></div>
        <div class="truong-tim"><label for="tim-khach">Số người lớn</label><input type="number" id="tim-khach" name="khach" min="1" value="2"></div>
        <button type="submit" class="nut">Tìm &amp; đặt chỗ</button>
      </div>
    </form>
    <div class="diem-manh">
      <div><span class="tron">★</span><p><strong>${e(CONG_TY.vaiTro)}</strong><span>${e(CONG_TY.ten)}</span></p></div>
      <div><span class="tron">⚓</span><p><strong>6 du thuyền</strong><span>Buffet, set menu và nhạc sống</span></p></div>
      <div><span class="tron">₫</span><p><strong>Thanh toán chuyển khoản</strong><span>Quét mã QR, có xuất hóa đơn VAT</span></p></div>
      <div><span class="tron">✓</span><p><strong>Vé có chữ ký số</strong><span>Nhân viên quét mã QR là biết vé thật</span></p></div>
    </div>
    <section class="khoi" id="danh-sach">
      <div class="khoi-dau">
        <div><h2>Chọn du thuyền</h2><p>Bấm vào tàu để xem thực đơn Buffet và Set menu.</p></div>
        <div class="chip-loc">
          <button type="button" class="chip" data-loc="" aria-pressed="true">Tất cả</button>
          <button type="button" class="chip" data-loc="Buffet" aria-pressed="false">Buffet</button>
          <button type="button" class="chip" data-loc="Set menu" aria-pressed="false">Set menu</button>
        </div>
      </div>
      <div id="danh-sach-tau" class="danh-sach-tau">
        <noscript>Vui lòng bật JavaScript để xem danh sách tàu hoặc gọi 0948170036.</noscript>
      </div>
    </section>
    <section class="khoi" id="so-sanh">
      <div class="khoi-dau"><div><h2>So sánh nhanh 6 du thuyền</h2><p>Giờ chạy, loại thực đơn và giá thấp nhất cho người lớn.</p></div></div>
      <div class="bang-so-sanh-khung">
        <table class="bang-so-sanh">
          <thead><tr><th>Du thuyền</th><th>Thực đơn</th><th>Đón khách</th><th>Khởi hành</th><th>Cập bến</th><th>Giá từ / khách</th><th></th></tr></thead>
          <tbody>
${DANH_SACH_TAU.map((t) => {
    const gia = giaThapNhat(t);
    const g = t.gioChay || {};
    return '            <tr><th scope="row"><a href="tau/' + t.slug + '.html">' + e(t.ten) + '</a></th>' +
      '<td>' + layNhanTau(t).map((n) => '<span class="nhan-nho">' + e(n) + '</span>').join(' ') + '</td>' +
      '<td>' + e(g.donKhach || '') + '</td><td>' + e(g.khoiHanh || '') + '</td><td>' + e(g.capBen || '') + '</td>' +
      '<td class="gia">' + e(gia ? dinhDangGia(gia) : 'Liên hệ') + '</td>' +
      '<td><a class="nut nut-nho" href="tau/' + t.slug + '.html">Xem</a></td></tr>';
  }).join('\n')}
          </tbody>
        </table>
      </div>
    </section>
    <section class="khoi">
      <div class="khoi-dau"><div><h2>Đặt chỗ chỉ 3 bước</h2></div></div>
      <div class="cac-buoc">
        <div><h3>Chọn tàu &amp; thực đơn</h3><p>Chọn Buffet hoặc Set menu, bấm “Xem menu” để xem món trước khi đặt.</p></div>
        <div><h3>Điền thông tin &amp; thanh toán</h3><p>Quét mã QR chuyển khoản. Cần hóa đơn VAT thì chuyển vào tài khoản công ty.</p></div>
        <div><h3>Nhận phiếu &amp; code vé</h3><p>Ms Nguyên kiểm tra thanh toán và gửi phiếu xác nhận, code vé điện tử qua Zalo.</p></div>
      </div>
    </section>
    <section class="khoi" id="hoi-dap">
      <div class="khoi-dau"><div><h2>Câu hỏi thường gặp</h2><p>Xem đầy đủ tại <a href="chinh-sach.html">Chính sách &amp; điều kiện vé</a>.</p></div></div>
      <div class="chinh-sach hoi-dap">
${[
    ['Thanh toán thế nào? Có xuất hóa đơn VAT không?', 'Quý khách chuyển khoản bằng mã QR hiện ở bước thanh toán (số tiền và nội dung đã điền sẵn). Cần hóa đơn VAT thì tích "Tôi cần xuất hóa đơn VAT" và chuyển vào tài khoản ' + CONG_TY.ten + '.'],
    ['Bao lâu thì nhận được vé?', 'Sau khi thanh toán thành công, trong vòng 24 giờ Ms Nguyên gửi phiếu xác nhận và vé điện tử (PDF) qua email và Zalo. Khi lên tàu, xuất trình vé qua điện thoại.'],
    ['Làm sao biết phiếu là thật?', 'Mỗi phiếu có chữ ký số và mã QR. Nhân viên (hoặc quý khách) quét mã sẽ thấy "VÉ HỢP LỆ" cùng tên, ngày và số khách. Phiếu bị sửa sẽ báo không hợp lệ.'],
    ['Trẻ em tính giá thế nào?', 'Mỗi tàu có chính sách riêng, ghi ngay ở ô đếm trẻ em khi đặt chỗ. Thường: trẻ dưới 1m miễn phí (2 người lớn kèm 1 bé), trẻ 1m – dưới 1,3m mua vé trẻ em, từ 1,3m mua vé người lớn.'],
    ['Có đổi ngày hoặc hủy vé được không?', 'Không hoàn/hủy vé trong ngày sử dụng. Đổi sang ngày khác được nếu báo trước 2–3 ngày (tùy tình trạng chỗ), hoàn tất khi nhân viên gửi lại mã vé điện tử mới.'],
    ['Đón khách ở đâu? Nên có mặt lúc nào?', 'Cảng Sài Gòn – 05 Nguyễn Tất Thành, phường Xóm Chiếu (cạnh Bến Nhà Rồng), có bãi giữ xe. Quý khách nên có mặt trước giờ tàu chạy; đến trễ hơn giờ tàu chạy, tàu có quyền từ chối phục vụ.']
  ].map(([h, d], i) => '        <details' + (i === 0 ? ' open' : '') + '><summary>' + e(h) + '</summary><p>' + e(d) + '</p></details>').join('\n')}
      </div>
    </section>
    <div class="bang-lien-he">
      <div><h2>Cần tư vấn chọn tàu?</h2><p>Ms Nguyên tư vấn chọn tàu và thực đơn phù hợp.</p></div>
      <div class="nhom">
        <a class="nut" href="tel:0948170036">Gọi 0948170036</a>
        <a class="nut nut-vien" href="https://zalo.me/0948170036" target="_blank" rel="noopener">Nhắn Zalo</a>
      </div>
    </div>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG)}
  <script>khoiChayTrangChu();</script>
</body>
</html>
`);

// ---------- dat-cho.html ----------
const o = (id, ten, nhan, input, them = '') => `            <div class="o-nhap${them}"><label for="${id}">${nhan}</label>${input}<p class="loi" data-loi="${ten}"></p></div>`;
ghi('dat-cho.html', `${dau('', { tieuDe: 'Đặt chỗ du thuyền | Vé Tàu Sài Gòn', moTa: 'Chọn tàu, chọn Buffet hoặc Set menu, thanh toán chuyển khoản và nhận phiếu xác nhận, code vé điện tử từ Ms Nguyên.', anh: anhChiaSe(null), url: TEN_MIEN + '/dat-cho.html' })}
<body class="trang-dat-cho">
${header('')}
  <main class="khung" id="dat-cho">
    <div class="dau-trang-dat">
      <h1>Đặt chỗ du thuyền</h1>
      <ol class="cac-buoc-dat">
        <li data-chi-buoc="1" class="dang"><b>1</b>Chọn dịch vụ</li>
        <li data-chi-buoc="2"><b>2</b>Thông tin liên hệ</li>
        <li data-chi-buoc="3"><b>3</b>Thanh toán</li>
        <li data-chi-buoc="4"><b>4</b>Nhận phiếu</li>
      </ol>
    </div>
    <div class="bo-cuc-dat">
      <form id="form-dat-cho" class="cot-form" novalidate>
        <section data-buoc="1">
          <div class="the-form">
            <h2>${ICON_TAU}Du thuyền &amp; ngày</h2>
            <div class="luoi-form">
${o('dat-cho-tau', 'slugTau', 'Du thuyền', '<select id="dat-cho-tau" name="slugTau"></select>')}
${o('dat-cho-ngay', 'ngay', 'Ngày lên tàu', '<input type="date" id="dat-cho-ngay" name="ngay">')}
            </div>
          </div>
          <div class="the-form">
            <h2>${SVG('<path d="M7 3v8a2 2 0 002 2v8"/><path d="M11 3v8a2 2 0 01-2 2"/><path d="M17 21V3c-2 0-3 3-3 7s1 4 3 4"/>')}Chọn thực đơn &amp; số khách</h2>
            <div id="khung-chon-mon"><noscript>Vui lòng bật JavaScript để đặt chỗ hoặc gọi 0948170036.</noscript></div>
          </div>
          <div class="nut-buoc"><button type="button" class="nut" data-hanh-dong="buoc-2">Tiếp tục</button></div>
        </section>
        <section data-buoc="2" hidden>
          <div class="the-form">
            <h2>${ICON_NGUOI}Thông tin liên hệ</h2>
            <div class="luoi-form">
${o('dat-cho-ho-ten', 'hoTen', 'Họ và tên', '<input type="text" id="dat-cho-ho-ten" name="hoTen" autocomplete="name" placeholder="Nguyễn Văn A">')}
${o('dat-cho-so-dien-thoai', 'soDienThoai', 'Số điện thoại (Zalo)', '<input type="tel" inputmode="tel" id="dat-cho-so-dien-thoai" name="soDienThoai" autocomplete="tel" placeholder="09xx xxx xxx">')}
${o('dat-cho-email', 'email', 'Email <small>(nhận vé điện tử PDF)</small>', '<input type="email" id="dat-cho-email" name="email" autocomplete="email" placeholder="ban@example.com">', ' ca-dong')}
${o('dat-cho-ghi-chu', 'ghiChu', 'Ghi chú <small>(không bắt buộc)</small>', '<textarea id="dat-cho-ghi-chu" name="ghiChu" placeholder="Sinh nhật, kỷ niệm, số bé dùng set menu…"></textarea>', ' ca-dong')}
            </div>
            <label class="o-chon"><input type="checkbox" name="vat" id="dat-cho-vat"><span><strong>Tôi cần xuất hóa đơn VAT</strong><small>Thanh toán vào tài khoản công ty ${e(CONG_TY.ten)}</small></span></label>
            <div class="luoi-form" id="khung-vat" hidden>
${o('dat-cho-cong-ty-ten', 'congTyTen', 'Tên công ty', '<input type="text" id="dat-cho-cong-ty-ten" name="congTyTen">', ' ca-dong')}
${o('dat-cho-cong-ty-mst', 'congTyMst', 'Mã số thuế', '<input type="text" inputmode="numeric" id="dat-cho-cong-ty-mst" name="congTyMst">')}
${o('dat-cho-cong-ty-email', 'congTyEmail', 'Email nhận hóa đơn', '<input type="email" id="dat-cho-cong-ty-email" name="congTyEmail">')}
${o('dat-cho-cong-ty-dia-chi', 'congTyDiaChi', 'Địa chỉ công ty', '<input type="text" id="dat-cho-cong-ty-dia-chi" name="congTyDiaChi">', ' ca-dong')}
            </div>
          </div>
          <div class="the-form">
            <label class="o-chon"><input type="checkbox" name="dongY" id="dat-cho-dong-y"><span><strong>Tôi đã đọc và đồng ý <a href="chinh-sach.html" target="_blank" rel="noopener">điều kiện vé &amp; chính sách đổi trả</a></strong><small>Không hoàn/hủy vé trong ngày sử dụng. Đổi ngày cần báo trước 2–3 ngày.</small></span></label>
            <p class="loi" data-loi="dongY"></p>
          </div>
          <div class="nut-buoc"><button type="button" class="nut nut-vien" data-hanh-dong="ve-buoc-1">Quay lại</button><button type="button" class="nut" data-hanh-dong="buoc-3">Tiếp tục thanh toán</button></div>
        </section>
        <section data-buoc="3" hidden>
          <div class="the-form">
            <h2>${ICON_THE}Thanh toán chuyển khoản</h2>
            <div id="khung-thanh-toan"></div>
          </div>
          <div class="nut-buoc"><button type="button" class="nut nut-vien" data-hanh-dong="ve-buoc-2">Quay lại</button><button type="button" class="nut" data-hanh-dong="da-chuyen">Tôi đã chuyển khoản</button></div>
        </section>
        <section data-buoc="4" hidden>
          <div class="the-form hop-cho">
            <div class="vong-cho" aria-hidden="true"></div>
            <h2>Đang chờ xác nhận thanh toán</h2>
            <p>Mã đơn của quý khách: <b id="ma-don-cho"></b></p>
            <p id="email-ok">Thông tin đơn đã được gửi tới Ms Nguyên. Sau khi kiểm tra tiền đã vào tài khoản, trong vòng <b>24 giờ</b> Ms Nguyên sẽ gửi <b>phiếu xác nhận “Đã thanh toán”</b> và <b>vé điện tử (file PDF)</b> qua email và Zalo của quý khách. Khi lên tàu, quý khách xuất trình vé qua điện thoại cho nhân viên.</p>
            <p id="email-loi" hidden>Chưa gửi được thông tin qua email. Vui lòng bấm “Gửi qua Zalo” bên dưới hoặc gọi 0948170036 để Ms Nguyên xác nhận.</p>
            <p>Để được xác nhận nhanh hơn, quý khách gửi mã đơn kèm ảnh chụp biên lai chuyển khoản qua Zalo:</p>
            <button type="button" class="nut nut-zalo" data-hanh-dong="zalo">Gửi qua Zalo cho Ms Nguyên</button>
            <div id="khung-sao-chep" class="khung-sao-chep"></div>
          </div>
        </section>
      </form>
      <aside class="cot-tom-tat">
        <div class="the-tom-tat">
          <h2>Chi tiết đơn</h2>
          <div id="khung-tom-tat"></div>
        </div>
        <p class="thong-bao" id="thong-bao" role="status"></p>
      </aside>
    </div>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG.concat(['dat-cho.js']))}
  <script>khoiChayTrangDatCho();</script>
</body>
</html>
`);

// ---------- xac-nhan.html (Ms Nguyên dùng; không có liên kết từ trang khác) ----------
ghi('xac-nhan.html', `${dau('', { tieuDe: 'Xác nhận thanh toán | Vé Tàu Sài Gòn', moTa: 'Trang nội bộ tạo phiếu xác nhận sau khi đã nhận thanh toán.', anh: anhChiaSe(null), url: TEN_MIEN + '/xac-nhan.html', anChiMuc: true })}
<body class="trang-dat-cho">
${header('')}
  <main class="khung" id="xac-nhan">
    <div class="dau-trang-dat">
      <h1>Xác nhận thanh toán &amp; tạo phiếu</h1>
      <p>Trang dành cho Ms Nguyên. Chỉ tạo phiếu khi đã thấy tiền vào tài khoản. Phiếu chỉ để khách lưu; khi lên tàu, nhân viên kiểm <b>code vé điện tử</b>.</p>
    </div>
    <div class="bo-cuc-dat">
      <div class="cot-form">
        <div class="the-form"><h2>Khoá ký phiếu</h2><div id="khung-khoa"></div>
          <p class="ghi-chu">Khoá bí mật chỉ nằm trên máy này và trong file sao lưu. Không gửi file khoá cho ai, không đưa lên GitHub.</p></div>
        <div class="the-form"><h2>Đơn đặt chỗ</h2><div id="tom-tat-xac-nhan"></div></div>
        <form class="the-form" id="form-xac-nhan" novalidate>
          <label class="o-chon"><input type="checkbox" name="daNhanTien"><span><strong>Tôi đã kiểm tra: tài khoản đã nhận đủ tiền</strong><small>Đúng số tiền và nội dung chuyển khoản ở trên</small></span></label>
          <div class="o-nhap" style="margin-top:14px"><label for="code-ve">Code vé điện tử <small>(nếu đã có)</small></label><input type="text" id="code-ve" name="codeVe"></div>
          <div class="nut-buoc"><button type="submit" class="nut">Tạo phiếu “Đã thanh toán”</button></div>
          <p class="thong-bao" id="thong-bao" role="status"></p>
        </form>
      </div>
      <section class="cot-phieu" id="khu-vuc-phieu" hidden>
        <div class="cot-phieu-tieu-de"><h2>Phiếu xác nhận</h2></div>
        <div class="khung-phieu" id="khung-phieu"></div>
        <div class="nhom-nut-gui">
          <button type="button" class="nut nut-xanh" data-hanh-dong="tai-anh">Tải ảnh phiếu</button>
          <button type="button" class="nut nut-vien" data-hanh-dong="in">In / Lưu PDF</button>
        </div>
        <p class="ghi-chu"><a id="link-kiem-tra" href="#" target="_blank" rel="noopener" hidden>Mở thử trang kiểm tra vé của phiếu này</a></p>
      </section>
    </div>
  </main>
${footer('')}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" integrity="sha512-ZDSPMa/JM1D+7kdg2x3BsruQ6T/JpJo3jWDWkCZsP+5yVyp1KfESqLI+7RqB5k24F7p2cV7i2YHh/890y6P6Sw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
${script('', SCRIPT_CHUNG.concat(['xac-thuc.js', 'dat-cho.js']))}
  <script>khoiChayTrangXacNhan();</script>
</body>
</html>
`);

// ---------- chinh-sach.html ----------
ghi('chinh-sach.html', `${dau('', { tieuDe: 'Chính sách & điều kiện vé | Vé Tàu Sài Gòn', moTa: 'Chính sách trẻ em, điều kiện vé, chính sách đổi trả và hướng dẫn sử dụng vé du thuyền sông Sài Gòn.', anh: anhChiaSe(null), url: TEN_MIEN + '/chinh-sach.html' })}
<body>
${header('')}
  <main class="khung">
    <div class="dau-trang-dat">
      <h1>Chính sách &amp; điều kiện vé</h1>
      <p>Áp dụng cho vé du thuyền đặt qua ${e(CONG_TY.ten)}. Một số tàu có chính sách trẻ em riêng, xem trên trang của từng tàu.</p>
    </div>
    <section class="muc" style="margin-top:16px">
${taoKhoiChinhSach(CHINH_SACH_CHUNG, true)}
      <p class="dia-diem">Điểm đón: 05 Nguyễn Tất Thành, phường Xóm Chiếu (bên cạnh Bến Nhà Rồng) · <a href="${e(LINK_BAN_DO)}" target="_blank" rel="noopener">Xem bản đồ</a></p>
    </section>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG)}
  <script>apDungCauHinhChung('');</script>
</body>
</html>
`);

// ---------- kiem-tra-ve.html (nhân viên quét QR trên phiếu) ----------
ghi('kiem-tra-ve.html', `${dau('', { tieuDe: 'Kiểm tra vé | Vé Tàu Sài Gòn', moTa: 'Kiểm tra phiếu xác nhận du thuyền có chữ ký số.', anh: '', url: TEN_MIEN + '/kiem-tra-ve.html', anChiMuc: true })}
<body class="trang-kiem-tra-ve">
${header('')}
  <main class="khung" id="kiem-tra-ve">
    <noscript>Vui lòng bật JavaScript để kiểm tra vé hoặc gọi 0948170036.</noscript>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG.concat(['xac-thuc.js']))}
  <script>khoiChayTrangKiemTraVe();</script>
</body>
</html>
`);

// ---------- tau/*.html ----------
for (const t of DANH_SACH_TAU) {
  const tieuDe = t.ten + ' – Du thuyền ăn tối sông Sài Gòn | Vé Tàu Sài Gòn';
  ghi(path.join('tau', t.slug + '.html'), `${dau('../', { tieuDe, moTa: t.moTaNgan, anh: anhChiaSe(t.slug), url: TEN_MIEN + '/tau/' + t.slug + '.html' })}
<body data-tau="${t.slug}">
${header('../')}
  <main class="khung">
    <div id="noi-dung-tau">
      <h1>${e(t.ten)}</h1>
      <noscript>Vui lòng bật JavaScript để xem chi tiết hoặc gọi 0948170036.</noscript>
    </div>
  </main>
${footer('../')}
${script('../', SCRIPT_CHUNG)}
  <script>khoiChayTrangTau();</script>
</body>
</html>
`);
}
console.log('Đã tạo lại', 5 + DANH_SACH_TAU.length, 'trang.');
