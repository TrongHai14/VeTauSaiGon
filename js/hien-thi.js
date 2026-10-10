/* global LINK_BAN_DO, CHINH_SACH_CHUNG */
if (typeof module !== 'undefined' && typeof CHINH_SACH_CHUNG === 'undefined') {
  var duLieuChung = require('./du-lieu-tau.js');
  var CHINH_SACH_CHUNG = duLieuChung.CHINH_SACH_CHUNG;
  var LINK_BAN_DO = duLieuChung.LINK_BAN_DO;
}

function escapeHtml(chuoi) {
  return String(chuoi === null || chuoi === undefined ? '' : chuoi)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 615600 -> '615.600 VND'. Không phải số nguyên dương -> ''.
function dinhDangGia(soVnd) {
  if (typeof soVnd !== 'number' || !isFinite(soVnd) || Math.floor(soVnd) !== soVnd || soVnd <= 0) return '';
  return String(soVnd).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
}

// Biểu tượng SVG nét mảnh (stroke theo màu chữ).
var BIEU_TUONG = {
  tau: '<path d="M3 17l1.5 3h15L21 17"/><path d="M5 17l-1-5h16l-1 5"/><path d="M7 12V7h10v5"/><path d="M12 4v3"/>',
  gio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ghim: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  dienThoai: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
  dung: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  khien: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  the: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  tinNhan: '<path d="M4 5h16v11H8l-4 4z"/>',
  menu: '<path d="M7 3v8a2 2 0 002 2v8"/><path d="M11 3v8a2 2 0 01-2 2"/><path d="M17 21V3c-2 0-3 3-3 7s1 4 3 4"/>',
  treEm: '<circle cx="12" cy="6" r="3"/><path d="M8 21v-6l-2-3 3-2h6l3 2-2 3v6"/>',
  nhac: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  anh: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>',
  quaTang: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1z"/>',
  lich: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  nguoi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  taiVe: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  thu: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  inAn: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'
};

function icon(ten) {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (BIEU_TUONG[ten] || '') + '</svg>';
}

function timTau(danhSach, slug) {
  for (var i = 0; i < danhSach.length; i++) {
    if (danhSach[i].slug === slug) return danhSach[i];
  }
  return null;
}

function laBangPhuThu(bang) {
  return String(bang.tieuDe).indexOf('Phụ thu') === 0;
}

// Giá thấp nhất cho người lớn: bỏ bảng phụ thu và các suất trẻ em.
function giaThapNhat(tau) {
  var thapNhat = null;
  var bangGia = tau.bangGia || [];
  for (var i = 0; i < bangGia.length; i++) {
    if (laBangPhuThu(bangGia[i])) continue;
    var dong = bangGia[i].dong || [];
    for (var j = 0; j < dong.length; j++) {
      var gia = dong[j].gia;
      if (String(dong[j].ten).indexOf('Trẻ em') !== -1) continue;
      if (typeof gia === 'number' && isFinite(gia) && (thapNhat === null || gia < thapNhat)) thapNhat = gia;
    }
  }
  return thapNhat;
}

// Loại dịch vụ của một bảng giá: 'buffet', 'setMenu' hoặc 'khac' (set chill…).
function layLoaiBang(tieuDe) {
  var t = String(tieuDe);
  if (t.indexOf('Buffet') === 0) return 'buffet';
  if (t.indexOf('Set menu') === 0) return 'setMenu';
  return 'khac';
}

var TEN_LOAI = { buffet: 'Buffet', setMenu: 'Set menu' };

// Ảnh menu của từng món, lấy từ CAU_HINH.anhThucDon[slug][tiêu đề bảng][tên món] (js/cau-hinh.js).
function layAnhMon(tau, tieuDeBang, tenMon) {
  var cauHinh = typeof CAU_HINH !== 'undefined' ? CAU_HINH : null;
  var theoTau = cauHinh && cauHinh.anhThucDon && cauHinh.anhThucDon[tau.slug];
  var theoBang = theoTau && theoTau[tieuDeBang];
  var ds = theoBang && theoBang[tenMon];
  var ketQua = [];
  if (!ds) return ketQua;
  if (typeof ds === 'string') ds = [ds];
  for (var i = 0; i < ds.length; i++) {
    if (ds[i]) ketQua.push({ src: ds[i], alt: 'Thực đơn ' + tenMon + ' – ' + tau.ten });
  }
  return ketQua;
}

// Ảnh của một tàu trong CAU_HINH.anhTau: { daiDien, thuVien: [], khuyenMai: { tiêu đề: ảnh } }.
function layCauHinhAnhTau(tau) {
  var cauHinh = typeof CAU_HINH !== 'undefined' ? CAU_HINH : null;
  return (cauHinh && cauHinh.anhTau && cauHinh.anhTau[tau.slug]) || {};
}

function layAnhDaiDien(tau) {
  var src = layCauHinhAnhTau(tau).daiDien;
  return src ? { src: src, alt: 'Du thuyền ' + tau.ten } : null;
}

function layAnhKhuyenMai(tau, tieuDe) {
  var km = layCauHinhAnhTau(tau).khuyenMai || {};
  return km[tieuDe] ? { src: km[tieuDe], alt: 'Khuyến mãi ' + tieuDe + ' – ' + tau.ten } : null;
}

// Các nhóm thực đơn khách chọn được (bỏ bảng phụ thu và bảng rỗng).
// Mỗi nhóm: { chiSo, tieuDe, loai, ghiChu, dong: [{ ma: 'chiSoBang:chiSoDong', ten, tenPhu, gia, anh }] }.
function layNhomThucDon(tau) {
  var ketQua = [];
  var bangGia = (tau && tau.bangGia) || [];
  for (var i = 0; i < bangGia.length; i++) {
    var bang = bangGia[i];
    if (laBangPhuThu(bang) || !bang.dong || bang.dong.length === 0) continue;
    var dong = [];
    for (var j = 0; j < bang.dong.length; j++) {
      dong.push({
        ma: i + ':' + j, ten: bang.dong[j].ten, tenPhu: bang.dong[j].tenPhu, gia: bang.dong[j].gia,
        anh: layAnhMon(tau, bang.tieuDe, bang.dong[j].ten)
      });
    }
    ketQua.push({ chiSo: i, tieuDe: bang.tieuDe, loai: layLoaiBang(bang.tieuDe), ghiChu: bang.ghiChu, dong: dong });
  }
  return ketQua;
}

// Nhóm thực đơn theo loại: { buffet: [nhóm…], setMenu: [nhóm…] }.
function layThucDonTheoLoai(tau) {
  var kq = { buffet: [], setMenu: [] };
  var nhom = layNhomThucDon(tau);
  for (var i = 0; i < nhom.length; i++) {
    if (kq[nhom[i].loai]) kq[nhom[i].loai].push(nhom[i]);
  }
  return kq;
}

// Nhãn loại dịch vụ của tàu: 'Buffet', 'Set menu', 'Set chill'.
function layNhanTau(tau) {
  var nhan = [];
  var nhom = layNhomThucDon(tau);
  var cacLoai = ['Buffet', 'Set menu', 'Set chill'];
  for (var i = 0; i < cacLoai.length; i++) {
    for (var j = 0; j < nhom.length; j++) {
      if (nhom[j].tieuDe.indexOf(cacLoai[i]) === 0) { nhan.push(cacLoai[i]); break; }
    }
  }
  if (tau && tau.moTaGia && tau.moTaGia.indexOf('Set menu') !== -1 && nhan.indexOf('Set menu') === -1) nhan.push('Set menu');
  return nhan;
}

function taoLinkDatCho(tienTo, slug, maThucDon, loai) {
  return tienTo + 'dat-cho.html?tau=' + encodeURIComponent(slug) +
    (loai ? '&loai=' + encodeURIComponent(loai) : '') +
    (maThucDon ? '&menu=' + encodeURIComponent(maThucDon) : '');
}

// Mọi ảnh trên web đi qua hàm này. Chưa có file ảnh thì onerror đổi sang khung "Hình ảnh đang cập nhật".
// nhan: chữ hiện trên khung thay thế (ví dụ tên tàu).
function taoAnh(src, alt, tienTo, lazy, nhan) {
  return '<img src="' + escapeHtml(tienTo + src) + '" alt="' + escapeHtml(alt) + '"' +
    (lazy ? ' loading="lazy"' : '') + ' data-tep="' + escapeHtml(src) + '"' +
    (nhan ? ' data-nhan="' + escapeHtml(nhan) + '"' : '') + ' onerror="anhLoi(this)">';
}

// Mở web trên máy (localhost / file://) thì khung thay thế ghi tên file cần đưa vào.
function laCheDoThietKe() {
  if (typeof location === 'undefined') return false;
  return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

// Ảnh SVG (data URI) làm khung thay thế: nền xanh đêm, sóng nước, con tàu, 1–2 dòng chữ.
function taoAnhCho(dong1, dong2) {
  var e = function (t) { return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b2a4a"/><stop offset="1" stop-color="#0770cd"/></linearGradient></defs>' +
    '<rect width="800" height="500" fill="url(#n)"/>' +
    '<g fill="none" stroke="#ffffff" stroke-opacity=".10" stroke-width="3">' +
    '<path d="M0 380q100-30 200 0t200 0 200 0 200 0"/><path d="M0 420q100-30 200 0t200 0 200 0 200 0"/><path d="M0 460q100-30 200 0t200 0 200 0 200 0"/></g>' +
    '<g transform="translate(340 150)" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 95l12 22h76l12-22"/><path d="M22 95l-8-38h92l-8 38"/><path d="M34 57V25h52v32"/><path d="M60 5v20"/></g>' +
    '<text x="400" y="330" text-anchor="middle" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">' + e(dong1) + '</text>' +
    (dong2 ? '<text x="400" y="372" text-anchor="middle" font-family="Consolas, monospace" font-size="20" fill="#bfe3ff">' + e(dong2) + '</text>' : '') +
    '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// onerror của ảnh: thay bằng khung thay thế (chạy một lần).
function anhLoi(img) {
  img.onerror = null;
  var nhan = img.getAttribute('data-nhan');
  var tep = img.getAttribute('data-tep');
  if (laCheDoThietKe() && tep) img.src = taoAnhCho(nhan || 'Chưa có ảnh', 'Đưa ảnh vào: ' + tep);
  else img.src = taoAnhCho(nhan || 'Hình ảnh đang cập nhật', nhan ? 'Hình ảnh đang cập nhật' : '');
  img.classList.add('anh-cho');
}

function taoKhoiGia(tau, nhanNho) {
  var gia = giaThapNhat(tau);
  if (tau.moTaGia) return '<small>' + nhanNho + '</small><strong style="font-size:15px">' + escapeHtml(tau.moTaGia) + '</strong>';
  if (gia === null) return '<small>Giá</small><strong style="font-size:15px">Liên hệ</strong>';
  return '<small>' + nhanNho + '</small><strong>' + escapeHtml(dinhDangGia(gia)) + '</strong>';
}

function taoTheTau(tau, tienTo) {
  var gio = tau.gioChay || {};
  var nhan = layNhanTau(tau);
  var nhanHtml = '';
  for (var i = 0; i < nhan.length; i++) nhanHtml += '<span>' + escapeHtml(nhan[i]) + '</span>';
  return '<article class="the-tau" data-loai="' + escapeHtml(nhan.join('|')) + '">' +
    '<a href="' + escapeHtml(tienTo + 'tau/' + tau.slug + '.html') + '">' +
    '<div class="the-tau-anh">' +
    (layAnhDaiDien(tau) ? taoAnh(layAnhDaiDien(tau).src, layAnhDaiDien(tau).alt, tienTo, true, tau.ten) : '') +
    (nhanHtml ? '<div class="the-tau-nhan">' + nhanHtml + '</div>' : '') + '</div>' +
    '<div class="the-tau-noi-dung">' +
    '<h3>' + escapeHtml(tau.ten) + '</h3>' +
    '<p class="the-tau-gio">' +
    (gio.donKhach ? '<span>' + icon('gio') + 'Đón ' + escapeHtml(gio.donKhach) + '</span>' : '') +
    (gio.khoiHanh ? '<span>' + icon('tau') + 'Khởi hành ' + escapeHtml(gio.khoiHanh) + '</span>' : '') +
    '</p>' +
    (tau.moTaNgan ? '<p class="the-tau-mo-ta">' + escapeHtml(tau.moTaNgan) + '</p>' : '') +
    '<div class="the-tau-chan"><p class="the-tau-gia">' + taoKhoiGia(tau, 'Giá từ / khách') + '</p>' +
    '<span class="nut nut-nho nut-xanh">Xem thực đơn</span></div>' +
    '</div></a></article>';
}

function taoNutLienHe(lienHe) {
  return '<div class="nut-lien-he">' +
    '<a class="nut nut-xanh" href="' + escapeHtml(lienHe.linkGoi) + '">' + icon('dienThoai') + 'Gọi ' +
    escapeHtml(lienHe.soDienThoai) + ' (' + escapeHtml(lienHe.tenNguoiLienHe) + ')</a>' +
    '<a class="nut nut-zalo" href="' + escapeHtml(lienHe.linkZalo) + '" target="_blank" rel="noopener">Nhắn Zalo</a>' +
    '</div>';
}

function taoMuc(id, bieuTuong, tieuDe, noiDung) {
  return '<section class="muc" id="' + id + '"><h2>' + icon(bieuTuong) + tieuDe + '</h2>' + noiDung + '</section>';
}

function taoDanhSachDau(danhSach) {
  var html = '<ul class="danh-sach-dau">';
  for (var i = 0; i < danhSach.length; i++) html += '<li>' + icon('dung') + escapeHtml(danhSach[i]) + '</li>';
  return html + '</ul>';
}

var SO_DONG_HIEN_SAN = 6;
var SO_MON_CO_LOC = 9;   // từ 9 món trở lên thì hiện chip lọc nhanh

// Nhóm con của một món để lọc nhanh: '3 món', '4 món', 'Chay', 'Trẻ em'… ('' nếu không xếp được).
function layNhomCon(ten) {
  var t = String(ten);
  if (/Trẻ em|Kid/i.test(t)) return 'Trẻ em';
  if (/Chay/i.test(t)) return 'Chay';
  var so = /^(\d+) món/.exec(t);
  return so ? so[1] + ' món' : '';
}

// Chip lọc cho danh sách món dài; '' nếu danh sách ngắn hoặc không chia được.
function taoChipNhomCon(cacNhom) {
  var dem = {};
  var thuTu = [];
  var tong = 0;
  for (var i = 0; i < cacNhom.length; i++) {
    for (var j = 0; j < cacNhom[i].dong.length; j++) {
      var k = layNhomCon(cacNhom[i].dong[j].ten);
      tong++;
      if (!k) continue;
      if (!dem[k]) { dem[k] = 0; thuTu.push(k); }
      dem[k]++;
    }
  }
  if (tong < SO_MON_CO_LOC || thuTu.length < 3) return '';
  var html = '<div class="chip-loc chip-nhom-con"><button type="button" class="chip" data-loc-nhom-con="" aria-pressed="true">Tất cả</button>';
  for (var n = 0; n < thuTu.length; n++) {
    html += '<button type="button" class="chip" data-loc-nhom-con="' + escapeHtml(thuTu[n]) + '" aria-pressed="false">' +
      escapeHtml(thuTu[n]) + ' (' + dem[thuTu[n]] + ')</button>';
  }
  return html + '</div>';
}

// Bấm chip: chỉ hiện món thuộc nhóm con đó (bỏ giới hạn "Xem thêm" khi đang lọc).
function locNhomCon(goc, chip) {
  var khung = chip.closest('.nhom-loai') || goc;
  var gt = chip.getAttribute('data-loc-nhom-con');
  var cacChip = khung.querySelectorAll('[data-loc-nhom-con]');
  for (var i = 0; i < cacChip.length; i++) cacChip[i].setAttribute('aria-pressed', String(cacChip[i] === chip));
  var cacMon = khung.querySelectorAll('[data-nhom-con]');
  for (var j = 0; j < cacMon.length; j++) cacMon[j].hidden = !!gt && cacMon[j].getAttribute('data-nhom-con') !== gt;
  var xemThem = khung.querySelectorAll('[data-xem-them]');
  for (var k = 0; k < xemThem.length; k++) xemThem[k].parentNode.removeChild(xemThem[k]);
}

// Một dòng món: ảnh nhỏ, tên, giá, nút Xem menu và nút Đặt.
function taoDongMon(tau, dong, loai, an, tienTo) {
  var anhNho = dong.anh.length > 0
    ? taoAnh(dong.anh[0].src, dong.anh[0].alt, tienTo, true, dong.ten)
    : '<span class="anh-trong">' + icon('menu') + '</span>';
  return '<div class="dong-thuc-don" data-nhom-con="' + escapeHtml(layNhomCon(dong.ten)) + '"' + (an ? ' hidden data-an' : '') + '>' +
    '<button type="button" class="anh-mon" data-mo-anh="mon:' + dong.ma + '" data-i="0" aria-label="Xem menu ' + escapeHtml(dong.ten) + '">' + anhNho + '</button>' +
    '<div class="ten"><strong>' + escapeHtml(dong.ten) + '</strong>' +
    (dong.tenPhu ? '<span class="ten-phu">' + escapeHtml(dong.tenPhu) + '</span>' : '') +
    '<button type="button" class="nut-xem-menu" data-mo-anh="mon:' + dong.ma + '" data-i="0">' + icon('anh') + 'Xem menu</button></div>' +
    '<div class="gia"><strong>' + escapeHtml(dinhDangGia(dong.gia)) + '</strong><small>/ khách</small></div>' +
    '<a class="nut nut-nho" href="' + escapeHtml(taoLinkDatCho(tienTo, tau.slug, dong.ma, loai)) + '">Đặt</a></div>';
}

// Lời nhắn khi tàu không có (hoặc chưa có danh sách) một loại thực đơn.
function taoThongBaoThieuLoai(tau, loai, lienHe) {
  if (loai === 'setMenu' && tau.moTaGia && tau.moTaGia.indexOf('Set menu') !== -1) {
    return '<div class="hop-trong"><p><strong>' + escapeHtml(tau.moTaGia.split('·')[0].trim()) + '</strong></p>' +
      '<p>Danh sách set menu của tàu đang được cập nhật. Vui lòng nhắn Zalo để Ms Nguyên gửi thực đơn và báo giá.</p>' +
      '<a class="nut nut-zalo nut-nho" href="' + escapeHtml(lienHe.linkZalo) + '" target="_blank" rel="noopener">Nhắn Zalo hỏi set menu</a></div>';
  }
  return '<div class="hop-trong"><p>Tàu ' + escapeHtml(tau.ten) + ' chỉ phục vụ <strong>' +
    (loai === 'buffet' ? 'set menu' : 'buffet') + '</strong>.</p></div>';
}

function taoMucThucDon(tau, tienTo, lienHe) {
  var theoLoai = layThucDonTheoLoai(tau);
  var cacLoai = ['buffet', 'setMenu'];
  var loaiDau = theoLoai.buffet.length > 0 ? 'buffet' : 'setMenu';
  var html = '<div class="tab-loai" role="tablist">';
  for (var t = 0; t < cacLoai.length; t++) {
    var soMon = 0;
    for (var n = 0; n < theoLoai[cacLoai[t]].length; n++) soMon += theoLoai[cacLoai[t]][n].dong.length;
    html += '<button type="button" role="tab" data-tab-loai="' + cacLoai[t] + '" aria-pressed="' + (cacLoai[t] === loaiDau) + '">' +
      '<strong>' + TEN_LOAI[cacLoai[t]] + '</strong><span>' + (soMon > 0 ? soMon + ' lựa chọn' : 'Không phục vụ') + '</span></button>';
  }
  html += '</div>';

  for (var i = 0; i < cacLoai.length; i++) {
    var loai = cacLoai[i];
    html += '<div class="nhom-loai" data-loai="' + loai + '"' + (loai !== loaiDau ? ' hidden' : '') + '>';
    if (theoLoai[loai].length === 0) html += taoThongBaoThieuLoai(tau, loai, lienHe);
    html += taoChipNhomCon(theoLoai[loai]);
    for (var g = 0; g < theoLoai[loai].length; g++) {
      var nhom = theoLoai[loai][g];
      html += '<div class="nhom-thuc-don">';
      if (nhom.tieuDe !== TEN_LOAI[loai]) html += '<h3>' + escapeHtml(nhom.tieuDe) + '</h3>';
      for (var j = 0; j < nhom.dong.length; j++) html += taoDongMon(tau, nhom.dong[j], loai, j >= SO_DONG_HIEN_SAN, tienTo);
      var conLai = nhom.dong.length - SO_DONG_HIEN_SAN;
      if (conLai > 0) html += '<button type="button" class="nut-xem-them" data-xem-them>Xem thêm ' + conLai + ' thực đơn ▾</button>';
      if (nhom.ghiChu) html += '<p class="ghi-chu">' + escapeHtml(nhom.ghiChu) + '</p>';
      html += '</div>';
    }
    html += '</div>';
  }

  var bangGia = tau.bangGia || [];
  for (var k = 0; k < bangGia.length; k++) {
    if (!laBangPhuThu(bangGia[k]) || !bangGia[k].dong || bangGia[k].dong.length === 0) continue;
    html += '<div class="hop-phu-thu"><h3>' + escapeHtml(bangGia[k].tieuDe) + '</h3><ul>';
    for (var d = 0; d < bangGia[k].dong.length; d++) {
      var pt = bangGia[k].dong[d];
      html += '<li>' + escapeHtml(pt.ten) + (pt.tenPhu ? ' (' + escapeHtml(pt.tenPhu) + ')' : '') + ': <strong>' +
        escapeHtml(dinhDangGia(pt.gia)) + '</strong> / khách</li>';
    }
    html += '</ul>' + (bangGia[k].ghiChu ? '<p class="ghi-chu">' + escapeHtml(bangGia[k].ghiChu) + '</p>' : '') + '</div>';
  }
  return taoMuc('thuc-don', 'menu', 'Chọn thực đơn', html);
}

function taoMucKhuyenMai(tau, tienTo) {
  var khuyenMai = tau.khuyenMai || [];
  if (khuyenMai.length === 0) return '';
  var html = '';
  for (var i = 0; i < khuyenMai.length; i++) {
    var km = khuyenMai[i];
    html += '<div class="khuyen-mai">' +
      (layAnhKhuyenMai(tau, km.tieuDe) ? '<button type="button" data-mo-anh="khuyenMai" data-i="' + i + '">' +
        taoAnh(layAnhKhuyenMai(tau, km.tieuDe).src, layAnhKhuyenMai(tau, km.tieuDe).alt, tienTo, true, km.tieuDe) + '</button>' : '') +
      '<div><h3>' + escapeHtml(km.tieuDe) + '</h3><p>' + escapeHtml(km.noiDung) + '</p></div></div>';
  }
  return taoMuc('khuyen-mai', 'quaTang', 'Khuyến mãi', html);
}

function taoMucLichTrinh(tau) {
  var gio = tau.gioChay || {};
  var cacMoc = [['Đón khách', gio.donKhach], ['Khởi hành', gio.khoiHanh], ['Cập bến', gio.capBen]];
  var html = '';
  var moc = '';
  for (var i = 0; i < cacMoc.length; i++) {
    if (cacMoc[i][1]) moc += '<li><small>' + cacMoc[i][0] + '</small><strong>' + escapeHtml(cacMoc[i][1]) + '</strong></li>';
  }
  if (moc) html += '<ul class="dong-thoi-gian">' + moc + '</ul>';
  if (gio.ghiChu) html += '<p class="ghi-chu">' + escapeHtml(gio.ghiChu) + '</p>';
  if (tau.diaChi) {
    html += '<p class="dia-diem">' + icon('ghim') + '<span><strong>Điểm đón khách:</strong> ' + escapeHtml(tau.diaChi) +
      ' (bên cạnh Bến Nhà Rồng, có bãi giữ xe) · <a href="' + escapeHtml(LINK_BAN_DO) + '" target="_blank" rel="noopener">Xem bản đồ</a></span></p>';
  }
  if (tau.loTrinh && tau.loTrinh.length > 0) {
    html += '<ol class="lo-trinh">';
    for (var j = 0; j < tau.loTrinh.length; j++) html += '<li>' + escapeHtml(tau.loTrinh[j]) + '</li>';
    html += '</ol>';
  }
  return html ? taoMuc('lich-trinh', 'gio', 'Giờ chạy &amp; lộ trình', html) : '';
}

// Ảnh để xem: ảnh đại diện + thư viện ảnh.
function layAnhTau(tau) {
  var ch = layCauHinhAnhTau(tau);
  var kq = [];
  var dd = layAnhDaiDien(tau);
  if (dd) kq.push(dd);
  var thuVien = ch.thuVien || [];
  for (var i = 0; i < thuVien.length; i++) {
    if (thuVien[i]) kq.push({ src: thuVien[i], alt: 'Du thuyền ' + tau.ten + ' – ảnh ' + (i + 1) });
  }
  return kq;
}

// Lưới ảnh đầu trang tàu: 1 ảnh lớn (ảnh đại diện) + 4 ảnh nhỏ; bấm mở xem tất cả.
function taoLuoiAnhDau(tau, tienTo) {
  var anh = layAnhTau(tau);
  if (anh.length === 0) return '';
  var soO = Math.min(anh.length, 5);
  var html = '<div class="luoi-anh' + (soO < 5 ? ' luoi-anh-it' : '') + '">';
  var nhanXemTat = 'Xem tất cả ' + anh.length + ' ảnh';
  for (var i = 0; i < soO; i++) {
    var lopPhu = '';
    if (i === soO - 1 && anh.length > soO) lopPhu = '<span class="con-lai">' + nhanXemTat + '</span>';
    else if (i === 2 && anh.length > 3) lopPhu = '<span class="con-lai chi-dien-thoai">' + nhanXemTat + '</span>';
    html += '<button type="button" data-mo-anh="tau" data-i="' + i + '" aria-label="Xem ảnh ' + (i + 1) + '">' +
      taoAnh(anh[i].src, anh[i].alt, tienTo, i > 0, tau.ten) + lopPhu + '</button>';
  }
  return html + '</div>';
}

function taoTheDatNhanh(tau, lienHe, tienTo) {
  var gio = tau.gioChay || {};
  return '<aside class="cot-phai"><div class="the-dat-nhanh">' +
    '<h3>' + escapeHtml(tau.ten) + '</h3>' +
    '<p class="gia">' + taoKhoiGia(tau, 'Giá từ / khách') + '</p>' +
    '<ul>' +
    (gio.donKhach ? '<li><span>Đón khách</span><strong>' + escapeHtml(gio.donKhach) + '</strong></li>' : '') +
    (gio.khoiHanh ? '<li><span>Khởi hành</span><strong>' + escapeHtml(gio.khoiHanh) + '</strong></li>' : '') +
    (gio.capBen ? '<li><span>Cập bến</span><strong>' + escapeHtml(gio.capBen) + '</strong></li>' : '') +
    '</ul>' +
    '<a class="nut nut-rong" href="' + escapeHtml(taoLinkDatCho(tienTo, tau.slug, null)) + '">Đặt chỗ ngay</a>' +
    '<a class="nut nut-vien nut-rong" href="' + escapeHtml(lienHe.linkGoi) + '">' + icon('dienThoai') + 'Gọi ' + escapeHtml(lienHe.soDienThoai) + '</a>' +
    '<p class="phu">' + escapeHtml(lienHe.tenNguoiLienHe) + ' xác nhận chỗ qua Zalo hoặc điện thoại</p>' +
    '</div></aside>';
}

function taoTrangTau(tau, lienHe, tienTo) {
  var gio = tau.gioChay || {};
  var html = '<nav class="duong-dan"><a href="' + escapeHtml(tienTo + 'index.html') + '">Trang chủ</a> › ' +
    '<a href="' + escapeHtml(tienTo + 'index.html#danh-sach') + '">Du thuyền</a> › ' + escapeHtml(tau.ten) + '</nav>';

  html += '<div class="tieu-de-tau"><div><h1>' + escapeHtml(tau.ten) + '</h1><div class="the-thong-tin">' +
    (gio.donKhach ? '<span>' + icon('gio') + 'Đón khách ' + escapeHtml(gio.donKhach) + '</span>' : '') +
    (gio.khoiHanh ? '<span>' + icon('tau') + 'Khởi hành ' + escapeHtml(gio.khoiHanh) + '</span>' : '') +
    '<span>' + icon('ghim') + 'Cảng Sài Gòn</span></div></div>' +
    '<div class="gia-tieu-de">' + taoKhoiGia(tau, 'Giá từ / khách') + '</div></div>';

  html += taoLuoiAnhDau(tau, tienTo);

  var cacMuc = [
    ['thuc-don', 'Thực đơn & giá', taoMucThucDon(tau, tienTo, lienHe)],
    ['khuyen-mai', 'Khuyến mãi', taoMucKhuyenMai(tau, tienTo)],
    ['lich-trinh', 'Lịch trình', taoMucLichTrinh(tau)],
    ['tre-em', 'Trẻ em', tau.chinhSachTreEm && tau.chinhSachTreEm.length > 0
      ? taoMuc('tre-em', 'treEm', 'Chính sách trẻ em', taoDanhSachDau(tau.chinhSachTreEm)) : ''],
    ['giai-tri', 'Giải trí', tau.giaiTri && tau.giaiTri.length > 0
      ? taoMuc('giai-tri', 'nhac', 'Dịch vụ giải trí', taoDanhSachDau(tau.giaiTri)) : ''],
    ['dieu-kien', 'Điều kiện vé', taoMuc('dieu-kien', 'khien', 'Điều kiện vé &amp; chính sách',
      taoKhoiChinhSach(CHINH_SACH_CHUNG, false) +
      '<p class="ghi-chu">Xem đầy đủ tại <a href="' + escapeHtml(tienTo + 'chinh-sach.html') + '">Chính sách &amp; điều kiện vé</a>.</p>')]
  ];
  var tab = '';
  var noiDung = '';
  for (var i = 0; i < cacMuc.length; i++) {
    if (!cacMuc[i][2]) continue;
    tab += '<a href="#' + cacMuc[i][0] + '">' + escapeHtml(cacMuc[i][1]) + '</a>';
    noiDung += cacMuc[i][2];
  }
  html += '<nav class="thanh-tab">' + tab + '</nav>';
  noiDung += taoMuc('lien-he', 'dienThoai', 'Liên hệ đặt chỗ', taoNutLienHe(lienHe) +
    '<p class="dia-diem">' + icon('ghim') + escapeHtml(tau.diaChi || '') + '</p>');
  html += '<div class="bo-cuc-tau"><div class="cot-chinh">' + noiDung + '</div>' + taoTheDatNhanh(tau, lienHe, tienTo) + '</div>';
  return html;
}

// Khối chính sách dạng mục mở/đóng. moSan: true thì mở sẵn tất cả.
function taoKhoiChinhSach(chinhSach, moSan) {
  var html = '<div class="chinh-sach">';
  for (var i = 0; i < chinhSach.length; i++) {
    var muc = chinhSach[i];
    html += '<details id="' + escapeHtml(muc.id) + '"' + (moSan || i === 0 ? ' open' : '') + '><summary>' + escapeHtml(muc.tieuDe) + '</summary>';
    for (var j = 0; j < muc.nhom.length; j++) {
      if (muc.nhom[j].tieuDe) html += '<h4>' + escapeHtml(muc.nhom[j].tieuDe) + '</h4>';
      html += taoDanhSachDau(muc.nhom[j].dong);
    }
    html += '</details>';
  }
  return html + '</div>';
}

/* ---------- Lightbox xem ảnh ---------- */
function ganLightbox(goc, cacNhom, tienTo) {
  var hop = document.createElement('div');
  hop.className = 'lightbox';
  hop.setAttribute('role', 'dialog');
  hop.setAttribute('aria-modal', 'true');
  hop.innerHTML = '<div class="lightbox-dau"><span class="lightbox-dem"></span>' +
    '<button type="button" data-dong aria-label="Đóng">×</button></div>' +
    '<div class="lightbox-than"><button type="button" class="lightbox-chuyen" data-lui aria-label="Ảnh trước">‹</button>' +
    '<img alt=""><button type="button" class="lightbox-chuyen" data-toi aria-label="Ảnh sau">›</button></div>' +
    '<div class="lightbox-day"></div>';
  document.body.appendChild(hop);
  var anhLon = hop.querySelector('.lightbox-than img');
  var dem = hop.querySelector('.lightbox-dem');
  var day = hop.querySelector('.lightbox-day');
  var nhomHienTai = [];
  var viTri = 0;

  function hien(i) {
    viTri = (i + nhomHienTai.length) % nhomHienTai.length;
    var anhHien = nhomHienTai[viTri] || { src: '', alt: '' };
    anhLon.classList.remove('anh-cho');
    anhLon.setAttribute('data-tep', anhHien.src);
    anhLon.setAttribute('data-nhan', anhHien.alt);
    anhLon.onerror = function () { anhLoi(anhLon); };
    if (anhHien.src) anhLon.src = tienTo + anhHien.src;
    else anhLoi(anhLon);
    anhLon.alt = anhHien.alt;
    dem.textContent = (viTri + 1) + ' / ' + nhomHienTai.length;
    var nho = day.children;
    for (var k = 0; k < nho.length; k++) nho[k].className = k === viTri ? 'chon' : '';
    if (nho[viTri] && nho[viTri].scrollIntoView) nho[viTri].scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function mo(tenNhom, i) {
    nhomHienTai = (cacNhom[tenNhom] || []).filter(function (x) { return !!x; });
    if (nhomHienTai.length === 0) return;
    var html = '';
    for (var k = 0; k < nhomHienTai.length; k++) {
      html += '<button type="button" data-den="' + k + '">' + (nhomHienTai[k] && nhomHienTai[k].src
        ? taoAnh(nhomHienTai[k].src, nhomHienTai[k].alt, tienTo, true, nhomHienTai[k].alt)
        : '<img alt="" src="' + taoAnhCho('', '') + '">') + '</button>';
    }
    day.innerHTML = html;
    hop.classList.add('mo');
    document.body.style.overflow = 'hidden';
    hien(i);
  }
  function dong() {
    hop.classList.remove('mo');
    document.body.style.overflow = '';
  }
  goc.addEventListener('click', function (e) {
    var nut = e.target.closest('[data-mo-anh]');
    if (!nut) return;
    mo(nut.getAttribute('data-mo-anh'), Number(nut.getAttribute('data-i')) || 0);
  });
  hop.addEventListener('click', function (e) {
    if (e.target.closest('[data-dong]') || e.target === hop.querySelector('.lightbox-than')) dong();
    else if (e.target.closest('[data-lui]')) hien(viTri - 1);
    else if (e.target.closest('[data-toi]')) hien(viTri + 1);
    else if (e.target.closest('[data-den]')) hien(Number(e.target.closest('[data-den]').getAttribute('data-den')));
  });
  document.addEventListener('keydown', function (e) {
    if (!hop.classList.contains('mo')) return;
    if (e.key === 'Escape') dong();
    if (e.key === 'ArrowLeft') hien(viTri - 1);
    if (e.key === 'ArrowRight') hien(viTri + 1);
  });
  var xBatDau = null;
  hop.addEventListener('touchstart', function (e) { xBatDau = e.touches[0].clientX; }, { passive: true });
  hop.addEventListener('touchend', function (e) {
    if (xBatDau === null) return;
    var dx = e.changedTouches[0].clientX - xBatDau;
    if (Math.abs(dx) > 50) hien(viTri + (dx < 0 ? 1 : -1));
    xBatDau = null;
  });
}

function ganSuKienThucDon(goc) {
  goc.addEventListener('click', function (e) {
    var chipLoc = e.target.closest('[data-loc-nhom-con]');
    if (chipLoc) {
      locNhomCon(goc, chipLoc);
      return;
    }
    var tab = e.target.closest('[data-tab-loai]');
    if (tab) {
      var cacTab = goc.querySelectorAll('[data-tab-loai]');
      for (var i = 0; i < cacTab.length; i++) cacTab[i].setAttribute('aria-pressed', String(cacTab[i] === tab));
      var cacNhom = goc.querySelectorAll('.nhom-loai');
      for (var j = 0; j < cacNhom.length; j++) cacNhom[j].hidden = cacNhom[j].getAttribute('data-loai') !== tab.getAttribute('data-tab-loai');
      return;
    }
    var xemThem = e.target.closest('[data-xem-them]');
    if (xemThem) {
      var an = xemThem.parentNode.querySelectorAll('[data-an]');
      for (var k = 0; k < an.length; k++) an[k].hidden = false;
      xemThem.parentNode.removeChild(xemThem);
    }
  });
}

// Tô đậm tab của mục đang xem khi cuộn.
function ganTheoDoiTab(goc) {
  if (typeof IntersectionObserver !== 'function') return;
  var lienKet = goc.querySelectorAll('.thanh-tab a');
  var quanSat = new IntersectionObserver(function (cacMuc) {
    for (var i = 0; i < cacMuc.length; i++) {
      if (!cacMuc[i].isIntersecting) continue;
      for (var j = 0; j < lienKet.length; j++) {
        lienKet[j].classList.toggle('dang-xem', lienKet[j].getAttribute('href') === '#' + cacMuc[i].target.id);
      }
    }
  }, { rootMargin: '-140px 0px -60% 0px' });
  var cacMuc = goc.querySelectorAll('.muc');
  for (var k = 0; k < cacMuc.length; k++) quanSat.observe(cacMuc[k]);
}

/* ---------- Logo, chân trang, ảnh bìa (từ js/cau-hinh.js) ---------- */
function layCauHinh() {
  return typeof CAU_HINH !== 'undefined' ? CAU_HINH : {};
}

// Thay biểu tượng mặc định bằng logo thật nếu đã điền, và đổ phần giới thiệu công ty vào chân trang.
function apDungCauHinhChung(tienTo) {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  var ch = layCauHinh();
  var logo = ch.logo || {};
  var cacLogo = document.querySelectorAll('[data-logo]');
  // Tải thử logo; chỉ thay biểu tượng con tàu khi file logo có thật. Logo footer thiếu thì dùng logo header.
  function datLogo(oLogo, viTri, dsThu) {
    if (dsThu.length === 0) return;
    var thu = new Image();
    thu.onload = function () {
      oLogo.innerHTML = '<img src="' + escapeHtml(tienTo + dsThu[0]) + '" alt="Logo ' + escapeHtml(CONG_TY.ten) + '">';
      oLogo.className = 'logo-anh logo-anh-' + viTri;
      if (oLogo.nextElementSibling) oLogo.nextElementSibling.classList.add('logo-chu-phu');
    };
    thu.onerror = function () { datLogo(oLogo, viTri, dsThu.slice(1)); };
    thu.src = tienTo + dsThu[0];
  }
  for (var i = 0; i < cacLogo.length; i++) {
    var viTri = cacLogo[i].getAttribute('data-logo');
    var dsThu = [logo[viTri]];
    if (viTri === 'footer') dsThu.push(logo.header);
    datLogo(cacLogo[i], viTri, dsThu.filter(function (x) { return !!x; }));
  }
  var gioiThieu = document.querySelector('[data-gioi-thieu]');
  if (gioiThieu && ch.gioiThieuCongTy) gioiThieu.textContent = ch.gioiThieuCongTy;
}

// Ảnh bìa chạy lần lượt (mờ dần + phóng nhẹ). Có videoBia thì phát video thay ảnh.
function khoiChayAnhBia(hero, tienTo) {
  if (!hero) return;
  var ch = layCauHinh();
  var lop = document.createElement('div');
  lop.className = 'hero-nen';
  if (ch.videoBia) {
    lop.innerHTML = '<video autoplay muted loop playsinline preload="metadata"' +
      (ch.anhBia && ch.anhBia[0] ? ' poster="' + escapeHtml(tienTo + ch.anhBia[0]) + '"' : '') +
      '><source src="' + escapeHtml(tienTo + ch.videoBia) + '" type="video/mp4"></video>';
    hero.insertBefore(lop, hero.firstChild);
    return;
  }
  // Tải thử từng ảnh bìa; ảnh nào chưa có file thì bỏ (trên máy thì thay bằng khung ghi tên file).
  var dsAnh = (ch.anhBia || []).filter(function (x) { return !!x; });
  var conCho = dsAnh.length;
  var ketQua = [];
  if (conCho === 0) return;
  for (var k = 0; k < dsAnh.length; k++) {
    (function (viTri) {
      var thu = new Image();
      thu.onload = function () { ketQua[viTri] = tienTo + dsAnh[viTri]; xong(); };
      thu.onerror = function () { ketQua[viTri] = null; thieu.push(dsAnh[viTri]); xong(); };
      thu.src = tienTo + dsAnh[viTri];
    })(k);
  }
  var thieu = [];
  function xong() {
    conCho--;
    if (conCho > 0) return;
    chayAnhBia(hero, lop, ketQua.filter(function (x) { return !!x; }));
    // Trên máy: nhãn nhỏ góc dưới ghi ảnh bìa còn thiếu.
    if (thieu.length > 0 && laCheDoThietKe()) {
      var nhan = document.createElement('div');
      nhan.className = 'nhan-thieu-anh';
      nhan.textContent = 'Chưa có ảnh bìa – đưa vào: ' + thieu.join(', ');
      hero.appendChild(nhan);
    }
  }
}

function chayAnhBia(hero, lop, anh) {
  if (anh.length === 0) return;
  var html = '';
  for (var i = 0; i < anh.length; i++) {
    html += '<div class="hero-anh' + (i === 0 ? ' hien' : '') + '" style="background-image:url(&quot;' + escapeHtml(anh[i]) + '&quot;)"></div>';
  }
  lop.innerHTML = html;
  hero.insertBefore(lop, hero.firstChild);
  hero.style.backgroundImage = 'none';
  if (anh.length < 2) return;
  var cham = document.createElement('div');
  cham.className = 'hero-cham';
  for (var j = 0; j < anh.length; j++) cham.innerHTML += '<button type="button" aria-label="Ảnh bìa ' + (j + 1) + '"' + (j === 0 ? ' class="chon"' : '') + '></button>';
  hero.appendChild(cham);
  var cacAnh = lop.children;
  var cacCham = cham.children;
  var hienTai = 0;
  function den(k) {
    cacAnh[hienTai].className = 'hero-anh';
    cacCham[hienTai].className = '';
    hienTai = (k + anh.length) % anh.length;
    cacAnh[hienTai].className = 'hero-anh hien';
    cacCham[hienTai].className = 'chon';
  }
  var hen = setInterval(function () { den(hienTai + 1); }, 6000);
  cham.addEventListener('click', function (e) {
    var nut = e.target.closest('button');
    if (!nut) return;
    clearInterval(hen);
    den(Array.prototype.indexOf.call(cacCham, nut));
    hen = setInterval(function () { den(hienTai + 1); }, 6000);
  });
}

/* ---------- Khởi chạy ---------- */
function khoiChayTrangChu() {
  apDungCauHinhChung('');
  khoiChayAnhBia(document.querySelector('.hero'), '');
  var danhSach = document.getElementById('danh-sach-tau');
  if (danhSach) {
    var html = '';
    for (var i = 0; i < DANH_SACH_TAU.length; i++) html += taoTheTau(DANH_SACH_TAU[i], '');
    danhSach.innerHTML = html;
  }

  var chip = document.querySelectorAll ? document.querySelectorAll('[data-loc]') : [];
  for (var c = 0; c < chip.length; c++) {
    chip[c].addEventListener('click', function () {
      var loai = this.getAttribute('data-loc');
      for (var k = 0; k < chip.length; k++) chip[k].setAttribute('aria-pressed', String(chip[k] === this));
      var the = danhSach.querySelectorAll('.the-tau');
      for (var t = 0; t < the.length; t++) {
        the[t].hidden = !!loai && the[t].getAttribute('data-loai').split('|').indexOf(loai) === -1;
      }
    });
  }

  var formTim = document.getElementById('form-tim');
  if (formTim) {
    var oTau = formTim.elements.tau;
    var option = '<option value="">Tất cả du thuyền</option>';
    for (var j = 0; j < DANH_SACH_TAU.length; j++) {
      option += '<option value="' + escapeHtml(DANH_SACH_TAU[j].slug) + '">' + escapeHtml(DANH_SACH_TAU[j].ten) + '</option>';
    }
    oTau.innerHTML = option;
    var homNay = new Date();
    var thang = homNay.getMonth() + 1;
    var ngay = homNay.getDate();
    formTim.elements.ngay.min = homNay.getFullYear() + '-' + (thang < 10 ? '0' : '') + thang + '-' + (ngay < 10 ? '0' : '') + ngay;
    formTim.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!oTau.value) {
        document.getElementById('danh-sach').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      location.href = taoLinkDatCho('', oTau.value, null) +
        (formTim.elements.ngay.value ? '&ngay=' + encodeURIComponent(formTim.elements.ngay.value) : '') +
        '&nl=' + encodeURIComponent(formTim.elements.khach.value || '2');
    });
  }
}

function khoiChayTrangTau() {
  apDungCauHinhChung('../');
  var khung = document.getElementById('noi-dung-tau');
  var tau = timTau(DANH_SACH_TAU, document.body.getAttribute('data-tau'));
  if (!tau) {
    if (khung) {
      khung.innerHTML = '<section class="muc" style="margin-top:24px"><h1>Không tìm thấy tàu</h1>' +
        '<p><a href="../index.html">← Tất cả tàu</a></p></section>';
    }
    return;
  }
  if (!khung) return;
  khung.innerHTML = taoTrangTau(tau, LIEN_HE, '../');
  var thanh = document.getElementById('thanh-lien-he');
  if (thanh) {
    thanh.innerHTML = '<div class="gia-nho">' + taoKhoiGia(tau, 'Giá từ') + '</div>' +
      '<a class="nut nut-zalo" href="' + escapeHtml(LIEN_HE.linkZalo) + '" target="_blank" rel="noopener">Zalo</a>' +
      '<a class="nut" href="' + escapeHtml(taoLinkDatCho('../', tau.slug, null)) + '">Đặt chỗ</a>';
  }
  var khuyenMai = [];
  for (var i = 0; i < (tau.khuyenMai || []).length; i++) khuyenMai[i] = layAnhKhuyenMai(tau, tau.khuyenMai[i].tieuDe);
  var cacNhomAnh = { tau: layAnhTau(tau), khuyenMai: khuyenMai };
  // Mỗi món một nhóm ảnh; món chưa gắn ảnh riêng thì mở ảnh menu chung của tàu.
  var nhom = layNhomThucDon(tau);
  for (var n = 0; n < nhom.length; n++) {
    for (var m = 0; m < nhom[n].dong.length; m++) {
      var mon = nhom[n].dong[m];
      cacNhomAnh['mon:' + mon.ma] = mon.anh.length > 0 ? mon.anh : [{ src: '', alt: 'Thực đơn ' + mon.ten }];
    }
  }
  ganLightbox(khung, cacNhomAnh, '../');
  ganSuKienThucDon(khung);
  ganTheoDoiTab(khung);
}

if (typeof module !== 'undefined') {
  module.exports = {
    escapeHtml, dinhDangGia, icon, timTau, giaThapNhat, layNhomThucDon, layThucDonTheoLoai, layLoaiBang, layAnhMon, layNhanTau, taoLinkDatCho, apDungCauHinhChung, layAnhTau, layAnhDaiDien, layAnhKhuyenMai, taoAnhCho, taoAnh, layNhomCon, taoChipNhomCon,
    taoTheTau, taoTrangTau, taoNutLienHe, taoKhoiChinhSach, khoiChayTrangChu, khoiChayTrangTau
  };
}
