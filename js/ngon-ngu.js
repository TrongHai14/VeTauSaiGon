// Song ngữ VI / EN.
// Web viết bằng tiếng Việt. Khi chọn EN, mọi chữ trên trang (kể cả chữ hiện ra sau khi bấm nút)
// được thay bằng bản tiếng Anh trong js/tu-dien-en.js (TU_DIEN_EN và MAU_DICH_EN).
// Câu nào chưa có trong từ điển thì giữ nguyên tiếng Việt. Kiểm tra câu còn thiếu: npm test.
// Vùng có thuộc tính data-khong-dich (phiếu xác nhận, trang xác nhận nội bộ) luôn giữ tiếng Việt.

var KHOA_NGON_NGU = 'veTauSaiGon.ngonNgu';
var NGON_NGU_HO_TRO = ['vi', 'en'];

// Ngôn ngữ đang dùng: ?lang=en|vi trên link (và lưu lại), rồi tới lựa chọn đã lưu, mặc định 'vi'.
function layNgonNgu() {
  var tuLink = null;
  try {
    var m = /[?&]lang=(vi|en)\b/.exec(location.search || '');
    tuLink = m ? m[1] : null;
  } catch (loi) { tuLink = null; }
  if (tuLink) {
    try { localStorage.setItem(KHOA_NGON_NGU, tuLink); } catch (loi) { /* bỏ qua */ }
    return tuLink;
  }
  try {
    var daLuu = localStorage.getItem(KHOA_NGON_NGU);
    if (NGON_NGU_HO_TRO.indexOf(daLuu) !== -1) return daLuu;
  } catch (loi) { /* bỏ qua */ }
  return 'vi';
}

function datNgonNgu(ma) {
  if (NGON_NGU_HO_TRO.indexOf(ma) === -1) return;
  try { localStorage.setItem(KHOA_NGON_NGU, ma); } catch (loi) { /* bỏ qua */ }
  // Bỏ ?lang= cũ trên link rồi tải lại trang (giữ phần # của trang).
  var tim = String(location.search || '').replace(/([?&])lang=(vi|en)(&|$)/, function (_, dau, __, sau) { return sau ? dau : ''; }).replace(/[?&]$/, '');
  location.href = location.origin + location.pathname + (ma === 'en' ? (tim ? tim + '&' : '?') + 'lang=en' : tim) + location.hash;
}

// Chuẩn hoá để tra từ điển: gộp khoảng trắng, bỏ khoảng trắng hai đầu.
function chuanHoaChuoi(chuoi) {
  return String(chuoi).replace(/\s+/g, ' ').trim();
}

// Định dạng tiếng Anh: 18h00 → 18:00; 1.404.000 VND → 1,404,000 VND.
function dinhDangSoAnh(chuoi) {
  return chuoi
    .replace(/\b(\d{1,2})h(\d{2})\b/g, '$1:$2')
    .replace(/\b\d{1,3}(?:\.\d{3})+(?=\s?(?:VND|vnd|đ)\b|\s?đ)/g, function (so) { return so.replace(/\./g, ','); })
    .replace(/(\d)đ(?![0-9A-Za-zÀ-ỹ])/g, '$1 VND');
}

// Dịch một câu. Trả bản dịch, hoặc null nếu chưa có trong từ điển.
function dichChuoi(chuoi, ngonNgu) {
  if (ngonNgu !== 'en') return null;
  var tuDien = typeof TU_DIEN_EN !== 'undefined' ? TU_DIEN_EN : {};
  var mau = typeof MAU_DICH_EN !== 'undefined' ? MAU_DICH_EN : [];
  var khoa = chuanHoaChuoi(chuoi);
  if (!khoa) return null;
  if (Object.prototype.hasOwnProperty.call(tuDien, khoa)) return dinhDangSoAnh(tuDien[khoa]);
  for (var i = 0; i < mau.length; i++) {
    var kq = mau[i][0].exec(khoa);
    if (!kq) continue;
    var thay = mau[i][1];
    mau.thieu = false;
    var ra = typeof thay === 'function' ? thay.apply(null, kq) : khoa.replace(mau[i][0], thay);
    // Mẫu khớp nhưng phần bên trong còn tiếng Việt chưa có bản dịch: coi như chưa dịch (giữ nguyên câu Việt).
    if (mau.thieu) return null;
    return dinhDangSoAnh(ra);
  }
  // Câu không có chữ tiếng Việt (giá, giờ, tên tàu…) chỉ cần đổi định dạng số.
  if (!coChuViet(khoa)) {
    var doiSo = dinhDangSoAnh(khoa);
    return doiSo !== khoa ? doiSo : null;
  }
  return null;
}

var CHU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
function coChuViet(chuoi) {
  return CHU_VIET.test(chuoi);
}

// Ghi lại câu tiếng Việt chưa có bản dịch (chế độ thu thập, dùng khi bổ sung từ điển).
// Bật bằng: localStorage.setItem('veTauSaiGon.thuThap', '1'), rồi xem window.__thuThapChuaDich.
try {
  if (typeof window !== 'undefined' && localStorage.getItem('veTauSaiGon.thuThap') === '1') window.__thuThapChuaDich = {};
} catch (loi) { /* bỏ qua */ }

