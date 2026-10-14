// Chữ ký số cho phiếu "Đã thanh toán" (chống làm giả).
// - Ms Nguyên giữ KHOÁ BÍ MẬT trên máy mình (trình duyệt + file sao lưu). Không đưa khoá bí mật lên GitHub.
// - KHOÁ CÔNG KHAI nằm trong js/cau-hinh.js (khoaCongKhai): ai cũng kiểm tra được phiếu nhưng không ai giả được chữ ký.
// - Mỗi phiếu có mã QR mở kiem-tra-ve.html#<vé đã ký>. Nhân viên quét là biết vé thật hay giả.
// Thuật toán: ECDSA P-256 + SHA-256 (WebCrypto, có sẵn trong trình duyệt và Node 18+).

var THUAT_TOAN_KY = { name: 'ECDSA', namedCurve: 'P-256' };
var THUAT_TOAN_BAM = { name: 'ECDSA', hash: 'SHA-256' };
var KHOA_LUU_TRU = 'veTauSaiGon.khoaBiMat';

function layCrypto() {
  var c = (typeof globalThis !== 'undefined' && globalThis.crypto) || (typeof window !== 'undefined' && window.crypto);
  return c && c.subtle ? c : null;
}

// base64url <-> bytes / chuỗi UTF-8 (chạy được cả trình duyệt lẫn Node).
function bytesSangB64(bytes) {
  var nhiPhan = '';
  for (var i = 0; i < bytes.length; i++) nhiPhan += String.fromCharCode(bytes[i]);
  var b64 = typeof btoa === 'function' ? btoa(nhiPhan) : Buffer.from(nhiPhan, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64SangBytes(chuoi) {
  var b64 = String(chuoi).replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  var nhiPhan = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  var bytes = new Uint8Array(nhiPhan.length);
  for (var i = 0; i < nhiPhan.length; i++) bytes[i] = nhiPhan.charCodeAt(i);
  return bytes;
}

function chuoiSangBytes(chuoi) {
  return new TextEncoder().encode(chuoi);
}

// Nội dung vé được ký: chỉ các trường nhân viên cần đối chiếu, thứ tự cố định.
// ve = { m: mã đơn, t: slug tàu, tt: tên tàu, n: ngày lên tàu (YYYY-MM-DD), h: họ tên, s: SĐT,
//        nl: người lớn, te: trẻ em tính vé, mp: bé miễn phí, g: tổng tiền, c: code vé, x: ngày xác nhận }
var TRUONG_VE = ['m', 't', 'tt', 'n', 'h', 's', 'nl', 'te', 'mp', 'g', 'c', 'x'];

var TRUONG_SO = { nl: 1, te: 1, mp: 1, g: 1 };

// Vé đọc từ QR có đúng kiểu từng trường không (số nguyên ≥ 0 cho nl/te/mp/g, chuỗi cho phần còn lại).
function laVeDungKieu(v) {
  if (!v || typeof v !== 'object') return false;
  for (var i = 0; i < TRUONG_VE.length; i++) {
    var k = TRUONG_VE[i];
    if (TRUONG_SO[k]) {
      if (typeof v[k] !== 'number' || !isFinite(v[k]) || Math.floor(v[k]) !== v[k] || v[k] < 0) return false;
    } else if (typeof v[k] !== 'string') {
      return false;
    }
  }
  return true;
}

function chuanHoaVe(ve) {
  var kq = {};
  for (var i = 0; i < TRUONG_VE.length; i++) {
    var k = TRUONG_VE[i];
    var gt = ve[k];
    kq[k] = (k === 'nl' || k === 'te' || k === 'mp' || k === 'g') ? (Number(gt) || 0) : String(gt === undefined || gt === null ? '' : gt);
  }
  return kq;
}

// Chuỗi đem ký: mảng JSON các giá trị theo thứ tự TRUONG_VE (mã hoá 1-1, không thể đổi nội dung mà giữ chữ ký).
function chuoiCanKy(ve) {
  var v = chuanHoaVe(ve);
  var giaTri = [];
  for (var i = 0; i < TRUONG_VE.length; i++) giaTri.push(v[TRUONG_VE[i]]);
  return 'VTSG2' + JSON.stringify(giaTri);
}

// Tạo cặp khoá mới. Trả { congKhai: JWK, biMat: JWK }.
function taoCapKhoa() {
  var c = layCrypto();
  if (!c) return Promise.reject(new Error('Trình duyệt không hỗ trợ chữ ký số (cần https hoặc localhost).'));
  return c.subtle.generateKey(THUAT_TOAN_KY, true, ['sign', 'verify']).then(function (cap) {
    return Promise.all([c.subtle.exportKey('jwk', cap.publicKey), c.subtle.exportKey('jwk', cap.privateKey)]);
  }).then(function (hai) {
    var congKhai = { kty: hai[0].kty, crv: hai[0].crv, x: hai[0].x, y: hai[0].y };
    return { congKhai: congKhai, biMat: hai[1] };
  });
}

// Hai khoá có cùng một cặp không (so x, y). biMat có thể là JWK hoặc bản ghi { x, y } trên máy.
function khoaKhop(congKhai, biMat) {
  return !!(congKhai && biMat && congKhai.x === biMat.x && congKhai.y === biMat.y && (biMat.crv === undefined || congKhai.crv === biMat.crv));
}

function laKhoaBiMat(jwk) {
  return !!(jwk && jwk.kty === 'EC' && jwk.crv === 'P-256' && typeof jwk.d === 'string' && typeof jwk.x === 'string' && typeof jwk.y === 'string');
}

function laKhoaCongKhai(jwk) {
  return !!(jwk && jwk.kty === 'EC' && jwk.crv === 'P-256' && typeof jwk.x === 'string' && typeof jwk.y === 'string');
}

// Ký vé. khoa: JWK khoá bí mật, hoặc bản ghi trên máy { khoa: CryptoKey (không xuất được), x, y }.
// Trả Promise<chuỗi vé đã ký> (base64url, để sau dấu # của kiem-tra-ve.html).
function kyVe(khoa, ve) {
  var c = layCrypto();
  if (!c) return Promise.reject(new Error('Trình duyệt không hỗ trợ chữ ký số.'));
  var layKhoa;
  if (khoa && typeof CryptoKey !== 'undefined' && khoa.khoa instanceof CryptoKey) layKhoa = Promise.resolve(khoa.khoa);
  else if (laKhoaBiMat(khoa)) layKhoa = c.subtle.importKey('jwk', khoa, THUAT_TOAN_KY, false, ['sign']);
  else return Promise.reject(new Error('Khoá bí mật không hợp lệ.'));
  var v = chuanHoaVe(ve);
  return layKhoa.then(function (k) {
    return c.subtle.sign(THUAT_TOAN_BAM, k, chuoiSangBytes(chuoiCanKy(v)));
  }).then(function (chuKy) {
    return bytesSangB64(chuoiSangBytes(JSON.stringify({ v: v, k: bytesSangB64(new Uint8Array(chuKy)) })));
  });
}

// A1: được ký phiếu không. banGhi: { x, y } của khoá trên máy (hoặc null). Trả null nếu được, ngược lại là lời báo.
function kiemTraKhoaTruocKhiKy(congKhai, banGhi) {
  if (!banGhi) return 'Chưa có khoá ký phiếu trên máy này. Ở mục "Khoá ký phiếu", bấm "Nạp khoá từ file" (hoặc "Tạo khoá" nếu là lần đầu).';
  if (!laKhoaCongKhai(congKhai)) return 'Web chưa cài khoá công khai. Dán dòng khoaCongKhai ở mục "Khoá ký phiếu" vào js/cau-hinh.js, tạo lại trang và push lên GitHub trước khi phát phiếu.';
  if (!khoaKhop(congKhai, banGhi)) return 'Khoá trên máy này KHÔNG khớp khoá công khai của web, phiếu ký ra sẽ bị báo không hợp lệ. Nạp đúng file khoá sao lưu.';
  return null;
}

// A2: có nên nhận file khoá này không. Trả null nếu nhận, ngược lại là lời báo.
function kiemTraFileKhoa(congKhai, jwk) {
  if (!laKhoaBiMat(jwk)) return 'File không phải khoá ký phiếu.';
  if (laKhoaCongKhai(congKhai) && !khoaKhop(congKhai, jwk)) return 'File khoá này KHÔNG khớp khoá công khai của web, nên không nạp (giữ nguyên khoá cũ).';
  return null;
}

// Kiểm tra chuỗi vé đã ký. Trả Promise<{ hopLe: boolean, ve: object|null, lyDo: string }>.
function kiemTraVe(congKhaiJwk, chuoi) {
  var c = layCrypto();
  if (!c) return Promise.resolve({ hopLe: false, ve: null, lyDo: 'Trình duyệt không hỗ trợ kiểm tra chữ ký số.' });
  if (!laKhoaCongKhai(congKhaiJwk)) return Promise.resolve({ hopLe: false, ve: null, lyDo: 'Web chưa cài khoá công khai để kiểm tra vé.' });
  var goi;
  try {
    goi = JSON.parse(new TextDecoder().decode(b64SangBytes(String(chuoi || '').replace(/^#/, ''))));
  } catch (loi) {
    return Promise.resolve({ hopLe: false, ve: null, lyDo: 'Mã vé bị hỏng hoặc không đúng định dạng.' });
  }
  if (!goi || typeof goi !== 'object' || !laVeDungKieu(goi.v) || typeof goi.k !== 'string') {
    return Promise.resolve({ hopLe: false, ve: null, lyDo: 'Mã vé bị hỏng hoặc không đúng định dạng.' });
  }
  var ve = chuanHoaVe(goi.v);
  var chuKy;
  try {
    chuKy = b64SangBytes(goi.k);
  } catch (loi) {
    return Promise.resolve({ hopLe: false, ve: ve, lyDo: 'Chữ ký bị hỏng.' });
  }
  return c.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: congKhaiJwk.x, y: congKhaiJwk.y }, THUAT_TOAN_KY, false, ['verify'])
    .then(function (khoa) {
      return c.subtle.verify(THUAT_TOAN_BAM, khoa, chuKy, chuoiSangBytes(chuoiCanKy(ve)));
    }).then(function (dung) {
      return { hopLe: !!dung, ve: ve, lyDo: dung ? '' : 'Chữ ký không khớp: vé bị sửa hoặc không do Ms Nguyên phát hành.' };
    }, function () {
      return { hopLe: false, ve: ve, lyDo: 'Không kiểm tra được chữ ký.' };
    });
}

// Mã ngắn in trên phiếu để đọc qua điện thoại (8 ký tự đầu của chữ ký).
function maXacThucNgan(chuoiVe) {
  try {
    var goi = JSON.parse(new TextDecoder().decode(b64SangBytes(chuoiVe)));
    return String(goi.k || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase().replace(/(.{4})(.{4})/, '$1-$2');
  } catch (loi) {
    return '';
  }
}

// Mở kho IndexedDB chứa khoá ký phiếu (chờ tối đa 5 giây, một số trình duyệt không bao giờ trả kết quả).
function moKhoKhoa() {
  return new Promise(function (xong, loi) {
    if (typeof indexedDB === 'undefined') { loi(new Error('Trình duyệt này không lưu được khoá (không có IndexedDB). Dùng Chrome, Edge hoặc Safari bản mới.')); return; }
    var daXong = false;
    var hen = setTimeout(function () { if (!daXong) { daXong = true; loi(new Error('Trình duyệt không mở được kho khoá (quá 5 giây). Tải lại trang rồi thử lại.')); } }, 5000);
    var ket = function (ham, gt) { if (daXong) return; daXong = true; clearTimeout(hen); ham(gt); };
    var yc;
    try {
      yc = indexedDB.open('veTauSaiGon', 1);
    } catch (e) {
      ket(loi, new Error('Trình duyệt chặn kho khoá (chế độ ẩn danh hoặc chặn lưu trữ).'));
      return;
    }
    yc.onupgradeneeded = function () { yc.result.createObjectStore('khoa'); };
    yc.onsuccess = function () { if (daXong) { yc.result.close(); return; } ket(xong, yc.result); };
    yc.onerror = function () { ket(loi, yc.error || new Error('Không mở được kho khoá.')); };
    yc.onblocked = function () { ket(loi, new Error('Kho khoá đang bị một tab khác giữ. Đóng các tab xác nhận khác rồi thử lại.')); };
  });
}

function giaoDichKhoa(cheDo, lam) {
  return moKhoKhoa().then(function (db) {
    return new Promise(function (xong, loi) {
      var gd;
      var yc;
      try {
        gd = db.transaction('khoa', cheDo);
        yc = lam(gd.objectStore('khoa'));
      } catch (e) {
        db.close();
        loi(e);
        return;
      }
      gd.oncomplete = function () { xong(yc && yc.result); db.close(); };
      gd.onerror = function () { loi(gd.error || new Error('Lỗi kho khoá.')); db.close(); };
      gd.onabort = function () { loi(gd.error || new Error('Giao dịch kho khoá bị huỷ.')); db.close(); };
    });
  });
}

// Khoá trên máy: Promise<{ khoa: CryptoKey, x, y } | null>. null = chưa có khoá; lỗi kho khoá thì Promise bị từ chối.
// Khoá JWK kiểu cũ trong localStorage chỉ được chuyển sang khi kho chưa có khoá, chuyển xong mới xoá.
function docKhoaBiMat() {
  var doc = function () {
    return giaoDichKhoa('readonly', function (kho) { return kho.get('chinh'); }).then(function (banGhi) {
      return banGhi && banGhi.khoa ? banGhi : null;
    });
  };
  return doc().then(function (banGhi) {
    if (banGhi) return banGhi;
    var cu = null;
    try { cu = JSON.parse(localStorage.getItem(KHOA_LUU_TRU) || 'null'); } catch (loi) { cu = null; }
    if (!laKhoaBiMat(cu)) return null;
    return luuKhoaBiMat(cu).then(function () {
      try { localStorage.removeItem(KHOA_LUU_TRU); } catch (loi) { /* bỏ qua */ }
      return doc();
    });
  });
}

// Lưu khoá bí mật lên máy dưới dạng CryptoKey không xuất được (chỉ ký được, không đọc ra được).
function luuKhoaBiMat(jwk) {
  var c = layCrypto();
  if (!c || !laKhoaBiMat(jwk)) return Promise.reject(new Error('Khoá bí mật không hợp lệ.'));
  return c.subtle.importKey('jwk', jwk, THUAT_TOAN_KY, false, ['sign']).then(function (khoa) {
    return giaoDichKhoa('readwrite', function (kho) { return kho.put({ khoa: khoa, x: jwk.x, y: jwk.y, crv: jwk.crv }, 'chinh'); });
  });
}

/* ---------- Trang kiểm tra vé (nhân viên tàu quét QR) ---------- */
function anSoDienThoai(sdt) {
  var s = String(sdt || '');
  return s.length >= 7 ? s.slice(0, 4) + '***' + s.slice(-3) : s;
}

function dinhDangNgayVe(iso) {
  var p = String(iso).split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso);
}

// Dựng kết quả kiểm tra. homNay: 'YYYY-MM-DD' (để báo vé không đúng ngày).
function taoKetQuaKiemTra(kq, homNay, e) {
  if (!kq.hopLe) {
    return '<div class="ve-ket-qua ve-sai"><div class="ve-dau">✕</div><h1>VÉ KHÔNG HỢP LỆ</h1><p>' + e(kq.lyDo) + '</p>' +
      '<p>Liên hệ Ms Nguyên 0948170036 để kiểm tra.</p></div>';
  }
  var v = kq.ve;
  var dungNgay = v.n === homNay;
  var logo = typeof CAU_HINH !== 'undefined' && CAU_HINH.logo ? (CAU_HINH.logo.header || '') : '';
  return '<div class="ve-ket-qua ve-dung">' +
    (logo ? '<img class="ve-logo" src="' + e(logo) + '" alt="Nguyên Nguyên Travel" onerror="this.parentNode && this.parentNode.removeChild(this)">' : '') +
    '<div class="ve-dau">✓</div><h1>VÉ HỢP LỆ</h1>' +
    '<p>Phiếu do Ms Nguyên – ' + e(typeof CONG_TY !== 'undefined' ? CONG_TY.ten : 'Nguyên Nguyên Global') + ' phát hành, nội dung chưa bị sửa.</p>' +
    (dungNgay ? '' : '<p class="ve-ngay-lech">Lưu ý: vé dùng cho ngày <b>' + e(dinhDangNgayVe(v.n)) + '</b>, không phải hôm nay.</p>') +
    '<dl>' +
    '<dt>Tàu</dt><dd>' + e(v.tt) + '</dd>' +
    '<dt>Ngày lên tàu</dt><dd>' + e(dinhDangNgayVe(v.n)) + '</dd>' +
    '<dt>Họ tên</dt><dd data-khong-dich>' + e(v.h) + '</dd>' +
    '<dt>Điện thoại</dt><dd data-khong-dich>' + e(anSoDienThoai(v.s)) + '</dd>' +
    '<dt>Số khách</dt><dd>' + e(v.nl + ' người lớn' + (v.te ? ' · ' + v.te + ' trẻ em' : '') + (v.mp ? ' · ' + v.mp + ' bé miễn phí' : '')) + '</dd>' +
    '<dt>Mã đơn</dt><dd data-khong-dich>' + e(v.m) + '</dd>' +
    (v.c ? '<dt>Code vé</dt><dd data-khong-dich>' + e(v.c) + '</dd>' : '') +
    '<dt>Xác nhận ngày</dt><dd>' + e(dinhDangNgayVe(v.x)) + '</dd>' +
    '</dl><p class="ghi-chu">Đối chiếu họ tên với CMND/hộ chiếu nếu cần. Vé chỉ có giá trị vào đúng ngày đăng ký.</p></div>';
}

function khoiChayTrangKiemTraVe() {
  if (typeof apDungCauHinhChung === 'function') apDungCauHinhChung('');
  var goc = document.getElementById('kiem-tra-ve');
  var chuoi = location.hash.replace(/^#/, '');
  var e = typeof escapeHtml === 'function' ? escapeHtml : function (t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  if (!chuoi) {
    goc.innerHTML = '<div class="ve-ket-qua"><h1>Kiểm tra vé</h1><p>Dùng camera điện thoại quét mã QR in trên phiếu xác nhận để kiểm tra vé.</p></div>';
    return;
  }
  goc.innerHTML = '<div class="ve-ket-qua"><p>Đang kiểm tra…</p></div>';
  var d = new Date();
  var homNay = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  kiemTraVe(CAU_HINH.khoaCongKhai, chuoi).then(function (kq) {
    goc.innerHTML = taoKetQuaKiemTra(kq, homNay, e);
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    taoCapKhoa, kyVe, kiemTraVe, chuoiCanKy, chuanHoaVe, khoaKhop, laKhoaBiMat, laKhoaCongKhai,
    maXacThucNgan, bytesSangB64, b64SangBytes, taoKetQuaKiemTra, anSoDienThoai,
    laVeDungKieu, kiemTraKhoaTruocKhiKy, kiemTraFileKhoa
  };
}
