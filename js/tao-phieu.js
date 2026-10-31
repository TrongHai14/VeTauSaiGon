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

// Phiếu gửi riêng cho khách TRƯỚC khi chuyển khoản: khách kiểm tra thông tin, đúng thì chuyển. Chưa phải vé.
function taoPhieuChuyenKhoanHtml(don, tau, congTy, lienHe, bangTreEm, tk) {
  var e = escapeHtmlDatCho;
  var tt = tomTatDon(don, tau, bangTreEm);
  var noiDung = taoNoiDungChuyenKhoan(don);
  var dongMon = '';
  for (var i = 0; i < tt.dong.length; i++) {
    var d = tt.dong[i];
    dongMon += '<tr>' + (i === 0 ? '<td class="nhan" rowspan="' + tt.dong.length + '">Thực đơn</td>' : '') +
      '<td colspan="2" class="giua">' + e(d.ten.toUpperCase()) + '</td><td>' + e(soVnd(d.gia)) + ' x ' + d.soLuong + '</td></tr>';
  }
  return '<div class="phieu" id="phieu" data-khong-dich><div class="phieu-goc"></div><div class="phieu-noi">' +
    '<div class="phieu-dau">' + taoAnhLogo('', 'phieu-logo') +
    '<div class="phieu-cong-ty"><strong>' + e(congTy.ten) + '</strong>' +
    '<p>MST: ' + e(congTy.mst) + ' – ' + e(congTy.vaiTro) + '</p>' +
    '<p>Hỗ trợ dịch vụ: ' + e(lienHe.tenNguoiLienHe) + ' ' + e(lienHe.soDienThoai) + '</p></div></div>' +
    '<h2>PHIẾU THÔNG TIN ĐẶT VÉ VÀ CHUYỂN KHOẢN<br>' + e(tau.ten.toUpperCase()) + '</h2>' +
    '<p class="phieu-ngay">Mã đơn <b>' + e(don.maDon) + '</b></p>' +
    '<p class="phieu-luu-y">Quý khách vui lòng kiểm tra thông tin bên dưới. Nếu đúng, quý khách chuyển khoản theo mục 2; nếu có sai sót, xin báo Ms Nguyên trước khi chuyển.</p>' +
    '<h3>1. Thông tin đặt vé:</h3><table><tbody>' +
    '<tr><td class="nhan">Họ và tên:</td><td colspan="3">' + e(don.hoTen.trim().toUpperCase()) + '</td></tr>' +
    '<tr><td class="nhan">Điện thoại liên hệ:</td><td colspan="3">' + e(chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai) + '</td></tr>' +
    '<tr><td class="nhan">Du thuyền:</td><td colspan="3">' + e(tau.ten) + ' (' + e(TEN_LOAI_DICH_VU[don.loai]) + ')</td></tr>' +
    '<tr><td class="nhan">Ngày đi:</td><td colspan="3" class="do">' + e(dinhDangNgay(don.ngay)) + '</td></tr>' +
    '<tr><td class="nhan" rowspan="2">Số lượng khách:</td>' +
    '<td class="giua xanh-chu">Người lớn</td><td class="giua xanh-chu">' + (don.loai === 'setMenu' ? 'Trẻ em (menu trẻ em)' : 'Trẻ em (50%)') + '</td><td class="giua xanh-chu">Trẻ em miễn phí</td></tr>' +
    '<tr><td class="giua do">' + tt.khach.nguoiLon + '</td><td class="giua do">' + tt.khach.treEm50 + '</td><td class="giua do">' + tt.khach.treEmMienPhi + '</td></tr>' +
    dongMon +
    '<tr><td class="nhan">Tổng thanh toán</td><td colspan="3" class="giua do">' + e(soVnd(tt.tong)) + ' VND</td></tr>' +
    '</tbody></table>' +
    '<h3>2. Thông tin chuyển khoản:</h3>' +
    '<table><tbody>' +
    '<tr><td class="nhan">Ngân hàng</td><td>' + e(tk.nganHang) + '</td></tr>' +
    '<tr><td class="nhan">Số tài khoản</td><td class="do">' + e(tk.soTaiKhoan) + '</td></tr>' +
    '<tr><td class="nhan">Chủ tài khoản</td><td>' + e(tk.chuTaiKhoan) + '</td></tr>' +
    '<tr><td class="nhan">Số tiền</td><td class="do">' + e(soVnd(tt.tong)) + ' VND</td></tr>' +
    '<tr><td class="nhan">Nội dung</td><td class="do">' + e(noiDung) + '</td></tr>' +
    '</tbody></table>' +
    '<p class="phieu-luu-y">Phiếu này chưa phải vé. Sau khi nhận đủ tiền, Ms Nguyên sẽ gửi phiếu xác nhận và code vé điện tử qua Zalo. Chỗ trên tàu do Ms Nguyên xác nhận với tàu sau khi quý khách thanh toán; nếu tàu hết chỗ ngày đã chọn, Nguyên Nguyên Travel hoàn 100% số tiền hoặc đổi sang ngày khác theo lựa chọn của quý khách.</p>' +
    '</div>' + taoPhoDem() + '</div>';
}

