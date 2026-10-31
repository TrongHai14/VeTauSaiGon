// Tạo lại index.html, dat-cho.html, xac-nhan.html và tau/*.html với header/footer chung.
// Chạy: node cong-cu/tao-trang.js   (sau khi sửa header/footer hoặc thêm tàu trong js/du-lieu-tau.js)
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..');
const { DANH_SACH_TAU, CONG_TY, CHINH_SACH_CHUNG, LINK_BAN_DO, GIA_TRE_EM, LIEN_HE } = require(path.join(GOC, 'js/du-lieu-tau.js'));
const { CAU_HINH } = require(path.join(GOC, 'js/cau-hinh.js'));
global.CAU_HINH = CAU_HINH;
const { escapeHtml: e, taoKhoiChinhSach, taoTrangTau, taoTheTau, giaThapNhat, layNhanTau, dinhDangGia } = require(path.join(GOC, 'js/hien-thi.js'));

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
const SCRIPT_CHUNG = ['tu-dien-en.js', 'ngon-ngu.js', 'cau-hinh.js', 'du-lieu-tau.js', 'lich-cho-du-lieu.js', 'lich-cho.js', 'hien-thi.js'];
// ?v=<mã nội dung>: file đổi thì đường dẫn đổi, trình duyệt khách tự tải bản mới (không dùng bản cũ trong bộ nhớ đệm).
const maPhienBan = (rel) => require('crypto').createHash('sha1').update(fs.readFileSync(path.join(GOC, rel))).digest('hex').slice(0, 8);
const script = (tt, ds) => ds.map((s) => `  <script src="${tt}js/${s}?v=${maPhienBan('js/' + s)}"></script>`).join('\n');

// Dữ liệu có cấu trúc cho Google (JSON-LD). Chỉ ghi thông tin có thật, không ghi điểm đánh giá.
function jsonLd(duLieu) {
  return '\n  <script type="application/ld+json">' + JSON.stringify(duLieu).replace(/</g, '\\u003c') + '</script>';
}

