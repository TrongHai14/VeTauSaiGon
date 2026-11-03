// Trang don-cua-toi.html: các đơn khách đã tạo trên máy này và trạng thái xác nhận. Tải lại trang không mất.
function khoiChayTrangDonCuaToi() {
  if (typeof apDungCauHinhChung === 'function') apDungCauHinhChung('');
  var khung = document.getElementById('danh-sach-don');
  var oTrong = document.getElementById('don-trong');
  var oTuCapNhat = document.getElementById('don-tu-cap-nhat');
  var kho = null;
  try { kho = window.localStorage; } catch (loi) { /* trình duyệt chặn: danh sách trống */ }
  var dangMo = {};
  var dangTheoDoi = {};
  var dangGui = {};
  var baoLoiGui = {};
  var daHoiMotLan = {};
  function capNhatTuSheet(ma) {
    return function (ttSheet) {
      var tt = trangThaiTuSheet(ttSheet);
      if (!tt) return;
      if (tt === 'da-tt') quenDonChoXacNhan(ma, kho);
      if (doiTrangThaiDonCuaToi(ma, tt, kho)) ve();
    };
  }
  var coOnline = !!hamLichCho.urlLichOnline();
  oTuCapNhat.hidden = !coOnline;

  function tauCua(banGhi) { return timTauTheoSlug(DANH_SACH_TAU, banGhi.don.slugTau); }

  function ve() {
    var ds = layDonCuaToi(kho).filter(tauCua);
    var html = '';
    for (var i = 0; i < ds.length; i++) {
      html += taoTheDonCuaToi(ds[i], tauCua(ds[i]), GIA_TRE_EM, CAU_HINH.thanhToan, LIEN_HE, !!dangMo[ds[i].don.maDon]);
    }
    khung.innerHTML = html;
    // Vẽ lại không làm mất trạng thái đang gửi và thông báo lỗi của từng đơn.
    ds.forEach(function (b) {
      var the = khung.querySelector('[data-ma-don="' + b.don.maDon + '"]');
      if (!the) return;
      var nut = the.querySelector('[data-viec="da-chuyen"]');
      var oBao = the.querySelector('.the-don-bao');
      if (dangGui[b.don.maDon]) {
        if (nut) nut.disabled = true;
        oBao.textContent = 'Đang gửi thông tin cho Ms Nguyên…';
      } else if (baoLoiGui[b.don.maDon]) {
        oBao.textContent = baoLoiGui[b.don.maDon];
        oBao.className = 'thong-bao the-don-bao loi-gui';
      }
    });
    oTrong.hidden = ds.length > 0;
    capNhatSoDonCuaToi();
    theoDoi(ds);
  }

  // Đơn chưa có kết quả thì hỏi định kỳ, kể cả đơn khách chưa bấm "Tôi đã chuyển khoản" mà Ms Nguyên đã xác nhận qua Zalo.
  function theoDoi(ds) {
    if (!coOnline) return;
    // Đơn đã bị xoá (kể cả ở tab khác) thì thôi hỏi.
    Object.keys(dangTheoDoi).forEach(function (ma) {
      if (!ds.some(function (b) { return b.don.maDon === ma; })) { dangTheoDoi[ma](); delete dangTheoDoi[ma]; }
    });
    var homNay = hamLichCho.ngayHomNayVN();
    ds.forEach(function (b) {
      var ma = b.don.maDon;
      if (dangTheoDoi[ma] || b.trangThai === 'da-tt' || b.don.ngay < homNay) return;
      dangTheoDoi[ma] = hamLichCho.theoDoiThanhToan(ma, capNhatTuSheet(ma));
    });
    // Đơn đã thanh toán: hỏi lại 1 lần mỗi khi mở trang, phòng khi Ms Nguyên đổi trạng thái trong Sheet.
    ds.forEach(function (b) {
      var ma = b.don.maDon;
      if (b.trangThai !== 'da-tt' || daHoiMotLan[ma] || b.don.ngay < homNay) return;
      daHoiMotLan[ma] = true;
      hamLichCho.trangThaiDonOnline(ma).then(capNhatTuSheet(ma));
    });
  }

  khung.addEventListener('change', function (e) {
    if (e.target.name !== 'taiKhoan') return;
    var banGhi = layMotDonCuaToi(e.target.closest('[data-ma-don]').getAttribute('data-ma-don'), kho);
    if (!banGhi || donDaKhoa(banGhi)) { ve(); return; }
    banGhi.don.taiKhoan = e.target.value;
    luuDonCuaToi(banGhi.don, 'chua-chuyen', kho);
    ve();
  });

  khung.addEventListener('click', function (e) {
    var nutChep = e.target.closest('[data-chep]');
    if (nutChep) {
      saoChepNoiDung(nutChep.getAttribute('data-chep'), function (ok) {
        nutChep.textContent = ok ? 'Đã chép' : 'Không chép được';
        setTimeout(function () { nutChep.textContent = 'Sao chép'; }, 1600);
      });
      return;
    }
    var nut = e.target.closest('[data-viec]');
    if (!nut) return;
    var the = nut.closest('[data-ma-don]');
    var ma = the.getAttribute('data-ma-don');
    var viec = nut.getAttribute('data-viec');
    if (viec === 'mo-tt') {
      dangMo[ma] = true;
      ve();
    } else if (viec === 'xoa') {
      if (!window.confirm('Xóa đơn ' + ma + ' khỏi danh sách trên máy này? Đơn đã gửi cho Ms Nguyên vẫn được xử lý.')) return;
      if (dangTheoDoi[ma]) { dangTheoDoi[ma](); delete dangTheoDoi[ma]; }
      xoaDonCuaToi(ma, kho);
      quenDonChoXacNhan(ma, kho);
      ve();
    } else if (viec === 'da-chuyen') {
      if (dangGui[ma]) return;
      var banGhi = layMotDonCuaToi(ma, kho);
      // Đọc lại: tab khác có thể đã báo, hoặc trang mở lâu đã qua giờ tàu chạy.
      if (!banGhi || !tauCua(banGhi) || donDaKhoa(banGhi) || !daChonTaiKhoan(banGhi.don) || lyDoKhoaThanhToan(banGhi.don, tauCua(banGhi), GIA_TRE_EM, Date.now())) { ve(); return; }
      dangGui[ma] = true;
      delete baoLoiGui[ma];
      ve();
      guiBaoDaChuyen(banGhi.don, tauCua(banGhi), GIA_TRE_EM, CAU_HINH.thanhToan).then(function (ok) {
        delete dangGui[ma];
        if (!ok) {
          baoLoiGui[ma] = 'Chưa gửi được thông tin qua email. Vui lòng bấm lại hoặc nhắn Zalo Ms Nguyên kèm mã đơn.';
          ve();
          return;
        }
        delete dangMo[ma];
        luuDonCuaToi(banGhi.don, trangThaiSauKhiBao(banGhi.don), kho);
        nhoDonChoXacNhan(ma, kho);
        ve();
      });
    }
  });

  // Tab khác vừa tạo hoặc cập nhật đơn thì vẽ lại.
  window.addEventListener('storage', function (e) { if (e.key === 'veTauSaiGon.donCuaToi') ve(); });
  ve();
}
