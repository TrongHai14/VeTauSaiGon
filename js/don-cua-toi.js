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
    oTrong.hidden = ds.length > 0;
    capNhatSoDonCuaToi();
    theoDoi(ds);
  }

  // Đơn chưa có kết quả thì hỏi định kỳ, kể cả đơn khách chưa bấm "Tôi đã chuyển khoản" mà Ms Nguyên đã xác nhận qua Zalo.
  function theoDoi(ds) {
    if (!coOnline) return;
    ds.forEach(function (b) {
      var ma = b.don.maDon;
      if (dangTheoDoi[ma] || b.trangThai === 'da-tt') return;
      dangTheoDoi[ma] = hamLichCho.theoDoiThanhToan(ma, function (tt) {
        if (tt === 'da-tt') quenDonChoXacNhan(ma, kho);
        doiTrangThaiDonCuaToi(ma, tt, kho);
        ve();
      });
    });
  }

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
      var banGhi = layDonCuaToi(kho).filter(function (b) { return b.don.maDon === ma; })[0];
      if (!banGhi || !tauCua(banGhi)) return;
      dangGui[ma] = true;
      nut.disabled = true;
      var oBao = the.querySelector('.the-don-bao');
      oBao.textContent = 'Đang gửi thông tin cho Ms Nguyên…';
      guiBaoDaChuyen(banGhi.don, tauCua(banGhi), GIA_TRE_EM, CAU_HINH.thanhToan).then(function (ok) {
        delete dangGui[ma];
        if (!ok) {
          nut.disabled = false;
          oBao.textContent = 'Chưa gửi được thông tin qua email. Vui lòng bấm lại hoặc nhắn Zalo Ms Nguyên kèm mã đơn.';
          oBao.className = 'thong-bao the-don-bao loi-gui';
          return;
        }
        delete dangMo[ma];
        luuDonCuaToi(banGhi.don, 'cho', kho);
        nhoDonChoXacNhan(ma, kho);
        ve();
      });
    }
  });

  // Tab khác vừa tạo hoặc cập nhật đơn thì vẽ lại.
  window.addEventListener('storage', function (e) { if (e.key === 'veTauSaiGon.donCuaToi') ve(); });
  ve();
}