function dau(tt, { tieuDe, moTa, anh, url, anChiMuc, duLieu }) {
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
${anChiMuc ? '' : '  <link rel="canonical" href="' + url + '">\n'}  <meta name="theme-color" content="#0194f3">
  <link rel="icon" type="image/png" href="${tt}anh/logo/logo-nguyen-nguyen-trong-suot.png">
  <link rel="apple-touch-icon" href="${tt}anh/logo/logo-nguyen-nguyen-trong-suot.png">${anChiMuc ? '\n  <meta name="robots" content="noindex, nofollow">' : ''}
  ${FONT}
  <script>try{if(localStorage.getItem('veTauSaiGon.giaoDien')==='toi')document.documentElement.setAttribute('data-giao-dien','toi')}catch(e){}</script>
  <link rel="stylesheet" href="${tt}css/style.css?v=${maPhienBan('css/style.css')}">${(duLieu || []).map(jsonLd).join('')}
</head>`;
}

// Logo: <span data-logo="header|footer"> được js/hien-thi.js thay bằng ảnh logo nếu đã điền trong js/cau-hinh.js.
function header(tt) {
  return `  <header class="dau-trang">
    <div class="khung">
      <a class="logo" href="${tt}index.html"><span class="logo-hinh" data-logo="header">${ICON_TAU}</span><span>Vé Tàu <b>Sài Gòn</b></span></a>
      <div class="chon-ngon-ngu" role="group" aria-label="Ngôn ngữ / Language">
        <button type="button" data-ngon-ngu="vi" lang="vi" aria-label="VI – Tiếng Việt">${CO_VN}<span>VI</span></button><button type="button" data-ngon-ngu="en" lang="en" aria-label="EN – English">${CO_ANH}<span>EN</span></button>
      </div>
      <nav class="menu-chinh">
        <a href="${tt}index.html#danh-sach">Du thuyền</a>
        <a href="${tt}dat-cho.html">Đặt chỗ</a>
        <a href="${tt}faq.html">FAQ</a>
        <a href="#lien-he">Liên hệ</a>
        <button type="button" class="nut-giao-dien" id="nut-giao-dien" aria-pressed="false" aria-label="Đổi giao diện sáng hoặc tối" title="Đổi giao diện sáng hoặc tối"><svg class="icon-toi" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 14.5A9 9 0 0 1 9.5 3a9 9 0 1 0 11.5 11.5z"/></svg><svg class="icon-sang" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg></button>
      </nav>
    </div>
  </header>`;
}

// Cờ trên nút VI/EN (SVG, vì Windows không hiện được emoji cờ).
const CO_VN = '<svg class="co" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#da251d"/><path fill="#ff0" d="M15 4l1.18 3.63h3.82l-3.09 2.24 1.18 3.63L15 11.26l-3.09 2.24 1.18-3.63L10 7.63h3.82z"/></svg>';
const CO_ANH = '<svg class="co" viewBox="0 0 60 40" aria-hidden="true"><clipPath id="co-anh-cat"><rect width="60" height="40"/></clipPath><g clip-path="url(#co-anh-cat)"><rect width="60" height="40" fill="#012169"/><path d="M0 0l60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></g></svg>';

// Nút liên hệ nổi góc dưới bên phải (mọi trang cho khách): một nút tròn, bấm vào thì mở ra Gọi, Messenger, Zalo
// (js/hien-thi.js ganLienHeNoi). Không có JS thì 3 nút hiện sẵn.
const ICON_MESSENGER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5C6.6 2.5 2.5 6.4 2.5 11.6c0 2.7 1.1 5.1 3 6.8v3.1l2.9-1.6c1.1.3 2.3.5 3.6.5 5.4 0 9.5-3.9 9.5-9.1S17.4 2.5 12 2.5zm1 12.2l-2.4-2.6-4.7 2.6 5.2-5.5 2.5 2.6 4.6-2.6-5.2 5.5z"/></svg>';
const ICON_CHAT = '<svg class="lh-icon-mo" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 5h16v11H9l-5 4z"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M8 9.5h8M8 12.5h5"/></svg>' +
  '<svg class="lh-icon-dong" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>';
function lienHeNoi() {
  const messenger = (CAU_HINH.mangXaHoi || {}).messenger || '';
  return `  <div class="lien-he-noi" id="lien-he-noi">
    <button type="button" class="lh-mo" aria-expanded="false" aria-controls="lh-ds" aria-label="Liên hệ tư vấn"><span class="lh-noi-tron">${ICON_CHAT}</span></button>
    <div class="lh-ds" id="lh-ds" role="group" aria-label="Liên hệ nhanh">
      <a class="lh-noi lh-noi-goi" href="tel:0948170036" aria-label="Gọi 0948170036"><span class="lh-noi-chu">Gọi 0948170036</span><span class="lh-noi-tron">${ICON_DT}</span></a>
${messenger ? `      <a class="lh-noi lh-noi-messenger" href="${e(messenger)}" target="_blank" rel="noopener" aria-label="Nhắn Messenger"><span class="lh-noi-chu">Nhắn Messenger</span><span class="lh-noi-tron">${ICON_MESSENGER}</span></a>
` : ''}      <a class="lh-noi lh-noi-zalo" href="https://zalo.me/0948170036" target="_blank" rel="noopener" aria-label="Nhắn Zalo 0948170036"><span class="lh-noi-chu">Nhắn Zalo</span><span class="lh-noi-tron"><b>Zalo</b></span></a>
    </div>
  </div>`;
}

// Nút Facebook, Zalo, TikTok (link trong CAU_HINH.mangXaHoi; trống thì ẩn, chỉ hiện khi xem trên máy).
const ICON_MXH = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9z"/></svg>',
  zalo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.7c0 2.7 1.4 5.1 3.6 6.7-.1.9-.5 2.1-1.4 3 0 0 2.6-.2 4.3-1.5 1.1.3 2.3.5 3.5.5 5.5 0 10-3.9 10-8.7S17.5 3 12 3zm-4.6 11.1H5.2v-.9l2.4-3.3H5.3V8.9h3.4v.9l-2.4 3.3h2.1v1zm2.9 0h-1V8.9h1v5.2zm4.4 0h-.9l-.1-.4c-.3.3-.7.5-1.2.5-1.1 0-1.9-.9-1.9-2s.8-2 1.9-2c.5 0 .9.2 1.2.5V10.6h1v3.5zm3.4.1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.9c0 7.4-8.1 9.7-11.3 4.4-2.1-3.4-.8-9.4 5.9-9.6v2.7c-.5.1-1 .2-1.5.4-1.5.5-2.3 1.4-2.1 3 .5 3.2 6.4 4.1 5.9-2.1V3h3.1z"/></svg>'
};
const TEN_MXH = { facebook: 'Facebook', zalo: 'Zalo', tiktok: 'TikTok' };
function nutMangXaHoi() {
  const mxh = CAU_HINH.mangXaHoi || {};
  return ['facebook', 'zalo', 'tiktok'].map((k) => {
    const link = mxh[k] || '';
    return link
      ? `            <a class="nut-mxh nut-mxh-${k}" href="${e(link)}" target="_blank" rel="noopener" aria-label="${TEN_MXH[k]}">${ICON_MXH[k]}<span>${TEN_MXH[k]}</span></a>`
      : `            <a class="nut-mxh nut-mxh-${k} nut-mxh-trong" href="#" data-mxh-trong hidden title="Chưa có link: điền trong js/cau-hinh.js (mangXaHoi.${k})">${ICON_MXH[k]}<span>${TEN_MXH[k]} (chưa có link)</span></a>`;
  }).join('\n');
}

// noiBo: trang nội bộ (Ms Nguyên xác nhận, nhân viên quét vé) không hiện nút liên hệ nổi.
function footer(tt, noiBo) {
  const lienKet = DANH_SACH_TAU.map((t) => `            <li><a href="${tt}tau/${t.slug}.html">${e(t.ten)}</a></li>`).join('\n');
  return `  <footer class="chan-trang" id="lien-he">
    <div class="khung">
      <div class="chan-trang-luoi">
        <div class="chan-trang-cong-ty">
          <a class="logo" href="${tt}index.html"><span class="logo-hinh" data-logo="footer">${ICON_TAU}</span><span>Vé Tàu Sài Gòn</span></a>
          <p class="huy-hieu-lon">★ ${e(CONG_TY.vaiTro)}</p>
          <h3>${e(CONG_TY.ten)}</h3>
          <p data-gioi-thieu>${e(CAU_HINH.gioiThieuCongTy)}</p>
          <div class="mang-xa-hoi">
${nutMangXaHoi()}
          </div>
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
      <div class="cong-ty">
        <p>© ${new Date().getFullYear()} <strong>${e(CONG_TY.ten)}</strong> · MST: ${CONG_TY.mst} <span class="huy-hieu">${e(CONG_TY.vaiTro)}</span></p>
        <p>Hotline: Ms Nguyên · SĐT: <a href="tel:0948170036">0948170036</a></p>
      </div>
    </div>
  </footer>
  <div class="thanh-lien-he" id="thanh-lien-he" hidden></div>${noiBo ? '' : '\n' + lienHeNoi()}`;
}

const MO_TA_CHU = 'Đặt vé du thuyền ăn tối trên sông Sài Gòn: 6 tàu, buffet và set menu, đón khách tại Cảng Sài Gòn. Liên hệ Ms Nguyên 0948170036.';
// --ra <thư mục>: ghi ra thư mục khác (test dùng để so với file trong repo mà không ghi đè).
const viTriRa = process.argv.indexOf('--ra');
const THU_MUC_RA = viTriRa > 0 && process.argv[viTriRa + 1] ? path.resolve(process.argv[viTriRa + 1]) : GOC;
const ghi = (ten, html) => {
  fs.mkdirSync(path.dirname(path.join(THU_MUC_RA, ten)), { recursive: true });
  fs.writeFileSync(path.join(THU_MUC_RA, ten), html);
};

// Chính sách trẻ em từng tàu (trang FAQ và trang chính sách): mỗi tàu một chính sách, lấy thẳng từ GIA_TRE_EM (cùng dữ liệu với ô đếm trẻ em khi đặt chỗ).
const TEN_LOAI = { buffet: 'Buffet', setMenu: 'Set menu' };
const treEmTungTau = DANH_SACH_TAU.map((t) => {
  const theoLoai = GIA_TRE_EM[t.slug] || {};
  const dong = Object.keys(theoLoai).map((loai) => {
    const cs = theoLoai[loai];
    return '            <li><span class="nhan-nho">' + TEN_LOAI[loai] + '</span> ' +
      '<span>Miễn phí:</span> <span>' + e(cs.mienPhi) + '</span>' +
      (cs.nuaGia ? '<span class="cham-ngan"> · </span><span>Vé trẻ em 50%:</span> <span>' + e(cs.nuaGia) + '</span>' : '') +
      (cs.ghiChu ? '<br><small>' + e(cs.ghiChu) + '</small>' : '') + '</li>';
  }).join('\n');
  return '          <li><a href="tau/' + t.slug + '.html"><b>' + e(t.ten) + '</b></a>\n          <ul>\n' + dong + '\n          </ul></li>';
}).join('\n');

// Câu hỏi thường gặp (trang faq.html).
const CAU_HOI_FAQ = [
  ['Thanh toán thế nào?', 'Quý khách chuyển khoản bằng mã QR hiện ở bước thanh toán (số tiền và nội dung đã điền sẵn).'],
  ['Bao lâu thì nhận được vé?', 'Sau khi thanh toán thành công, trong vòng 24 giờ Ms Nguyên gửi phiếu xác nhận và vé điện tử (PDF) qua Zalo. Khi lên tàu, xuất trình vé qua điện thoại.'],
  ['Nếu tàu hết chỗ ngày tôi chọn thì sao?', 'Sau khi quý khách thanh toán, Ms Nguyên xác nhận chỗ với tàu. Nếu tàu hết chỗ ngày đã chọn, Nguyên Nguyên Travel hoàn 100% số tiền hoặc đổi sang ngày khác theo lựa chọn của quý khách. Ngày nào tàu đã báo hết chỗ sẽ bị khoá trên lịch đặt chỗ.'],
  ['Làm sao biết phiếu là thật?', 'Phiếu đặt trên web có chữ ký số và mã QR. Nhân viên (hoặc quý khách) quét mã sẽ thấy "VÉ HỢP LỆ" cùng tên, ngày và số khách. Phiếu bị sửa sẽ báo không hợp lệ. Phiếu Ms Nguyên lập riêng cho khách đặt qua Zalo hoặc điện thoại không có mã QR; cần kiểm tra, vui lòng liên hệ Ms Nguyên 0948170036.'],
  ['Trẻ em tính giá thế nào?', 'Mỗi tàu có chính sách trẻ em riêng (độ tuổi, chiều cao, số bé miễn phí đi kèm người lớn). Chính sách của từng tàu:'],
  ['Có đổi ngày hoặc hủy vé được không?', 'Chính sách đổi trả chỉ áp dụng cho Indochina Queen và Indochina Star: không hoàn/hủy vé trong ngày sử dụng; đổi sang ngày khác được nếu báo trước 2–3 ngày (tùy tình trạng chỗ), hoàn tất khi nhân viên gửi lại mã vé điện tử mới. Các tàu khác không hỗ trợ hoàn/hủy vé hoặc đổi ngày theo yêu cầu của khách. Riêng trường hợp tàu báo hết chỗ ngày đã chọn, quý khách vẫn được hoàn 100% hoặc đổi ngày.'],
  ['Đón khách ở đâu? Nên có mặt lúc nào?', 'Cảng Sài Gòn – 05 Nguyễn Tất Thành, phường Xóm Chiếu (cạnh Bến Nhà Rồng), có bãi giữ xe. Quý khách nên có mặt trước giờ tàu chạy; đến trễ hơn giờ tàu chạy, tàu có quyền từ chối phục vụ.'],
  ['Tôi đến trễ thì có được hỗ trợ không?', 'Quý khách vui lòng báo Ms Nguyên sớm nhất có thể. Nguyên Nguyên Travel sẽ kiểm tra khả năng hỗ trợ theo quy định của tàu, nhưng không thể cam kết nếu đã quá giờ tàu chạy.'],
  ['Tôi có đổi tên người đi được không?', 'Vui lòng báo Ms Nguyên để kiểm tra điều kiện đổi tên và phí phát sinh (nếu có).'],
  ['Đi đoàn đông thì đặt thế nào?', 'Đoàn đông sẽ được báo giá riêng và hỗ trợ giữ chỗ nếu đủ điều kiện. Quý khách vui lòng gọi hoặc nhắn Zalo Ms Nguyên 0948170036.'],
  ['Tôi cần suất ăn đặc biệt được không?', 'Quý khách vui lòng báo trước khi đặt. Nguyên Nguyên Travel sẽ kiểm tra khả năng đáp ứng với tàu rồi mới xác nhận.'],
  ['Tôi có chọn được vị trí ngồi cụ thể không?', 'Nguyên Nguyên Travel hỗ trợ theo tình trạng chỗ thực tế, không đảm bảo được nếu vị trí đó đã kín.'],
  ['Trên tàu có backdrop để chụp hình không?', 'Có. Kích thước ngang 4 m, cao 2,5 m. Quý khách tự in và giao đến tàu, bên tàu sẽ gắn lên khung và treo giúp.']
];

// ---------- index.html ----------
const mxh = CAU_HINH.mangXaHoi || {};
const DL_DOANH_NGHIEP = {
  '@context': 'https://schema.org', '@type': 'TravelAgency', name: 'Vé Tàu Sài Gòn', legalName: CONG_TY.ten, taxID: CONG_TY.mst,
  url: TEN_MIEN + '/', telephone: '+84948170036', logo: TEN_MIEN + '/anh/logo/logo-nguyen-nguyen-trong-suot.png', image: TEN_MIEN + '/' + anhChiaSe(null),
  description: MO_TA_CHU, areaServed: 'Thành phố Hồ Chí Minh', address: { '@type': 'PostalAddress', addressLocality: 'Hồ Chí Minh', addressCountry: 'VN' },
  sameAs: [mxh.facebook, mxh.tiktok].filter(Boolean)
};
const DL_WEBSITE = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Vé Tàu Sài Gòn', url: TEN_MIEN + '/', inLanguage: 'vi' };
ghi('index.html', `${dau('', { tieuDe: 'Vé du thuyền sông Sài Gòn – Ăn tối trên tàu | Vé Tàu Sài Gòn', moTa: MO_TA_CHU, anh: anhChiaSe(null), url: TEN_MIEN + '/', duLieu: [DL_WEBSITE, DL_DOANH_NGHIEP] })}
<body>
${header('')}
  <section class="hero hero-toan-man">
    <div class="khung">
      <span class="nhan-hero">★ ${e(CONG_TY.vaiTro)} · 6 du thuyền</span>
      <h1>Du thuyền ăn tối trên sông Sài Gòn</h1>
      <p>Buffet, set menu và nhạc sống trên 6 du thuyền. Chọn tàu, chọn thực đơn và đặt chỗ trong vài phút.</p>
      <a class="nut nut-hero" href="#dat-ngay">Đặt chỗ ngay</a>
    </div>
    <a class="hero-xuong" href="#dat-ngay" aria-label="Xem tiếp" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  </section>
  <main class="khung" id="dat-ngay">
    <form class="o-tim-kiem" id="form-tim">
      <div class="o-tim-kiem-tieu-de"><span class="tab-tim">${ICON_TAU}Du thuyền ăn tối</span></div>
      <div class="luoi-tim">
        <div class="truong-tim"><label for="tim-tau">Chọn du thuyền</label><select id="tim-tau" name="tau"><option value="">Tất cả du thuyền</option></select></div>
        <div class="truong-tim"><label for="tim-ngay">Ngày lên tàu</label><input type="date" id="tim-ngay" name="ngay"></div>
        <div class="truong-tim"><label for="tim-khach">Số người lớn</label><input type="number" id="tim-khach" name="khach" min="1" value="2"></div>
        <button type="submit" class="nut">Tìm &amp; đặt chỗ</button>
      </div>
      <div class="ngay-nhanh-hang"><span>Chọn nhanh ngày:</span><div class="ngay-nhanh" id="ngay-nhanh"></div></div>
    </form>
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
${DANH_SACH_TAU.map((t) => taoTheTau(t, '')).join('\n')}
      </div>
    </section>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG)}
  <script>khoiChayTrangChu();</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