function ghiChuaDich(chuoi) {
  if (typeof window === 'undefined' || !window.__thuThapChuaDich) return;
  var khoa = chuanHoaChuoi(chuoi);
  if (khoa && coChuViet(khoa)) window.__thuThapChuaDich[khoa] = (window.__thuThapChuaDich[khoa] || 0) + 1;
}

var THUOC_TINH_DICH = ['placeholder', 'title', 'aria-label', 'alt'];
var THE_BO_QUA = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1 };

function trongVungKhongDich(nut) {
  var el = nut.nodeType === 1 ? nut : nut.parentNode;
  while (el && el.nodeType === 1) {
    if (THE_BO_QUA[el.tagName] || el.hasAttribute('data-khong-dich')) return true;
    el = el.parentNode;
  }
  return false;
}

function dichNutChu(nut, ngonNgu) {
  var goc = nut.nodeValue;
  if (!goc || !goc.trim()) return;
  if (nut.__daDich === goc) return;   // chữ do chính bộ dịch vừa đặt, không dịch lại
  var ra = dichChuoi(goc, ngonNgu);
  if (ra === null) { ghiChuaDich(goc); return; }
  var dau = /^\s*/.exec(goc)[0];
  var cuoi = /\s*$/.exec(goc)[0];
  var moi = dau + ra + cuoi;
  nut.__daDich = moi;
  if (moi !== goc) nut.nodeValue = moi;
}

function dichThuocTinh(el, ngonNgu) {
  for (var i = 0; i < THUOC_TINH_DICH.length; i++) {
    var ten = THUOC_TINH_DICH[i];
    var gt = el.getAttribute && el.getAttribute(ten);
    if (!gt) continue;
    el.__daDichTT = el.__daDichTT || {};
    if (el.__daDichTT[ten] === gt) continue;
    var ra = dichChuoi(gt, ngonNgu);
    if (ra === null) { ghiChuaDich(gt); continue; }
    el.__daDichTT[ten] = ra;
    if (ra !== gt) el.setAttribute(ten, ra);
  }
}

// Dịch toàn bộ chữ bên trong một nút (đệ quy), bỏ qua vùng data-khong-dich.
function dichVung(goc, ngonNgu) {
  if (!goc || ngonNgu === 'vi') return;
  if (goc.nodeType === 3) {
    if (!trongVungKhongDich(goc)) dichNutChu(goc, ngonNgu);
    return;
  }
  if (goc.nodeType !== 1 && goc.nodeType !== 9) return;
  if (goc.nodeType === 1 && trongVungKhongDich(goc)) return;
  if (goc.nodeType === 1) dichThuocTinh(goc, ngonNgu);
  var con = goc.childNodes;
  for (var i = 0; i < con.length; i++) {
    var c = con[i];
    if (c.nodeType === 3) dichNutChu(c, ngonNgu);
    else if (c.nodeType === 1 && !THE_BO_QUA[c.tagName] && !c.hasAttribute('data-khong-dich')) dichVung(c, ngonNgu);
  }
}

// Khởi chạy: đánh dấu nút VI/EN, dịch trang, theo dõi chữ mới hiện ra.
function khoiChayNgonNgu() {
  if (typeof document === 'undefined') return;
  var ngonNgu = layNgonNgu();
  var nut = document.querySelectorAll('[data-ngon-ngu]');
  for (var i = 0; i < nut.length; i++) {
    nut[i].setAttribute('aria-pressed', String(nut[i].getAttribute('data-ngon-ngu') === ngonNgu));
    nut[i].addEventListener('click', function () {
      var ma = this.getAttribute('data-ngon-ngu');
      if (ma !== layNgonNgu()) datNgonNgu(ma);
    });
  }
  if (ngonNgu === 'vi') return;
  document.documentElement.setAttribute('lang', ngonNgu);
  var tieuDe = dichChuoi(document.title, ngonNgu);
  if (tieuDe) document.title = tieuDe;
  var dichTatCa = function () { dichVung(document.body, ngonNgu); };
  dichTatCa();
  if (typeof MutationObserver === 'function') {
    new MutationObserver(function (cacThayDoi) {
      for (var k = 0; k < cacThayDoi.length; k++) {
        var td = cacThayDoi[k];
        if (td.type === 'characterData') { if (!trongVungKhongDich(td.target)) dichNutChu(td.target, ngonNgu); continue; }
        if (td.type === 'attributes') { if (!trongVungKhongDich(td.target)) dichThuocTinh(td.target, ngonNgu); continue; }
        for (var j = 0; j < td.addedNodes.length; j++) dichVung(td.addedNodes[j], ngonNgu);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: THUOC_TINH_DICH });
  }
}

if (typeof document !== 'undefined' && document.body) {
  // Đang chọn EN: ẩn trang trong chớp mắt cho tới khi dịch xong (không thấy chữ Việt nháy lên).
  if (layNgonNgu() === 'en') {
    document.documentElement.classList.add('dang-dich');
    setTimeout(function () { document.documentElement.classList.remove('dang-dich'); }, 1500);
  }
  // Chạy sau khi các script khác dựng xong trang (cuối hàng đợi).
  setTimeout(function () {
    khoiChayNgonNgu();
    document.documentElement.classList.remove('dang-dich');
  }, 0);
}

if (typeof module !== 'undefined') {
  module.exports = { dichChuoi, chuanHoaChuoi, dinhDangSoAnh, coChuViet, layNgonNgu };
}
