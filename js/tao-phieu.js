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

function khoiChayTrangTaoPhieu() {
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
    thongBao('Đang tạo ảnh phiếu…', '');
    xuatAnhPhieu(document.getElementById('phieu')).then(function (blob) {
      taiFileVeMay(blob, 'phieu-xac-nhan-' + donDaTao.maDon + '.png');
      thongBao('Đã tải ảnh phiếu. Gửi ảnh này cho khách qua Zalo (SĐT ' + chuanHoaSoDienThoai(donDaTao.soDienThoai) + ').', 'da-gui');
    }, function () {
      thongBao('Chưa tạo được ảnh. Dùng nút “In / Lưu PDF” hoặc chụp màn hình phiếu.', 'loi-gui');
    });
  });
  window.addEventListener('resize', function () { canhPhieuVuaKhung(khungPhieu); });
  window.addEventListener('beforeprint', function () { var p = document.getElementById('phieu'); if (p) p.style.zoom = ''; });
  window.addEventListener('afterprint', function () { canhPhieuVuaKhung(khungPhieu); });

}