${script('', ['hieu-ung.js'])}
</body>
</html>
`);

// ---------- dat-cho.html ----------
const o = (id, ten, nhan, input, them = '') => `            <div class="o-nhap${them}"><label for="${id}">${nhan}</label>${input}<p class="loi" id="loi-${ten}" data-loi="${ten}"></p></div>`;
ghi('dat-cho.html', `${dau('', { tieuDe: 'Đặt chỗ du thuyền | Vé Tàu Sài Gòn', moTa: 'Chọn tàu, chọn Buffet hoặc Set menu, thanh toán chuyển khoản và nhận phiếu xác nhận, code vé điện tử từ Ms Nguyên.', anh: anhChiaSe(null), url: TEN_MIEN + '/dat-cho.html' })}
<body class="trang-dat-cho">
${header('')}
  <main class="khung" id="dat-cho">
    <div id="don-cu" class="thong-bao da-gui" role="status" hidden>
      <p id="don-cu-xong" hidden><b>Giao dịch thành công.</b> Mã đơn của quý khách: <b class="ma-don-cu"></b>. Ms Nguyên đã nhận được thanh toán và sẽ gửi code vé điện tử cho quý khách qua Zalo.</p>
      <p id="don-cu-huy" hidden><b>Đơn đã được hủy.</b> Mã đơn của quý khách: <b class="ma-don-cu"></b>. Vui lòng nhắn Zalo hoặc gọi Ms Nguyên 0948170036 nếu cần hỗ trợ.</p>
    </div>
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
${o('dat-cho-tau', 'slugTau', 'Chọn du thuyền', '<select id="dat-cho-tau" name="slugTau"></select>')}
${o('dat-cho-ngay', 'ngay', '<span id="nhan-ngay-len-tau">Ngày lên tàu</span> <small id="ngay-da-chon"></small>', '<input type="hidden" id="dat-cho-ngay" name="ngay"><div class="lich-cho" id="lich-dat-cho" role="group" aria-labelledby="nhan-ngay-len-tau" aria-describedby="loi-ngay"></div>', ' ca-dong')}
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
${o('dat-cho-ghi-chu', 'ghiChu', 'Ghi chú <small>(không bắt buộc)</small>', '<textarea id="dat-cho-ghi-chu" name="ghiChu" placeholder="Sinh nhật, kỷ niệm, số bé dùng set menu…"></textarea>', ' ca-dong')}
            </div>
          </div>
          <div class="the-form">
            <label class="o-chon"><input type="checkbox" name="dongY" id="dat-cho-dong-y"><span><strong>Tôi đã đọc và đồng ý <a href="chinh-sach.html" target="_blank" rel="noopener">điều kiện vé &amp; chính sách</a></strong><small id="dong-y-doi-tra" hidden></small></span></label>
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
            <div id="cho-xac-nhan">
            <div class="vong-cho" aria-hidden="true"></div>
            <h2>Đang chờ xác nhận thanh toán</h2>
            <p>Mã đơn của quý khách: <b id="ma-don-cho"></b></p>
            <p id="email-ok">Thông tin đơn đã được gửi tới Ms Nguyên. Sau khi kiểm tra tiền đã vào tài khoản, trong vòng <b>24 giờ</b> Ms Nguyên sẽ gửi <b>phiếu xác nhận “Đã thanh toán”</b> và <b>vé điện tử (file PDF)</b> qua Zalo của quý khách. Khi lên tàu, quý khách xuất trình vé qua điện thoại cho nhân viên.</p>
            <p id="email-loi" hidden>Chưa gửi được thông tin qua email. Vui lòng bấm “Gửi qua Zalo” bên dưới hoặc gọi 0948170036 để Ms Nguyên xác nhận.</p>
            </div>
            <div id="da-thanh-toan" role="status" hidden>
              <div class="dau-thanh-cong" aria-hidden="true">✓</div>
              <h2>Giao dịch thành công</h2>
              <p>Mã đơn của quý khách: <b id="ma-don-xong"></b></p>
              <p>Ms Nguyên đã nhận được thanh toán và sẽ gửi code vé điện tử cho quý khách qua Zalo.</p>
            </div>
            <div id="don-da-huy" role="status" hidden>
              <h2>Đơn đã được hủy</h2>
              <p>Vui lòng nhắn Zalo hoặc gọi Ms Nguyên 0948170036 nếu cần hỗ trợ.</p>
            </div>
            <p id="nhac-zalo">Để được xác nhận nhanh hơn, quý khách gửi mã đơn kèm ảnh chụp biên lai chuyển khoản qua Zalo:</p>
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
  <main class="khung" id="xac-nhan" data-khong-dich>
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
          <div class="o-nhap" style="margin-top:14px"><label for="code-ve">Code vé điện tử <small>(để trống: web tự tạo code khi tạo phiếu; tàu có cấp code riêng thì gõ vào đây)</small></label><input type="text" id="code-ve" name="codeVe"></div>
          <div class="o-nhap" id="o-ma-quan-ly" style="margin-top:14px" hidden><label for="ma-quan-ly">Mã quản lý lịch chỗ <small>(tab “Cài đặt” trong Google Sheet; nhập 1 lần, máy này sẽ nhớ)</small></label><input type="password" id="ma-quan-ly" name="maQuanLy" autocomplete="off"><button type="button" class="nut-chep" data-quen-ma style="margin-top:6px">Quên mã trên máy này</button></div>
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
${footer('', true)}
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
      <p>Áp dụng cho vé du thuyền đặt qua ${e(CONG_TY.ten)}. Mỗi tàu có chính sách trẻ em riêng, xem mục Chính sách trẻ em bên dưới.</p>
    </div>
    <section class="muc" style="margin-top:16px">