// Tin nhắn kèm ảnh phiếu, để khách sao chép được số tài khoản và nội dung.
function soanTinChuyenKhoan(don, tau, bangTreEm, tk) {
  var tt = tomTatDon(don, tau, bangTreEm);
  return [
    'Nguyên Nguyên Travel gửi quý khách thông tin đặt vé. Quý khách kiểm tra giúp, nếu đúng thì chuyển khoản; nếu sai xin báo lại Ms Nguyên trước khi chuyển.',
    '- Mã đơn: ' + don.maDon,
    '- Khách: ' + don.hoTen.trim() + ' – ' + (chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai),
    '- Tàu: ' + tau.ten + ' (' + TEN_LOAI_DICH_VU[don.loai] + ')',
    '- Ngày đi: ' + dinhDangNgay(don.ngay)
  ].concat(tt.dong.map(function (d) { return '- ' + d.ten + ': ' + soVnd(d.gia) + ' x ' + d.soLuong; }), tt.khach.treEmMienPhi > 0 ? ['- Trẻ em miễn phí: ' + tt.khach.treEmMienPhi] : [], [
    '- Tổng: ' + soVnd(tt.tong) + ' VND',
    '',
    'Chuyển khoản:',
    tk.nganHang,
    'STK: ' + tk.soTaiKhoan,
    'Chủ TK: ' + tk.chuTaiKhoan,
    'Số tiền: ' + tt.tong,
    'Nội dung: ' + taoNoiDungChuyenKhoan(don)
  ]).join('\n');
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
      ngayDat: ngayHomNayDiaPhuong(new Date())
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var don = docDon();
    var tau = tauDangChon();
    anPhieuCu();
    if (!baoLoi(kiemTraDonTay(don, tau, GIA_TRE_EM, hamLichCho.ngayHomNayVN()))) return;
    if (laPhieuCK) {
      khungPhieu.innerHTML = taoPhieuChuyenKhoanHtml(don, tau, CONG_TY, LIEN_HE, GIA_TRE_EM, layTaiKhoan(CAU_HINH.thanhToan, don));
      donDaTao = don;
      thongBao('Đã tạo phiếu. Tải ảnh phiếu và sao chép tin nhắn rồi gửi cho khách.', 'da-gui');
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
        thongBao(ok ? 'Đã sao chép tin nhắn. Dán vào Zalo rồi gửi kèm ảnh phiếu.' : 'Không sao chép được, vui lòng thử lại.', ok ? 'da-gui' : 'loi-gui');
      });
      return;
    }
    thongBao('Đang tạo ảnh phiếu…', '');
    xuatAnhPhieu(document.getElementById('phieu')).then(function (blob) {
      taiFileVeMay(blob, (laPhieuCK ? 'phieu-chuyen-khoan-' : 'phieu-xac-nhan-') + donDaTao.maDon + '.png');
      thongBao('Đã tải ảnh phiếu. Gửi ảnh này cho khách qua Zalo (SĐT ' + chuanHoaSoDienThoai(donDaTao.soDienThoai) + ').', 'da-gui');
    }, function () {
      thongBao('Chưa tạo được ảnh. Dùng nút “In / Lưu PDF” hoặc chụp màn hình phiếu.', 'loi-gui');
    });
  });
  window.addEventListener('resize', function () { canhPhieuVuaKhung(khungPhieu); });
  window.addEventListener('beforeprint', function () { var p = document.getElementById('phieu'); if (p) p.style.zoom = ''; });
  window.addEventListener('afterprint', function () { canhPhieuVuaKhung(khungPhieu); });

}
