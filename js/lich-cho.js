// Lịch còn chỗ / hết chỗ theo từng tàu.
// Dữ liệu ngày hết chỗ nằm ở js/lich-cho-du-lieu.js (Ms Nguyên sửa file đó, không sửa file này).
// File dữ liệu lỗi hoặc thiếu: lịch vẫn chạy, coi mọi ngày là còn chỗ.

var TEN_TRANG_THAI_CHO = { con: 'Còn chỗ', it: 'Còn ít chỗ', het: 'Hết chỗ', qua: 'Đã qua' };
var THU_NGAN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
var THU_DAY_DU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
var MAU_NGAY_LICH = /^\d{4}-\d{2}-\d{2}$/;

function haiSoLich(n) { return (n < 10 ? '0' : '') + n; }
function chuoiNgayLich(nam, thang, ngay) { return nam + '-' + haiSoLich(thang) + '-' + haiSoLich(ngay); }

// "Hôm nay" theo giờ Việt Nam (UTC+7), không theo đồng hồ máy khách (khách ở nước ngoài vẫn đúng ngày tàu chạy).
function ngayHomNayVN(bayGio) {
  var d = new Date((typeof bayGio === 'number' ? bayGio : Date.now()) + 7 * 3600 * 1000);
  return chuoiNgayLich(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

// ---------- Lịch online (Google Sheet) ----------
// LICH_ONLINE[slug + '|' + soKhach][ngay] = 'het': ngày không đủ chỗ cho đúng số khách đó (Web App trả về).
// KHACH_DANG_XEM[slug] = soKhach của đơn đang đặt: lịch và bước kiểm tra đọc đúng bảng của số khách này.
var LICH_ONLINE = {};
var KHACH_DANG_XEM = {};
var THOI_GIAN_CHO_ONLINE = 12000;
// Chuẩn hoá số khách (số, hoặc { khach, be }) thành khoá 'khach|be'.
function khoaKhach(x) {
  if (x && typeof x === 'object') return Math.max(1, x.khach | 0) + '|' + Math.max(0, x.be | 0);
  return Math.max(1, x | 0) + '|0';
}
// Promise có hạn chờ: quá ms thì trả giaTriHetGio (mạng chậm, Web App khởi động lâu).
function coHanCho(hua, ms, giaTriHetGio) {
  return new Promise(function (xong) {
    var daXong = false;
    var hen = setTimeout(function () { if (!daXong) { daXong = true; xong(giaTriHetGio); } }, ms);
    hua.then(function (kq) { if (!daXong) { daXong = true; clearTimeout(hen); xong(kq); } },
      function () { if (!daXong) { daXong = true; clearTimeout(hen); xong(giaTriHetGio); } });
  });
}
function urlLichOnline() {
  var ch = typeof CAU_HINH !== 'undefined' ? CAU_HINH : null;
  var url = ch && ch.lichChoOnline && ch.lichChoOnline.url;
  return typeof url === 'string' && /^https:\/\/script\.google(usercontent)?\.com\//.test(url) ? url : '';
}
// Tải ngày hết chỗ của 1 tàu trong 1 tháng (thang: 'YYYY-MM') cho số khách khach (số hoặc { khach, be }). xong(thanhCong).
function taiLichOnline(slug, thang, khach, xong) {
  var url = urlLichOnline();
  if (!url || !slug || typeof fetch !== 'function') { xong(false); return; }
  var k = khoaKhach(khach).split('|');
  var hua = fetch(url + '?action=lich&tau=' + encodeURIComponent(slug) + '&thang=' + encodeURIComponent(thang) + '&khach=' + k[0] + '&be=' + k[1])
    .then(function (tl) { return tl.json(); });
  coHanCho(hua, THOI_GIAN_CHO_ONLINE, null).then(function (kq) {
    if (!kq || kq.ok !== true || !kq.het || typeof kq.het.length !== 'number') { xong(false); return; }
    // Lưu theo đúng số khách đã hỏi: phản hồi về muộn của số khách cũ không làm sai bảng hiện tại.
    var khoa = slug + '|' + k[0] + '|' + k[1];
    var bang = LICH_ONLINE[khoa] || (LICH_ONLINE[khoa] = {});
    for (var ngay in bang) if (ngay.slice(0, 7) === thang) delete bang[ngay];
    for (var i = 0; i < kq.het.length; i++) if (MAU_NGAY_LICH.test(kq.het[i])) bang[kq.het[i]] = 'het';
    xong(true);
  });
}

// Gửi yêu cầu giữ chỗ khi khách sang bước thanh toán. Trả Promise<{ ok, loi?, giuDen? }>;
// chưa cài lịch online thì { ok: false, loi: 'chua-cai' }, mạng lỗi thì { ok: false, loi: 'mang' }.
function giuChoOnline(thongTin) {
  var url = urlLichOnline();
  if (!url || typeof fetch !== 'function') return Promise.resolve({ ok: false, loi: 'chua-cai' });
  // text/plain: Apps Script không trả lời yêu cầu "preflight" của trình duyệt.
  var hua = fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(thongTin) })
    .then(function (tl) { return tl.json(); });
  return coHanCho(hua, THOI_GIAN_CHO_ONLINE, null).then(function (kq) {
    return kq && typeof kq.ok === 'boolean' ? kq : { ok: false, loi: 'mang' };
  });
}