${taoKhoiChinhSach(CHINH_SACH_CHUNG, true).replace('</ul></details>', () => '</ul>\n        <h4>Chính sách trẻ em từng tàu</h4>\n        <ul class="tre-em-tung-tau">\n' + treEmTungTau + '\n        </ul></details>')}
      <p class="dia-diem">Điểm đón: 05 Nguyễn Tất Thành, phường Xóm Chiếu (bên cạnh Bến Nhà Rồng) · <a href="${e(LINK_BAN_DO)}" target="_blank" rel="noopener">Xem bản đồ</a></p>
    </section>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG)}
  <script>apDungCauHinhChung('');</script>
</body>
</html>
`);

// ---------- faq.html (câu hỏi thường gặp) ----------
ghi('faq.html', `${dau('', { tieuDe: 'Câu hỏi thường gặp (FAQ) | Vé Tàu Sài Gòn', moTa: 'Câu hỏi thường gặp khi đặt vé du thuyền sông Sài Gòn: thanh toán, nhận vé, chính sách trẻ em từng tàu, đổi ngày, điểm đón.', anh: anhChiaSe(null), url: TEN_MIEN + '/faq.html', duLieu: [{
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: CAU_HOI_FAQ.map(([h, d]) => ({ '@type': 'Question', name: h, acceptedAnswer: { '@type': 'Answer', text: d } }))
}] })}
<body>
${header('')}
  <main class="khung">
    <div class="dau-trang-dat">
      <h1>Câu hỏi thường gặp (FAQ)</h1>
      <p>Xem đầy đủ tại <a href="chinh-sach.html">Chính sách &amp; điều kiện vé</a>. Cần hỗ trợ thêm, gọi hoặc nhắn Zalo Ms Nguyên 0948170036.</p>
    </div>
    <section class="khoi" id="hoi-dap">
      <div class="chinh-sach hoi-dap">
