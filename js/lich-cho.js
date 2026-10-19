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
function ganLichCho(khung, homNay, layTau, chonNgay, ngayDau) {
  if (!khung) return null;
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
  function ve() { khung.innerHTML = taoLichThang(layTau(), nam, thang, homNay, ngayChon); }
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
    }
  };
}

if (typeof module !== 'undefined') {
  if (typeof LICH_CHO === 'undefined') {
    try { var LICH_CHO = require('./lich-cho-du-lieu.js').LICH_CHO; } catch (loi) { /* thiếu file dữ liệu: coi như còn chỗ */ }
  }
  module.exports = {
    LICH_CHO: LICH_CHO, trangThaiNgay: trangThaiNgay, taoLichThang: taoLichThang, ganLichCho: ganLichCho,
    TEN_TRANG_THAI_CHO: TEN_TRANG_THAI_CHO, ngayHomNayVN: ngayHomNayVN, layBangLich: layBangLich
  };
}