// Bảng ngày của một tàu, đã chuẩn hoá ('HET' → 'het', bỏ khoảng trắng). Ghi sai định dạng thì báo ở Console.
var daCanhBaoLich = {};
function layBangLich(slug, lich) {
  var nguon = lich || (typeof LICH_CHO === 'object' && LICH_CHO) || {};
  var bang = (nguon && typeof nguon[slug] === 'object' && nguon[slug]) || {};
  var ra = {};
  for (var ngay in bang) {
    if (!Object.prototype.hasOwnProperty.call(bang, ngay)) continue;
    var khoa = String(ngay).trim();
    var tt = String(bang[ngay]).trim().toLowerCase();
    if (MAU_NGAY_LICH.test(khoa) && (tt === 'het' || tt === 'it')) { ra[khoa] = tt; continue; }
    if (!daCanhBaoLich[slug + khoa] && typeof console !== 'undefined' && console.warn) {
      daCanhBaoLich[slug + khoa] = true;
      console.warn('lich-cho-du-lieu.js: bỏ qua "' + ngay + '": "' + bang[ngay] + '" của ' + slug + ' (viết dạng \'2026-12-24\': \'het\' hoặc \'it\')');
    }
  }
  // Lịch online: ngày hết chỗ ghi đè (chỉ khi không truyền lich riêng, tức đang chạy trên web).
  var online = !lich && LICH_ONLINE[slug + '|' + (KHACH_DANG_XEM[slug] || '1|0')];
  if (online) for (var n in online) ra[n] = 'het';
  return ra;
}

// Trạng thái một ngày của một tàu: 'qua' | 'het' | 'it' | 'con'.
function trangThaiNgay(slug, ngay, homNay, lich) {
  if (!ngay || ngay < homNay) return 'qua';
  return layBangLich(slug, lich)[ngay] || 'con';
}