${CAU_HOI_FAQ.map(([h, d], i) => '        <details' + (i === 0 ? ' open' : '') + '><summary>' + e(h) + '</summary><p>' + e(d) + '</p>' +
    (h === 'Trẻ em tính giá thế nào?' ? '\n        <ul class="tre-em-tung-tau">\n' + treEmTungTau + '\n        </ul>' : '') + '</details>').join('\n')}
      </div>
    </section>
  </main>
${footer('')}
${script('', SCRIPT_CHUNG)}
  <script>apDungCauHinhChung('');</script>
</body>
</html>
`);

// ---------- tao-phieu.html (khách nhắn riêng: tự điền thông tin rồi tạo phiếu; không có liên kết từ trang khách) ----------
ghi('tao-phieu.html', `${dau('', { tieuDe: 'Tạo phiếu cho khách nhắn riêng | Vé Tàu Sài Gòn', moTa: 'Trang nội bộ tạo phiếu xác nhận dịch vụ du thuyền.', anh: '', url: TEN_MIEN + '/tao-phieu.html', anChiMuc: true })}
<body class="trang-dat-cho">
${header('')}
  <main class="khung" id="tao-phieu" data-khong-dich>
    <div class="dau-trang-dat">
      <h1>Tạo phiếu cho khách nhắn riêng</h1>
      <p>Trang nội bộ. Điền thông tin khách đặt qua Zalo hoặc điện thoại để ra phiếu xác nhận dịch vụ du thuyền. Chỉ tạo phiếu khi đã thấy tiền vào tài khoản.</p>
    </div>
    <div class="bo-cuc-dat">
      <div class="cot-form">
        <form class="the-form" id="form-tao-phieu" novalidate>
          <h2>Thông tin đơn</h2>
          <div class="luoi-form">
            <div class="o-nhap"><label for="tp-tau">Du thuyền</label><select id="tp-tau" name="tau"></select><p class="loi" data-loi="tau"></p></div>
            <div class="o-nhap"><label for="tp-ngay">Ngày đi</label><input type="date" id="tp-ngay" name="ngay"><p class="loi" data-loi="ngay"></p></div>
            <div class="o-nhap ca-dong"><label for="tp-loai">Loại dịch vụ</label><select id="tp-loai" name="loai"></select><p class="loi" data-loi="loai"></p></div>
          </div>
          <div class="luoi-form" id="khung-mon-tay" style="margin-top:12px"></div>
          <p class="loi" data-loi="mon"></p>
          <p style="margin:12px 0"><b>Tổng thanh toán: <span id="tong-tay">—</span></b></p>
          <h2>Khách hàng</h2>
          <div class="luoi-form">
            <div class="o-nhap"><label for="tp-ten">Họ tên</label><input type="text" id="tp-ten" name="hoTen" autocomplete="off"><p class="loi" data-loi="hoTen"></p></div>
            <div class="o-nhap"><label for="tp-sdt">Số điện thoại</label><input type="tel" inputmode="tel" id="tp-sdt" name="soDienThoai" autocomplete="off"><p class="loi" data-loi="soDienThoai"></p></div>
            <div class="o-nhap"><label for="tp-tk">Tài khoản nhận tiền</label><select id="tp-tk" name="taiKhoan"><option value="caNhan">Tài khoản cá nhân</option><option value="congTy">Tài khoản công ty</option></select><p class="loi" data-loi="taiKhoan"></p></div>
            <div class="o-nhap ca-dong"><label for="code-ve">Code vé điện tử <small>(để trống: web tự tạo; tàu có cấp code riêng thì gõ vào đây)</small></label><input type="text" id="code-ve" name="codeVe" autocomplete="off"><p class="loi" data-loi="codeVe"></p></div>
          </div>
          <label class="o-chon" style="margin-top:14px"><input type="checkbox" name="daNhanTien"><span><strong>Tôi đã kiểm tra: tài khoản đã nhận đủ tiền</strong><small>Đúng số tiền ở trên</small></span></label>
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
          <button type="button" class="nut nut-vien" data-hanh-dong="phieu-moi">Tạo phiếu khác</button>
        </div>
      </section>
    </div>
  </main>
