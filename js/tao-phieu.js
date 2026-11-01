// Trang tao-phieu.html: tự điền thông tin khách nhắn riêng (Zalo, điện thoại) rồi ra phiếu xác nhận ngay.
// Không dùng khoá ký: phiếu ở đây không có mã QR chữ ký số. Dùng lại cách tính tiền và mẫu phiếu của js/dat-cho.js.

// Kiểm tra đơn nhập tay. Trả { ten ô: lời báo }; rỗng là hợp lệ.
function kiemTraDonTay(don, tau, bangTreEm, homNay) {
  var loi = {};
  if (!tau) loi.tau = 'Vui lòng chọn du thuyền.';
  if (!laNgayCoThat(don.ngay) || don.ngay < homNay) loi.ngay = 'Vui lòng chọn ngày đi từ hôm nay trở đi.';
  var ten = String(don.hoTen || '').trim();
  if (!ten || ten.length > 100) loi.hoTen = 'Vui lòng nhập họ tên khách (tối đa 100 ký tự).';
  if (chuanHoaSoDienThoai(don.soDienThoai) === null) loi.soDienThoai = 'Số điện thoại không hợp lệ.';
  if (tau && (tomTatDon(don, tau, bangTreEm).dong.length === 0 || (don.loai === 'buffet' && soNguyen(don.nguoiLon) < 1))) loi.mon = 'Vui lòng chọn thực đơn và ít nhất 1 người lớn.';
  return loi;
}

// HTML phần chọn thực đơn của một tàu theo loại (buffet / set menu).
function taoOChonMonTay(tau, loai) {
  var e = escapeHtmlDatCho;
  var nhom = tau ? hamHienThi.layThucDonTheoLoai(tau)[loai] : [];
  var html = '';
  var oSo = function (ten, nhan, gt) {
    return '<div class="o-nhap"><label>' + e(nhan) + '<input type="number" min="0" inputmode="numeric" name="' + e(ten) + '" value="' + gt + '"></label></div>';
  };
  if (loai === 'buffet') {
    html += '<div class="o-nhap ca-dong"><label>Hạng buffet<select name="buffetMa">';
    for (var i = 0; i < nhom.length; i++) {
      for (var j = 0; j < nhom[i].dong.length; j++) {
        var d = nhom[i].dong[j];
        html += '<option value="' + e(d.ma) + '">' + e(d.ten + ' – ' + hamHienThi.dinhDangGia(d.gia)) + '</option>';
      }
    }
    return html + '</select></label></div>' + oSo('nguoiLon', 'Người lớn', 2) + oSo('treEm50', 'Trẻ em tính vé', 0) + oSo('treEmMienPhi', 'Bé miễn phí', 0);
  }
  for (var n = 0; n < nhom.length; n++) {
    for (var m = 0; m < nhom[n].dong.length; m++) {
      var mon = nhom[n].dong[m];
      html += oSo('mon:' + mon.ma, mon.ten + ' – ' + hamHienThi.dinhDangGia(mon.gia), 0);
    }
  }
  return html + oSo('treEmMienPhi', 'Bé miễn phí', 0);
}