// HTML lịch một tháng. thang: 1–12. ngayChon: 'YYYY-MM-DD' hoặc ''.
// Chưa chọn tàu (slug rỗng) thì chỉ khoá ngày đã qua.
function taoLichThang(slug, nam, thang, homNay, ngayChon, lich) {
  var dauThang = new Date(Date.UTC(nam, thang - 1, 1));
  var soNgay = new Date(Date.UTC(nam, thang, 0)).getUTCDate();
  // Tuần bắt đầu từ thứ Hai.
  var lech = (dauThang.getUTCDay() + 6) % 7;
  var thangHomNay = homNay.slice(0, 7);
  var thangNay = nam + '-' + haiSoLich(thang);
  var bang = slug ? layBangLich(slug, lich) : {};
  var html = '<div class="lich-dau">' +
    '<button type="button" class="lich-chuyen" data-lich-thang="-1" aria-label="Tháng trước"' + (thangNay <= thangHomNay ? ' disabled' : '') + '>‹</button>' +
    '<b class="lich-ten-thang">Tháng ' + thang + '/' + nam + '</b>' +
    '<button type="button" class="lich-chuyen" data-lich-thang="1" aria-label="Tháng sau">›</button></div>' +
    '<div class="lich-luoi">';
  var thuTuThu = [1, 2, 3, 4, 5, 6, 0];
  for (var t = 0; t < 7; t++) html += '<span class="lich-thu" aria-hidden="true">' + THU_NGAN[thuTuThu[t]] + '</span>';
  for (var k = 0; k < lech; k++) html += '<span class="lich-trong"></span>';
  for (var d = 1; d <= soNgay; d++) {
    var ngay = chuoiNgayLich(nam, thang, d);
    var tt = ngay < homNay ? 'qua' : (bang[ngay] || 'con');
    var thu = THU_DAY_DU[(lech + d - 1 + 1) % 7];
    var khoa = tt === 'qua' || tt === 'het';
    html += '<button type="button" class="lich-ngay lich-' + tt + (ngay === ngayChon ? ' chon' : '') + (ngay === homNay ? ' hom-nay' : '') + '"' +
      ' data-ngay="' + ngay + '"' + (khoa ? ' disabled' : '') + (ngay === ngayChon ? ' aria-pressed="true"' : ' aria-pressed="false"') +
      ' aria-label="' + thu + ', ' + haiSoLich(d) + '/' + haiSoLich(thang) + '/' + nam + ' – ' + TEN_TRANG_THAI_CHO[tt] + '">' +
      '<span class="lich-so">' + d + '</span>' +
      (slug && tt !== 'qua' ? '<small>' + TEN_TRANG_THAI_CHO[tt] + '</small>' : '') + '</button>';
  }
  html += '</div>';
  if (slug) {
    html += '<div class="lich-chu-thich"><span class="cham cham-con"></span><span>Còn chỗ</span>' +
      '<span class="cham cham-it"></span><span>Còn ít chỗ</span><span class="cham cham-het"></span><span>Hết chỗ</span></div>';
  }
  return html;
}