${footer('', true)}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
${script('', SCRIPT_CHUNG.concat(['dat-cho.js', 'tao-phieu.js']))}
  <script>khoiChayTrangTaoPhieu();</script>
</body>
</html>
`);

// ---------- phieu-chuyen-khoan.html (phiếu nhắn riêng cho khách kiểm tra rồi chuyển khoản; không có liên kết từ trang khách) ----------
ghi('phieu-chuyen-khoan.html', `${dau('', { tieuDe: 'Phiếu chuyển khoản cho khách nhắn riêng | Vé Tàu Sài Gòn', moTa: 'Trang nội bộ tạo phiếu thông tin đặt vé và chuyển khoản.', anh: '', url: TEN_MIEN + '/phieu-chuyen-khoan.html', anChiMuc: true })}
<body class="trang-dat-cho">
${header('')}
  <main class="khung" id="tao-phieu" data-khong-dich>
    <div class="dau-trang-dat">
      <h1>Phiếu chuyển khoản cho khách nhắn riêng</h1>
      <p>Trang nội bộ. Gửi ảnh phiếu cho khách kiểm tra thông tin. Khách đồng ý thì gửi thông tin chuyển khoản. Phiếu không lưu và không gửi về đâu.</p>
    </div>
    <div class="bo-cuc-dat">
      <div class="cot-form">
        <form class="the-form" id="form-tao-phieu" novalidate>
          <h2>Thông tin đơn</h2>
          <div class="luoi-form">
            <div class="o-nhap"><label for="tp-tau">Du thuyền</label><select id="tp-tau" name="tau"></select><p class="loi" data-loi="tau"></p></div>
            <div class="o-nhap"><label for="tp-ngay">Ngày đi</label><input type="date" id="tp-ngay" name="ngay"><p class="loi" data-loi="ngay"></p></div>
            <div class="o-nhap ca-dong"><label for="tp-loai">Loại dịch vụ</label><select id="tp-loai" name="loai"></select><p class="loi" data-loi="loai"></p></div>
          </div>
          <div class="luoi-form" id="khung-mon-tay" style="margin-top:12px"></div>
          <p class="loi" data-loi="mon"></p>
          <p style="margin:12px 0"><b>Tổng thanh toán: <span id="tong-tay">—</span></b></p>
          <h2>Khách hàng</h2>
          <div class="luoi-form">
            <div class="o-nhap"><label for="tp-ten">Họ tên</label><input type="text" id="tp-ten" name="hoTen" autocomplete="off"><p class="loi" data-loi="hoTen"></p></div>
            <div class="o-nhap"><label for="tp-sdt">Số điện thoại</label><input type="tel" inputmode="tel" id="tp-sdt" name="soDienThoai" autocomplete="off"><p class="loi" data-loi="soDienThoai"></p></div>
            <div class="o-nhap"><label for="tp-tk">Tài khoản nhận tiền</label><select id="tp-tk" name="taiKhoan"><option value="caNhan">Tài khoản cá nhân</option><option value="congTy">Tài khoản công ty</option></select><p class="loi" data-loi="taiKhoan"></p></div>
          </div>
          <div class="nut-buoc"><button type="submit" class="nut">Tạo phiếu chuyển khoản</button></div>
          <p class="thong-bao" id="thong-bao" role="status"></p>
        </form>
      </div>
      <section class="cot-phieu" id="khu-vuc-phieu" hidden>
        <div class="cot-phieu-tieu-de"><h2>Phiếu gửi khách</h2></div>
        <div class="khung-phieu" id="khung-phieu"></div>
        <div class="nhom-nut-gui">
          <button type="button" class="nut nut-xanh" data-hanh-dong="tai-anh">Tải ảnh phiếu</button>
          <button type="button" class="nut nut-vien" data-hanh-dong="chep-tin">Sao chép STK</button>
          <button type="button" class="nut nut-vien" data-hanh-dong="in">In / Lưu PDF</button>
          <button type="button" class="nut nut-vien" data-hanh-dong="phieu-moi">Tạo phiếu khác</button>
        </div>
      </section>
    </div>
  </main>