// CRC-16/CCITT-FALSE của chuỗi QR ngân hàng (chuẩn EMVCo).
function crcVietQR(chuoi) {
  var crc = 0xFFFF;
  for (var i = 0; i < chuoi.length; i++) {
    crc ^= chuoi.charCodeAt(i) << 8;
    for (var j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return ('000' + crc.toString(16).toUpperCase()).slice(-4);
}
// Nội dung mã VietQR chuyển khoản nhanh 24/7, có sẵn số tiền và nội dung.
function taoChuoiVietQR(maNganHang, soTaiKhoan, soTien, noiDung) {
  var o = function (id, gt) { return id + ('0' + gt.length).slice(-2) + gt; };
  var thuHuong = o('00', 'A000000727') + o('01', o('00', maNganHang) + o('01', soTaiKhoan)) + o('02', 'QRIBFTTA');
  var than = o('00', '01') + o('01', '12') + o('38', thuHuong) + o('53', '704') + o('54', String(soTien)) + o('58', 'VN') + o('62', o('08', noiDung)) + '6304';
  return than + crcVietQR(than);
}

// Danh sách phiếu đã gửi khách, chờ khách chuyển khoản. Chỉ lưu trên máy tạo phiếu; khách chuyển xong thì mở lại để tạo phiếu xác nhận.
var KHOA_PHIEU_CHO = 'veTauSaiGon.phieuChoChuyenKhoan';
var SO_PHIEU_CHO_TOI_DA = 30;
function layPhieuCho(kho, homNay) {
  try {
    var ds = JSON.parse(kho.getItem(KHOA_PHIEU_CHO));
    if (!Array.isArray(ds)) return [];
    var ngay = homNay || ngayHomNayDiaPhuong(new Date());
    var con = ds.filter(function (d) {
      return laDonHopLe(d) && new Date(d.ngay + 'T00:00:00Z').getTime() + 7 * 864e5 >= new Date(ngay + 'T00:00:00Z').getTime();
    });
    if (con.length !== ds.length) kho.setItem(KHOA_PHIEU_CHO, JSON.stringify(con));
    return con;
  } catch (loi) { return []; }
}
function luuPhieuCho(don, kho) {
  try {
    var con = layPhieuCho(kho).filter(function (d) { return d.maDon !== don.maDon; });
    con.unshift(don);
    kho.setItem(KHOA_PHIEU_CHO, JSON.stringify(con.slice(0, SO_PHIEU_CHO_TOI_DA)));
  } catch (loi) { /* bỏ qua */ }
}
function xoaPhieuCho(maDon, kho) {
  try {
    kho.setItem(KHOA_PHIEU_CHO, JSON.stringify(layPhieuCho(kho).filter(function (d) { return d.maDon !== maDon; })));
  } catch (loi) { /* bỏ qua */ }
}
function timPhieuCho(maDon, kho) {
  return layPhieuCho(kho).filter(function (d) { return d.maDon === maDon; })[0] || null;
}
function taoDanhSachPhieuCho(ds, danhSachTau, bangTreEm) {
  var e = escapeHtmlDatCho;
  return ds.map(function (d) {
    var tau = timTauTheoSlug(danhSachTau, d.slugTau);
    if (!tau) return '';
    return '<div class="dong-phieu-cho"><div><b>' + e(d.hoTen.trim()) + '</b> · ' + e(chuanHoaSoDienThoai(d.soDienThoai) || d.soDienThoai) +
      '<br>' + e(tau.ten) + ' · ' + e(dinhDangNgay(d.ngay)) + ' · ' + e(soVnd(tomTatDon(d, tau, bangTreEm).tong)) + ' VND<br><small>Mã đơn ' + e(d.maDon) + '</small></div>' +
      '<div class="nut-phieu-cho"><a class="nut" href="tao-phieu.html?ma=' + encodeURIComponent(d.maDon) + '">Khách đã chuyển: tạo phiếu xác nhận</a>' +
      '<button type="button" class="nut nut-vien" data-xoa-phieu="' + e(d.maDon) + '">Xóa</button></div></div>';
  }).join('');
}

// Phần 1: phiếu gửi khách kiểm tra thông tin và quét QR chuyển khoản. Chưa phải vé, chưa có code vé.
function taoPhieuChuyenKhoanHtml(don, tau, bangTreEm, tk) {
  var e = escapeHtmlDatCho;
  var tt = tomTatDon(don, tau, bangTreEm);
  var noiDung = taoNoiDungChuyenKhoan(don);
  var anhQR = tk.anhQR ? tk.anhQR : taoAnhQR(taoChuoiVietQR(tk.maNganHang, tk.soTaiKhoan, tt.tong, noiDung));
  var dongMon = '';
  for (var i = 0; i < tt.dong.length; i++) {
    var d = tt.dong[i];
    dongMon += '<tr>' + (i === 0 ? '<td class="nhan" rowspan="' + tt.dong.length + '">Thực đơn</td>' : '') +
      '<td colspan="2">' + e(d.ten) + '</td><td class="giua">' + e(soVnd(d.gia)) + ' x ' + d.soLuong + '</td></tr>';
  }
  return '<div class="phieu phieu-gon" id="phieu" data-khong-dich><div class="phieu-noi">' +
    '<h2>PHIẾU THÔNG TIN ĐẶT VÉ VÀ CHUYỂN KHOẢN</h2>' +
    '<p class="phieu-ngay">Mã đơn <b>' + e(don.maDon) + '</b></p>' +
    '<table><tbody>' +
    '<tr><td class="nhan">Họ và tên</td><td colspan="3">' + e(don.hoTen.trim().toUpperCase()) + '</td></tr>' +
    '<tr><td class="nhan">Điện thoại</td><td colspan="3">' + e(chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai) + '</td></tr>' +
    '<tr><td class="nhan">Du thuyền</td><td colspan="3">' + e(tau.ten) + ' (' + e(TEN_LOAI_DICH_VU[don.loai]) + ')</td></tr>' +
    '<tr><td class="nhan">Ngày lên tàu</td><td colspan="3" class="do">' + e(dinhDangNgay(don.ngay)) + '</td></tr>' +
    '<tr><td class="nhan" rowspan="2">Số lượng khách</td>' +
    '<td class="giua xanh-chu">Người lớn</td><td class="giua xanh-chu">' + (don.loai === 'setMenu' ? 'Trẻ em (menu trẻ em)' : 'Trẻ em (50%)') + '</td><td class="giua xanh-chu">Trẻ em miễn phí</td></tr>' +
    '<tr><td class="giua do">' + tt.khach.nguoiLon + '</td><td class="giua do">' + tt.khach.treEm50 + '</td><td class="giua do">' + tt.khach.treEmMienPhi + '</td></tr>' +
    dongMon +
    '<tr><td class="nhan">Tổng tiền</td><td colspan="3" class="giua do">' + e(soVnd(tt.tong)) + ' VND</td></tr>' +
    '</tbody></table>' +
    '<p class="phieu-luu-y">Quý khách kiểm tra thông tin trên. Nếu đúng, xin chuyển khoản theo mã QR bên dưới; nếu sai, xin báo Ms Nguyên trước khi chuyển. Phiếu này chưa phải vé.</p>' +
    '<div class="phieu-chuyen-khoan">' + (anhQR ? '<img src="' + e(anhQR) + '" alt="Mã QR chuyển khoản">' : '') +
    '<table><tbody>' +
    '<tr><td class="nhan">Ngân hàng</td><td>' + e(tk.nganHang) + '</td></tr>' +
    '<tr><td class="nhan">Số tài khoản</td><td class="do">' + e(tk.soTaiKhoan) + '</td></tr>' +
    '<tr><td class="nhan">Chủ tài khoản</td><td>' + e(tk.chuTaiKhoan) + '</td></tr>' +
    '<tr><td class="nhan">Số tiền</td><td class="do">' + e(soVnd(tt.tong)) + ' VND</td></tr>' +
    '<tr><td class="nhan">Nội dung</td><td class="do">' + e(noiDung) + '</td></tr>' +
    '</tbody></table></div></div></div>';
}

// Tin nhắn kèm ảnh phiếu, để khách sao chép được số tài khoản và nội dung.
function soanTinChuyenKhoan(don, tau, bangTreEm, tk) {
  return [
    'Thông tin chuyển khoản đặt vé ' + tau.ten + ' ngày ' + dinhDangNgay(don.ngay) + ':',
    tk.nganHang,
    'STK: ' + tk.soTaiKhoan,
    'Chủ TK: ' + tk.chuTaiKhoan,
    'Số tiền: ' + tomTatDon(don, tau, bangTreEm).tong,
    'Nội dung: ' + taoNoiDungChuyenKhoan(don)
  ].join('\n');
}

// cheDo 'chuyen-khoan': trang phieu-chuyen-khoan.html, ra phiếu cho khách kiểm tra trước khi chuyển (không code vé).
function khoiChayTrangTaoPhieu(cheDo) {
  var laPhieuCK = cheDo === 'chuyen-khoan';
  if (typeof apDungCauHinhChung === 'function') apDungCauHinhChung('');
  var goc = document.getElementById('tao-phieu');
  var form = goc.querySelector('#form-tao-phieu');
  var el = form.elements;
  var khungMon = goc.querySelector('#khung-mon-tay');
  var oTong = goc.querySelector('#tong-tay');
  var oThongBao = goc.querySelector('#thong-bao');
  var khungPhieu = goc.querySelector('#khung-phieu');
  var khuVucPhieu = goc.querySelector('#khu-vuc-phieu');
  var maDon = taoMaDon(new Date(), Math.random);
  var ngayDatDon = ngayHomNayDiaPhuong(new Date());
  var kho = null;
  try { kho = window.localStorage; } catch (loiKho) { /* trình duyệt chặn: không có danh sách chờ */ }
  var phieuTuDanhSach = null;
  var codeTuTao = '';
  var donDaTao = null;

  el.tau.innerHTML = taoOptionTau(DANH_SACH_TAU, '');
  function tauDangChon() { return timTauTheoSlug(DANH_SACH_TAU, el.tau.value); }

  function veLoai() {
    var tau = tauDangChon();
    var theoLoai = tau ? hamHienThi.layThucDonTheoLoai(tau) : { buffet: [], setMenu: [] };
    var cu = el.loai.value;
    var html = '';
    if (theoLoai.buffet.length) html += '<option value="buffet">Buffet</option>';
    if (theoLoai.setMenu.length) html += '<option value="setMenu">Set menu</option>';
    el.loai.innerHTML = html;
    if (cu && el.loai.querySelector('option[value="' + cu + '"]')) el.loai.value = cu;
    khungMon.innerHTML = tau ? taoOChonMonTay(tau, el.loai.value) : '';
    capNhatTong();
  }

  function docDon() {
    var don = {
      slugTau: el.tau.value, ngay: el.ngay.value, loai: el.loai.value, buffetMa: '', nguoiLon: 0, treEm50: 0, treEmMienPhi: 0, mon: {},
      hoTen: el.hoTen.value, soDienThoai: el.soDienThoai.value, email: '', ghiChu: '', vat: false,
      congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: el.taiKhoan.value, maDon: maDon,
      ngayDat: ngayDatDon
    };
    var o = khungMon.querySelectorAll('[name]');
    for (var i = 0; i < o.length; i++) {
      var ten = o[i].name;
      if (ten.indexOf('mon:') === 0) {
        var so = soNguyen(o[i].value);
        if (so > 0) don.mon[ten.slice(4)] = so;
      } else if (ten === 'buffetMa') don.buffetMa = o[i].value;
      else don[ten] = soNguyen(o[i].value);
    }
    return don;
  }

  function capNhatTong() {
    var tau = tauDangChon();
    var tong = tau ? tomTatDon(docDon(), tau, GIA_TRE_EM).tong : 0;
    oTong.textContent = tong > 0 ? hamHienThi.dinhDangGia(tong) : '—';
  }

  function baoLoi(loi) {
    var cacO = goc.querySelectorAll('[data-loi]');
    var dau = null;
    for (var i = 0; i < cacO.length; i++) {
      var ten = cacO[i].getAttribute('data-loi');
      cacO[i].textContent = loi[ten] || '';
      if (loi[ten] && !dau) dau = cacO[i];
    }
    if (dau) dau.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !dau;
  }

  function thongBao(chu, lop) {
    oThongBao.textContent = chu;
    oThongBao.className = 'thong-bao' + (lop ? ' ' + lop : '');
  }

  el.tau.addEventListener('change', veLoai);
  el.loai.addEventListener('change', veLoai);
  function anPhieuCu() {
    if (!donDaTao) return;
    donDaTao = null;
    khuVucPhieu.hidden = true;
    khungPhieu.innerHTML = '';
    thongBao('Thông tin đã đổi, bấm Tạo phiếu lại.', '');
  }
  form.addEventListener('input', function () { capNhatTong(); anPhieuCu(); });
  form.addEventListener('change', anPhieuCu);
  el.ngay.min = hamLichCho.ngayHomNayVN();
  veLoai();

  function veDanhSachCho() {
    var khung = document.getElementById('ds-phieu-cho');
    if (!khung) return;
    var ds = layPhieuCho(kho);
    khung.innerHTML = ds.length ? taoDanhSachPhieuCho(ds, DANH_SACH_TAU, GIA_TRE_EM) : '<p>Chưa có phiếu nào đang chờ khách chuyển khoản.</p>';
  }
  // Mở từ danh sách chờ: điền sẵn đúng thông tin và mã đơn của phiếu đã gửi khách.
  function dienTuPhieuCho(d) {
    maDon = d.maDon;
    ngayDatDon = d.ngayDat || ngayDatDon;
    phieuTuDanhSach = d;
    el.tau.value = d.slugTau;
    veLoai();
    el.loai.value = d.loai;
    veLoai();
    el.ngay.value = d.ngay;
    el.hoTen.value = d.hoTen;
    el.soDienThoai.value = d.soDienThoai;
    el.taiKhoan.value = d.taiKhoan;
    var o = khungMon.querySelectorAll('[name]');
    for (var i = 0; i < o.length; i++) {
      var ten = o[i].name;
      if (ten.indexOf('mon:') === 0) o[i].value = (d.mon && d.mon[ten.slice(4)]) || 0;
      else if (d[ten] !== undefined) o[i].value = d[ten];
    }
    capNhatTong();
    var tau = tauDangChon();
    var lech = tau && typeof d.tongLucDat === 'number' && tomTatDon(docDon(), tau, GIA_TRE_EM).tong !== d.tongLucDat;
    thongBao(lech ? 'Bảng giá đã đổi so với lúc gửi phiếu: khách đã thấy ' + soVnd(d.tongLucDat) + ' VND. Kiểm tra đúng số tiền đã nhận trước khi tạo phiếu.' : 'Đã điền từ phiếu gửi khách, mã đơn ' + d.maDon + '. Kiểm tra tiền đã vào rồi tích ô bên dưới.', lech ? 'loi-gui' : 'da-gui');
  }
  if (laPhieuCK) {
    veDanhSachCho();
    var khungCho = document.getElementById('ds-phieu-cho');
    if (khungCho) khungCho.addEventListener('click', function (e) {
      var nutXoa = e.target.closest('[data-xoa-phieu]');
      if (!nutXoa) return;
      var ma = nutXoa.getAttribute('data-xoa-phieu');
      if (!window.confirm('Xóa phiếu ' + ma + ' khỏi danh sách chờ?')) return;
      xoaPhieuCho(ma, kho);
      veDanhSachCho();
    });
  } else {
    var thamSo = docThamSoUrl(location.search);
    if (thamSo.ma) {
      var phieuCho = timPhieuCho(thamSo.ma, kho);
      if (phieuCho && timTauTheoSlug(DANH_SACH_TAU, phieuCho.slugTau)) dienTuPhieuCho(phieuCho);
      else thongBao('Không thấy phiếu ' + thamSo.ma + ' trên máy này. Vui lòng điền thông tin bằng tay.', 'loi-gui');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var don = docDon();
    var tau = tauDangChon();
    anPhieuCu();
    if (!baoLoi(kiemTraDonTay(don, tau, GIA_TRE_EM, hamLichCho.ngayHomNayVN()))) return;
    if (laPhieuCK) {
      var tkCK = layTaiKhoan(CAU_HINH.thanhToan, don);
      khungPhieu.innerHTML = taoPhieuChuyenKhoanHtml(don, tau, GIA_TRE_EM, tkCK);
      donDaTao = don;
      don.tongLucDat = tomTatDon(don, tau, GIA_TRE_EM).tong;
      luuPhieuCho(don, kho);
      veDanhSachCho();
      var coQR = tkCK.anhQR || typeof qrcode === 'function';
      thongBao(coQR ? 'Đã tạo phiếu và đưa vào danh sách chờ. Tải ảnh phiếu gửi khách kiểm tra và chuyển khoản.' : 'Chưa tải được thư viện mã QR nên phiếu chưa có QR. Kiểm tra mạng rồi tải lại trang.', coQR ? 'da-gui' : 'loi-gui');
      khuVucPhieu.hidden = false;
      canhPhieuVuaKhung(khungPhieu);
      khuVucPhieu.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!el.daNhanTien.checked) {
      thongBao('Chỉ tạo phiếu khi đã thấy tiền vào tài khoản.', 'loi-gui');
      return;
    }
    // Ô code để trống (hoặc còn code web tự tạo lần trước): tạo code theo tàu và ngày hiện tại.
    var codeVe = el.codeVe.value.trim();
    if (!codeVe || codeVe === codeTuTao) {
      codeVe = taoCodeVe(tau, don.ngay);
      codeTuTao = codeVe;
      el.codeVe.value = codeVe;
    }
    var ngayXacNhan = new Date();
    var tk = layTaiKhoan(CAU_HINH.thanhToan, don);
    khungPhieu.innerHTML = taoPhieuHtml(don, tau, CONG_TY, LIEN_HE, GIA_TRE_EM, tk, {
      trangThai: 'Đã thanh toán.', codeVe: codeVe, ngayXacNhan: ngayXacNhan, xacThuc: null
    });
    donDaTao = don;
    // Đơn đã có phiếu xác nhận thì ra khỏi danh sách chờ.
    xoaPhieuCho(don.maDon, kho);
    thongBao('Đã tạo phiếu. Tải ảnh phiếu rồi gửi cho khách.', 'da-gui');
    khuVucPhieu.hidden = false;
    canhPhieuVuaKhung(khungPhieu);
    khuVucPhieu.scrollIntoView({ behavior: 'smooth' });
  });

  goc.addEventListener('click', function (e) {
    var nut = e.target.closest('[data-hanh-dong]');
    if (!nut) return;
    var viec = nut.getAttribute('data-hanh-dong');
    if (viec === 'in') { window.print(); return; }
    if (viec === 'phieu-moi') { location.reload(); return; }
    if (viec === 'chep-tin') {
      saoChepNoiDung(soanTinChuyenKhoan(donDaTao, tauDangChon(), GIA_TRE_EM, layTaiKhoan(CAU_HINH.thanhToan, donDaTao)), function (ok) {
        thongBao(ok ? 'Đã sao chép thông tin chuyển khoản. Dán vào Zalo để gửi khách.' : 'Không sao chép được, vui lòng thử lại.', ok ? 'da-gui' : 'loi-gui');
      });
      return;
    }
    thongBao('Đang tạo ảnh phiếu…', '');
    xuatAnhPhieu(document.getElementById('phieu')).then(function (blob) {
      taiFileVeMay(blob, (laPhieuCK ? 'phieu-thong-tin-' : 'phieu-xac-nhan-') + donDaTao.maDon + '.png');
      thongBao('Đã tải ảnh phiếu. Gửi ảnh này cho khách qua Zalo (SĐT ' + chuanHoaSoDienThoai(donDaTao.soDienThoai) + ').', 'da-gui');
    }, function () {
      thongBao('Chưa tạo được ảnh. Dùng nút “In / Lưu PDF” hoặc chụp màn hình phiếu.', 'loi-gui');
    });
  });
  window.addEventListener('resize', function () { canhPhieuVuaKhung(khungPhieu); });
  window.addEventListener('beforeprint', function () { var p = document.getElementById('phieu'); if (p) p.style.zoom = ''; });
  window.addEventListener('afterprint', function () { canhPhieuVuaKhung(khungPhieu); });

}