// Gắn lịch vào khung. layTau(): slug tàu đang chọn. chonNgay(ngay): gọi khi khách bấm một ngày.
// Trả về { ve(ngayChon) } để vẽ lại khi đổi tàu hoặc đổi ngày từ nơi khác; khung không có thì trả null.
// tuyChon (không bắt buộc): { layKhach: fn → số chỗ cần, khiCapNhat: fn() gọi sau khi tải xong lịch online }.
function ganLichCho(khung, homNay, layTau, chonNgay, ngayDau, tuyChon) {
  if (!khung) return null;
  tuyChon = tuyChon || {};
  var daTai = {};
  var nam = Number(homNay.slice(0, 4));
  var thang = Number(homNay.slice(5, 7));
  if (ngayDau && ngayDau >= homNay) { nam = Number(ngayDau.slice(0, 4)); thang = Number(ngayDau.slice(5, 7)); }
  var ngayChon = ngayDau || '';
  // Vùng đọc cho trình đọc màn hình nằm ngoài phần vẽ lại (đọc tên tháng khi chuyển tháng).
  var thongBao = { textContent: '' };
  if (typeof document !== 'undefined' && document.createElement && khung.parentNode) {
    thongBao = document.createElement('span');
    thongBao.className = 'an-man-hinh';
    thongBao.setAttribute('aria-live', 'polite');
    khung.parentNode.insertBefore(thongBao, khung.nextSibling);
  }
  function ve() {
    var slugVe = layTau();
    if (slugVe) KHACH_DANG_XEM[slugVe] = khoaKhach(typeof tuyChon.layKhach === 'function' ? tuyChon.layKhach() : 1);
    khung.innerHTML = taoLichThang(slugVe, nam, thang, homNay, ngayChon);
    taiThangNay();
  }
  // Tải ngày hết chỗ online của tháng đang xem (mỗi tàu/tháng/số khách tải 1 lần), xong thì vẽ lại.
  function taiThangNay() {
    var slug = layTau();
    if (!slug || !urlLichOnline()) return;
    var khach = typeof tuyChon.layKhach === 'function' ? tuyChon.layKhach() : 1;
    KHACH_DANG_XEM[slug] = khoaKhach(khach);
    var thangChuoi = nam + '-' + haiSoLich(thang);
    var khoa = slug + '|' + thangChuoi + '|' + KHACH_DANG_XEM[slug];
    if (daTai[khoa]) return;
    daTai[khoa] = true;
    if (khung.classList) khung.classList.add('dang-tai');
    taiLichOnline(slug, thangChuoi, khach, function (ok) {
      if (khung.classList) khung.classList.remove('dang-tai');
      if (!ok) { delete daTai[khoa]; return; }
      khung.innerHTML = taoLichThang(layTau(), nam, thang, homNay, ngayChon);
      if (typeof tuyChon.khiCapNhat === 'function') tuyChon.khiCapNhat();
    });
  }
  // Vẽ lại xoá nút đang được chọn bằng bàn phím: đặt lại focus vào đúng nút.
  function focusLai(chon) {
    if (!khung.querySelector) return;
    var nut = khung.querySelector(chon);
    if (nut && nut.disabled) nut = khung.querySelector('[data-lich-thang="1"]');
    if (nut && nut.focus) nut.focus();
  }
  khung.addEventListener('click', function (e) {
    var chuyen = e.target.closest('[data-lich-thang]');
    if (chuyen && !chuyen.disabled) {
      var huong = chuyen.getAttribute('data-lich-thang');
      thang += Number(huong);
      if (thang < 1) { thang = 12; nam--; }
      if (thang > 12) { thang = 1; nam++; }
      ve();
      thongBao.textContent = 'Tháng ' + thang + '/' + nam;
      focusLai('[data-lich-thang="' + huong + '"]');
      return;
    }
    var nut = e.target.closest('[data-ngay]');
    if (!nut || nut.disabled) return;
    ngayChon = nut.getAttribute('data-ngay');
    ve();
    focusLai('[data-ngay="' + ngayChon + '"]');
    chonNgay(ngayChon);
  });
  ve();
  return {
    ve: function (ngayMoi) {
      if (typeof ngayMoi === 'string') ngayChon = ngayMoi;
      ve();
    },
    // Tải lại lịch online (vd. sau khi giữ chỗ thất bại vì vừa hết chỗ).
    taiLai: function () {
      daTai = {};
      ve();
    }
  };
}

if (typeof module !== 'undefined') {
  if (typeof LICH_CHO === 'undefined') {
    try { var LICH_CHO = require('./lich-cho-du-lieu.js').LICH_CHO; } catch (loi) { /* thiếu file dữ liệu: coi như còn chỗ */ }
  }
  module.exports = {
    LICH_CHO: LICH_CHO, trangThaiNgay: trangThaiNgay, taoLichThang: taoLichThang, ganLichCho: ganLichCho,
    TEN_TRANG_THAI_CHO: TEN_TRANG_THAI_CHO, ngayHomNayVN: ngayHomNayVN, layBangLich: layBangLich,
    LICH_ONLINE: LICH_ONLINE, KHACH_DANG_XEM: KHACH_DANG_XEM, taiLichOnline: taiLichOnline, giuChoOnline: giuChoOnline, urlLichOnline: urlLichOnline, coHanCho: coHanCho
  };
}