${footer('', true)}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
${script('', SCRIPT_CHUNG.concat(['dat-cho.js', 'tao-phieu.js']))}
  <script>khoiChayTrangTaoPhieu('chuyen-khoan');</script>
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
${footer('', true)}
${script('', SCRIPT_CHUNG.concat(['xac-thuc.js']))}
  <script>khoiChayTrangKiemTraVe();</script>
</body>
</html>
`);

// ---------- tau/*.html ----------
for (const t of DANH_SACH_TAU) {
  const nhanTau = layNhanTau(t).join(', ').toLowerCase().replace('buffet', 'Buffet').replace(/^set menu/, 'Set menu');
  const tieuDe = 'Vé du thuyền ' + t.ten + ' – ' + nhanTau + ' tối sông Sài Gòn | Vé Tàu Sài Gòn';
  const giaTu = giaThapNhat(t);
  const urlTau = TEN_MIEN + '/tau/' + t.slug + '.html';
  const moTaTau = t.moTaNgan + (giaTu ? ' Giá từ ' + dinhDangGia(giaTu) + '.' : '');
  const dlTau = [{
    '@context': 'https://schema.org', '@type': 'Product', name: 'Vé du thuyền ' + t.ten, description: t.moTaNgan, url: urlTau,
    image: TEN_MIEN + '/' + anhChiaSe(t.slug),
    offers: { '@type': 'AggregateOffer', priceCurrency: 'VND', lowPrice: giaTu, availability: 'https://schema.org/InStock', url: TEN_MIEN + '/dat-cho.html?tau=' + t.slug }
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: TEN_MIEN + '/' },
      { '@type': 'ListItem', position: 2, name: t.ten, item: urlTau }
    ]
  }];
  ghi(path.join('tau', t.slug + '.html'), `${dau('../', { tieuDe, moTa: moTaTau, anh: anhChiaSe(t.slug), url: urlTau, duLieu: dlTau })}
<body data-tau="${t.slug}">
${header('../')}
  <main class="khung">
    <div id="noi-dung-tau">
${taoTrangTau(t, LIEN_HE, '../')}
    </div>
  </main>
${footer('../')}
${script('../', SCRIPT_CHUNG)}
  <script>khoiChayTrangTau();</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" integrity="sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
${script('../', ['hieu-ung.js'])}
</body>
</html>
`);
}
// ---------- 404.html (GitHub Pages hiện trang này khi gõ sai đường dẫn) ----------
// Đường dẫn tuyệt đối (/...) vì trang 404 có thể hiện ở bất kỳ thư mục nào.
ghi('404.html', `${dau('/', { tieuDe: 'Không tìm thấy trang | Vé Tàu Sài Gòn', moTa: 'Trang không tồn tại.', anh: '', url: TEN_MIEN + '/404.html', anChiMuc: true })}
<body>
${header('/')}
  <main class="khung">
    <div class="dau-trang-dat" style="padding:48px 0">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn có thể đã thay đổi. Mời quý khách về trang chủ để chọn du thuyền, hoặc liên hệ Ms Nguyên 0948170036.</p>
      <p style="margin-top:16px"><a class="nut" href="/index.html">Về trang chủ</a> <a class="nut nut-vien" href="/dat-cho.html">Đặt chỗ</a></p>
    </div>
  </main>
${footer('/')}
${script('/', SCRIPT_CHUNG)}
  <script>apDungCauHinhChung('/');</script>
</body>
</html>
`);

// ---------- sitemap.xml, robots.txt (giúp Google tìm trang) ----------
const trangCongKhai = ['', 'dat-cho.html', 'chinh-sach.html', 'faq.html'].concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));
ghi('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  trangCongKhai.map((p) => '  <url><loc>' + TEN_MIEN + '/' + p + '</loc></url>').join('\n') + '\n</urlset>\n');
ghi('robots.txt', 'User-agent: *\nDisallow: /xac-nhan.html\nDisallow: /kiem-tra-ve.html\nDisallow: /tao-phieu.html\nDisallow: /phieu-chuyen-khoan.html\n\nSitemap: ' + TEN_MIEN + '/sitemap.xml\n');

console.log('Đã tạo lại', 9 + DANH_SACH_TAU.length, 'trang.');
