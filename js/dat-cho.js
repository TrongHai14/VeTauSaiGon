// Trang đặt chỗ: chọn dịch vụ → thông tin liên hệ → thanh toán chuyển khoản.
// Phiếu "Đã thanh toán" KHÔNG hiện cho khách ở đây; Ms Nguyên tạo phiếu ở xac-nhan.html sau khi kiểm tra tiền đã vào.
var hamHienThi = (typeof escapeHtml === 'function')
  ? {
    escapeHtml: escapeHtml, dinhDangGia: dinhDangGia, layNhomThucDon: layNhomThucDon,
    layThucDonTheoLoai: layThucDonTheoLoai, icon: icon, taoAnh: taoAnh, layAnhDaiDien: layAnhDaiDien,
    layNhomCon: layNhomCon, taoChipNhomCon: taoChipNhomCon, locNhomCon: locNhomCon
  }
  : require('./hien-thi.js');
var escapeHtmlDatCho = hamHienThi.escapeHtml;
// Lịch còn chỗ (js/lich-cho.js): trên trình duyệt là hàm toàn cục, khi chạy test thì require.
var hamLichCho = (typeof trangThaiNgay === 'function')
  ? {
    trangThaiNgay: trangThaiNgay, ganLichCho: ganLichCho, ngayHomNayVN: ngayHomNayVN,
    giuChoOnline: typeof giuChoOnline === 'function' ? giuChoOnline : function () { return Promise.resolve({ ok: false, loi: 'chua-cai' }); },
    urlLichOnline: typeof urlLichOnline === 'function' ? urlLichOnline : function () { return ''; },
    theoDoiThanhToan: typeof theoDoiThanhToan === 'function' ? theoDoiThanhToan : function () { return function () {}; }
  }
  : (typeof require === 'function' ? require('./lich-cho.js')
    // Trang nào chưa nạp lich-cho.js: coi mọi ngày còn chỗ, không có lịch (ô ngày trở lại ô chọn ngày thường).
    : {
      trangThaiNgay: function () { return 'con'; },
      ganLichCho: function () { return null; },
      ngayHomNayVN: function () { return ngayHomNayDiaPhuong(new Date()); },
      giuChoOnline: function () { return Promise.resolve({ ok: false, loi: 'chua-cai' }); },
      urlLichOnline: function () { return ''; },
      theoDoiThanhToan: function () { return function () {}; }
    });
if (typeof kyVe !== 'function' && typeof module !== 'undefined') {
  var hamXacThuc = require('./xac-thuc.js');
  var kyVe = hamXacThuc.kyVe;
  var kiemTraVe = hamXacThuc.kiemTraVe;
  var kiemTraKhoaTruocKhiKy = hamXacThuc.kiemTraKhoaTruocKhiKy;
}

var TEN_LOAI_DICH_VU = { buffet: 'Buffet', setMenu: 'Set menu' };
// Địa chỉ nhận email đặt chỗ (FormSubmit). Sau này có thể thay bằng mã FormSubmit do họ cấp.
var DIA_CHI_NHAN_EMAIL = 'bookingindochinaqueen@gmail.com';
var URL_FORMSUBMIT = 'https://formsubmit.co/ajax/' + DIA_CHI_NHAN_EMAIL;

/* ---------- Hàm thuần (test được bằng Node) ---------- */

// Bỏ khoảng trắng, dấu chấm, gạch ngang; '+84' hoặc '84' ở đầu đổi thành '0'.
function chuanHoaSoDienThoai(chuoi) {
  if (typeof chuoi !== 'string') return null;
  var so = chuoi.replace(/[\s.\-]/g, '');
  if (so.indexOf('+84') === 0) so = '0' + so.slice(3);
  else if (so.indexOf('84') === 0) so = '0' + so.slice(2);
  return /^0\d{9}$/.test(so) ? so : null;
}

function laEmail(chuoi) {
  return typeof chuoi === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chuoi.trim());
}

// MST Việt Nam: 10 số, hoặc 10 số + '-' + 3 số (chi nhánh).
function laMaSoThue(chuoi) {
  return typeof chuoi === 'string' && /^\d{10}(-\d{3})?$/.test(chuoi.replace(/\s/g, ''));
}

function timTauTheoSlug(danhSachTau, slug) {
  for (var i = 0; i < danhSachTau.length; i++) {
    if (danhSachTau[i].slug === slug) return danhSachTau[i];
  }
  return null;
}

function laNgayCoThat(iso) {
  var kq = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!kq) return false;
  var nam = Number(kq[1]), thang = Number(kq[2]), ngay = Number(kq[3]);
  var d = new Date(Date.UTC(nam, thang - 1, ngay));
  return d.getUTCFullYear() === nam && d.getUTCMonth() === thang - 1 && d.getUTCDate() === ngay;
}

// Số nguyên không âm; chuỗi có ký tự lạ ('2abc', '-1', '1.5') tính là 0.
function soNguyen(giaTri) {
  var chuoi = String(giaTri === null || giaTri === undefined ? '' : giaTri).trim();
  return /^\d+$/.test(chuoi) ? parseInt(chuoi, 10) : 0;
}

function dinhDangNgay(iso) {
  var phan = String(iso).split('-');
  return phan[2] + '/' + phan[1] + '/' + phan[0];
}

// 'YYYY-MM-DD' theo giờ máy (không dùng toISOString vì lệch UTC).
function ngayHomNayDiaPhuong(date) {
  var thang = date.getMonth() + 1;
  var ngay = date.getDate();
  return date.getFullYear() + '-' + (thang < 10 ? '0' : '') + thang + '-' + (ngay < 10 ? '0' : '') + ngay;
}

function soVnd(so) {
  return String(so).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Chính sách ô đếm trẻ em của tàu cho loại dịch vụ; null nếu không có.
function layGiaTreEm(bangTreEm, slug, loai) {
  var theoTau = bangTreEm && bangTreEm[slug];
  return (theoTau && theoTau[loai]) || null;
}

// Tìm món theo mã trong đúng loại dịch vụ.
function timMon(tau, loai, ma) {
  var theoLoai = hamHienThi.layThucDonTheoLoai(tau);
  var nhom = theoLoai[loai] || [];
  for (var i = 0; i < nhom.length; i++) {
    for (var j = 0; j < nhom[i].dong.length; j++) {
      if (nhom[i].dong[j].ma === ma) return { nhom: nhom[i].tieuDe, dong: nhom[i].dong[j] };
    }
  }
  return null;
}

// Các dòng tính tiền của đơn.
// Buffet: 1 hạng (don.buffetMa) × người lớn, cộng trẻ 50% nếu tàu có chính sách 50%.
// Set menu: mỗi món × số suất (don.mon[ma]).
function layDongDon(tau, don, bangTreEm) {
  var dong = [];
  if (!tau) return dong;
  if (don.loai === 'buffet') {
    var hang = timMon(tau, 'buffet', don.buffetMa);
    if (!hang) return dong;
    var tenHang = hang.nhom + (hang.dong.ten !== hang.nhom ? ' – ' + hang.dong.ten : '');
    var nguoiLon = soNguyen(don.nguoiLon);
    if (nguoiLon > 0) {
      dong.push({ ten: tenHang + ' (người lớn)', gia: hang.dong.gia, soLuong: nguoiLon, thanhTien: hang.dong.gia * nguoiLon });
    }
    var pb = phanBoTreBuffet(don, layChinhSachTre(bangTreEm, tau.slug, 'buffet'));
    var giaTre = Math.round(hang.dong.gia / 2);
    if (pb.tre50 > 0) {
      dong.push({ ten: tenHang + ' (trẻ em 50%)', gia: giaTre, soLuong: pb.tre50, thanhTien: giaTre * pb.tre50 });
    }
    if (pb.tre50Vuot > 0) {
      dong.push({ ten: tenHang + ' (trẻ 1m–1,3m thứ 2 trở đi, tính như người lớn)', gia: hang.dong.gia, soLuong: pb.tre50Vuot, thanhTien: hang.dong.gia * pb.tre50Vuot });
    }
    if (pb.mienPhiVuot > 0) {
      dong.push({ ten: tenHang + ' (bé thứ 2 trở đi, vé trẻ em)', gia: giaTre, soLuong: pb.mienPhiVuot, thanhTien: giaTre * pb.mienPhiVuot });
    }
  } else if (don.loai === 'setMenu') {
    var nhom = hamHienThi.layThucDonTheoLoai(tau).setMenu;
    for (var i = 0; i < nhom.length; i++) {
      for (var j = 0; j < nhom[i].dong.length; j++) {
        var mon = nhom[i].dong[j];
        var sl = soNguyen(don.mon && don.mon[mon.ma]);
        if (sl === 0) continue;
        dong.push({
          ten: (nhom[i].tieuDe !== 'Set menu' ? nhom[i].tieuDe + ' – ' : 'Set menu ') + mon.ten,
          gia: mon.gia, soLuong: sl, thanhTien: mon.gia * sl
        });
      }
    }
  }
  return dong;
}

// Quy định chung: 2 người lớn kèm 1 trẻ em (ít nhất 1 bé cho đoàn có người lớn).
function soTreToiDa(nguoiLon) {
  return nguoiLon > 0 ? Math.max(1, Math.floor(nguoiLon / 2)) : 0;
}

// Buffet: số bé miễn phí vượt quá giới hạn chung (bé thứ 2 trở đi phải mua vé trẻ em).
function soBeMienPhiVuot(don) {
  if (don.loai !== 'buffet') return 0;
  return Math.max(0, soNguyen(don.treEmMienPhi) - soTreToiDa(soNguyen(don.nguoiLon)));
}

// Chính sách trẻ em của tàu theo loại, lấy từ bảng truyền vào hoặc GIA_TRE_EM toàn cục.
function layChinhSachTre(bangTreEm, slug, loai) {
  var bang = bangTreEm || (typeof GIA_TRE_EM !== 'undefined' ? GIA_TRE_EM : require('./du-lieu-tau.js').GIA_TRE_EM);
  return layGiaTreEm(bang, slug, loai) || {};
}

// Buffet: chia trẻ em thành nhóm tính tiền. Dùng chung cho tính tiền (layDongDon) và đếm khách (demKhach).
// - Bé miễn phí vượt giới hạn: tính vé trẻ em 50% nếu tàu có giá 50%.
// - Trẻ 50% vượt giới hạn: tính như người lớn nếu tàu có cờ treEm50VuotTinhNguoiLon (Queen).
function phanBoTreBuffet(don, chinhSach) {
  var nguoiLon = soNguyen(don.nguoiLon);
  var gioiHan = soTreToiDa(nguoiLon);
  var tre50 = soNguyen(don.treEm50);
  var mienPhi = soNguyen(don.treEmMienPhi);
  var tre50Vuot = chinhSach.treEm50VuotTinhNguoiLon ? Math.max(0, tre50 - gioiHan) : 0;
  var mienPhiVuot = chinhSach.nuaGia ? Math.max(0, mienPhi - gioiHan) : 0;
  return {
    nguoiLon: nguoiLon, gioiHan: gioiHan,
    tre50: chinhSach.nuaGia ? tre50 - tre50Vuot : 0, tre50Vuot: tre50Vuot,
    mienPhi: mienPhi - mienPhiVuot, mienPhiVuot: mienPhiVuot
  };
}

// Cảnh báo khi số bé miễn phí vượt giới hạn của tàu mà chưa được tính tiền tự động; null nếu hợp lệ.
// Buffet có giá 50% thì bé vượt đã được tính vé trẻ em nên không cảnh báo. Suất menu trẻ em đã trả tiền không tính.
function canhBaoTreEm(don, tau, bangTreEm) {
  if (!tau || (don.loai !== 'buffet' && don.loai !== 'setMenu')) return null;
  var cs = layChinhSachTre(bangTreEm, tau.slug, don.loai);
  var khach = demKhach(don, tau, bangTreEm);
  if (khach.nguoiLon === 0) return null;
  var gioiHan = cs.beMienPhiMoiNguoiLon ? khach.nguoiLon * cs.beMienPhiMoiNguoiLon : soTreToiDa(khach.nguoiLon);
  if (cs.canhBaoTongTre) {
    // Tàu tính giới hạn trên TỔNG số trẻ (trẻ mua vé + bé miễn phí), ví dụ Indochina Queen.
    var tongTre = khach.treEm50 + khach.treEmMienPhi;
    if (tongTre <= gioiHan) return null;
    return 'Theo quy định của tàu, 2 người lớn chỉ được kèm 1 trẻ em. Đơn có ' + tongTre + ' trẻ em cho ' + khach.nguoiLon +
      ' người lớn, Ms Nguyên sẽ thông báo lại phụ phí bổ sung (nếu có).';
  }
  if (khach.treEmMienPhi <= gioiHan) return null;
  if (cs.phuThuBeVuot) {
    // Tàu có mức phụ thu cố định cho bé vượt (ví dụ 2 tàu Princess: 100.000 VND/bé).
    return 'Theo quy định của tàu, ' + khach.nguoiLon + ' người lớn chỉ được kèm tối đa ' + gioiHan + ' bé miễn phí. Đơn có ' +
      khach.treEmMienPhi + ' bé, ' + (khach.treEmMienPhi - gioiHan) + ' bé vượt phụ thu ' + hamHienThi.dinhDangGia(cs.phuThuBeVuot) + '/bé.';
  }
  return 'Theo quy định của tàu, ' + khach.nguoiLon + ' người lớn chỉ được kèm tối đa ' + gioiHan +
    ' bé miễn phí. Đơn có ' + khach.treEmMienPhi + ' bé, Ms Nguyên sẽ thông báo lại phụ phí bổ sung (nếu có).';
}

function tinhTongDon(dong) {
  var tong = 0;
  for (var i = 0; i < dong.length; i++) tong += dong[i].thanhTien;
  return tong;
}

function demKhach(don, tau, bangTreEm) {
  var tenMonTheoMa = {};
  if (tau && don.loai === 'setMenu') {
    var nhomSet = hamHienThi.layThucDonTheoLoai(tau).setMenu;
    for (var i = 0; i < nhomSet.length; i++) {
      for (var j = 0; j < nhomSet[i].dong.length; j++) tenMonTheoMa[nhomSet[i].dong[j].ma] = nhomSet[i].dong[j].ten;
    }
  }
  if (don.loai === 'buffet') {
    // Cột trên phiếu theo cách tính tiền: trẻ tính như người lớn vào cột người lớn, bé vượt tính 50% vào cột trẻ 50%.
    var pb = phanBoTreBuffet(don, tau ? layChinhSachTre(bangTreEm, tau.slug, 'buffet') : {});
    return { nguoiLon: pb.nguoiLon + pb.tre50Vuot, treEm50: pb.tre50 + pb.mienPhiVuot, treEmMienPhi: pb.mienPhi };
  }
  // Set menu: suất có chữ "Trẻ em" trong tên (Donald, Pluto, Menu Trẻ em) tính là trẻ em dùng menu trẻ em.
  var nguoiLon = 0;
  var treEm = 0;
  for (var ma in (don.mon || {})) {
    var sl = soNguyen(don.mon[ma]);
    if (sl === 0) continue;
    if (/Trẻ em/.test(tenMonTheoMa[ma] || '')) treEm += sl;
    else nguoiLon += sl;
  }
  return { nguoiLon: nguoiLon, treEm50: treEm, treEmMienPhi: soNguyen(don.treEmMienPhi) };
}

function kiemTraBuoc1(don, danhSachTau, homNay) {
  var loi = {};
  var tau = timTauTheoSlug(danhSachTau, don.slugTau);
  if (!tau) loi.slugTau = 'Vui lòng chọn du thuyền.';
  if (typeof don.ngay !== 'string' || !laNgayCoThat(don.ngay) || don.ngay < homNay) loi.ngay = 'Vui lòng chọn ngày từ hôm nay trở đi.';
  else if (tau && hamLichCho.trangThaiNgay(tau.slug, don.ngay, homNay) === 'het') loi.ngay = 'Ngày này tàu đã hết chỗ, vui lòng chọn ngày khác.';
  if (tau) {
    var theoLoai = hamHienThi.layThucDonTheoLoai(tau);
    if (don.loai !== 'buffet' && don.loai !== 'setMenu') loi.loai = 'Vui lòng chọn Buffet hoặc Set menu.';
    else if (theoLoai[don.loai].length === 0) loi.loai = 'Tàu chưa có danh sách ' + TEN_LOAI_DICH_VU[don.loai] + ' để đặt online, vui lòng nhắn Zalo.';
    else if (don.loai === 'buffet') {
      if (!timMon(tau, 'buffet', don.buffetMa)) loi.mon = 'Vui lòng chọn hạng buffet.';
      else if (soNguyen(don.nguoiLon) < 1) loi.mon = 'Ít nhất 1 người lớn.';
    } else if (layDongDon(tau, don, null).length === 0) {
      loi.mon = 'Vui lòng chọn ít nhất 1 suất set menu.';
    }
  }
  return { hopLe: Object.keys(loi).length === 0, loi: loi };
}

function kiemTraBuoc2(don) {
  var loi = {};
  var hoTen = typeof don.hoTen === 'string' ? don.hoTen.trim() : '';
  if (hoTen.length < 1 || hoTen.length > 100) loi.hoTen = 'Vui lòng nhập họ tên.';
  if (chuanHoaSoDienThoai(don.soDienThoai) === null) loi.soDienThoai = 'Số điện thoại không hợp lệ.';
  if (!don.dongY) loi.dongY = 'Vui lòng đồng ý điều kiện vé và chính sách.';
  if (don.vat) {
    var ct = don.congTy || {};
    if (!ct.ten || !ct.ten.trim()) loi.congTyTen = 'Vui lòng nhập tên công ty.';
    if (!laMaSoThue(ct.mst || '')) loi.congTyMst = 'Mã số thuế gồm 10 số (hoặc 10 số-3 số).';
    if (!ct.diaChi || !ct.diaChi.trim()) loi.congTyDiaChi = 'Vui lòng nhập địa chỉ công ty.';
    if (!laEmail(ct.email || '')) loi.congTyEmail = 'Vui lòng nhập email nhận hóa đơn.';
  }
  return { hopLe: Object.keys(loi).length === 0, loi: loi };
}

// Mã đơn: VT + yymmdd + 4 ký tự (bỏ các ký tự dễ nhầm 0/O, 1/I).
function taoMaDon(date, ngauNhien) {
  var kyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var duoi = '';
  for (var i = 0; i < 4; i++) duoi += kyTu.charAt(Math.floor(ngauNhien() * kyTu.length) % kyTu.length);
  var hai = function (n) { return (n < 10 ? '0' : '') + n; };
  return 'VT' + hai(date.getFullYear() % 100) + hai(date.getMonth() + 1) + hai(date.getDate()) + duoi;
}

// Dòng nhắc đổi trả ở ô đồng ý: chỉ tàu có chính sách đổi trả (Queen, Star) mới hiện.
function loiNhacDoiTra(slug) {
  var ds = typeof CHINH_SACH_CHUNG !== 'undefined' ? CHINH_SACH_CHUNG : require('./du-lieu-tau.js').CHINH_SACH_CHUNG;
  for (var i = 0; i < ds.length; i++) {
    if (ds[i].id === 'doi-tra') {
      return ds[i].chiApDung && ds[i].chiApDung.indexOf(slug) !== -1 ? 'Không hoàn/hủy vé trong ngày sử dụng. Đổi ngày cần báo trước 2–3 ngày.' : '';
    }
  }
  return '';
}

// Nhớ các đơn đang chờ xác nhận trên máy khách, để mở lại trang vẫn thấy kết quả (7 ngày, tối đa 5 đơn mới nhất).
var KHOA_DON_CHO_XAC_NHAN = 'veTauSaiGon.donChoXacNhan';
var HAN_NHO_DON_CHO = 7 * 24 * 3600 * 1000;
var SO_DON_NHO_TOI_DA = 5;
function docDonCho(kho) {
  var ds = JSON.parse(kho.getItem(KHOA_DON_CHO_XAC_NHAN));
  if (!Array.isArray(ds)) return [];
  return ds.filter(function (d) { return d && laMaDon(d.maDon) && Date.now() - d.luc < HAN_NHO_DON_CHO; });
}
function nhoDonChoXacNhan(maDon, kho) {
  try {
    var ds = docDonCho(kho).filter(function (d) { return d.maDon !== maDon; });
    ds.push({ maDon: maDon, luc: Date.now() });
    kho.setItem(KHOA_DON_CHO_XAC_NHAN, JSON.stringify(ds.slice(-SO_DON_NHO_TOI_DA)));
  } catch (loi) { /* bỏ qua */ }
}
function layDonChoXacNhan(kho) {
  try {
    return docDonCho(kho).map(function (d) { return d.maDon; });
  } catch (loi) { return []; }
}
function quenDonChoXacNhan(maDon, kho) {
  try {
    kho.setItem(KHOA_DON_CHO_XAC_NHAN, JSON.stringify(docDonCho(kho).filter(function (d) { return d.maDon !== maDon; })));
  } catch (loi) { /* bỏ qua */ }
}
// Đổi màn hình bước 4 theo kết quả ('da-tt' hoặc 'huy'); đơn hủy nhầm rồi xác nhận lại thì đổi sang thành công.
function hienKetQuaThanhToan(goc, tt, maDon) {
  var xongTT = goc.querySelector('#da-thanh-toan'), huy = goc.querySelector('#don-da-huy');
  if (!xongTT || !huy) return;
  goc.querySelector('#cho-xac-nhan').hidden = true;
  goc.querySelector('#nhac-zalo').hidden = true;
  goc.querySelector('#ma-don-xong').textContent = maDon;
  xongTT.hidden = tt !== 'da-tt';
  huy.hidden = tt !== 'huy';
}

function soChoCuaDon(don, tau, bangTreEm) {
  var khach = tomTatDon(don, tau, bangTreEm).khach;
  return { nguoiLon: khach.nguoiLon, treEm: khach.treEm50, beMienPhi: khach.treEmMienPhi, tong: khach.nguoiLon + khach.treEm50 };
}

// Lời nhắn hạn giữ chỗ ở bước thanh toán. giuDen: chuỗi ISO từ Web App.
function taoLoiNhanGiuCho(giuDen) {
  var d = new Date(giuDen);
  if (!giuDen || isNaN(d.getTime())) return '';
  var vn = new Date(d.getTime() + 7 * 3600 * 1000);
  var hai2 = function (n) { return (n < 10 ? '0' : '') + n; };
  return '<p class="giu-cho">Đã giữ chỗ cho quý khách đến <b>' + hai2(vn.getUTCHours()) + ':' + hai2(vn.getUTCMinutes()) + ' ngày ' +
    hai2(vn.getUTCDate()) + '/' + hai2(vn.getUTCMonth() + 1) + '/' + vn.getUTCFullYear() +
    '</b>. Vui lòng chuyển khoản và bấm “Tôi đã chuyển khoản” trước thời hạn này; quá hạn, chỗ sẽ tự trả lại cho khách khác.</p>';
}

function laMaDon(ma) {
  return /^VT\d{6}[A-Z0-9]{4}$/.test(String(ma || ''));
}

// Nội dung chuyển khoản: không dấu, không ký tự đặc biệt để ngân hàng nào cũng nhận.
function taoNoiDungChuyenKhoan(don) {
  return (don.maDon + ' ' + (chuanHoaSoDienThoai(don.soDienThoai) || '')).trim();
}

function layTaiKhoan(cauHinhThanhToan, don) {
  return cauHinhThanhToan[don.vat ? 'congTy' : (don.taiKhoan === 'congTy' ? 'congTy' : 'caNhan')];
}

// Ảnh QR VietQR có sẵn số tiền và nội dung (dịch vụ img.vietqr.io).
function taoLinkVietQR(taiKhoan, soTien, noiDung) {
  return 'https://img.vietqr.io/image/' + encodeURIComponent(taiKhoan.maNganHang) + '-' + encodeURIComponent(taiKhoan.soTaiKhoan) +
    '-compact2.png?amount=' + soTien + '&addInfo=' + encodeURIComponent(noiDung) +
    '&accountName=' + encodeURIComponent(taiKhoan.chuTaiKhoan);
}

function tomTatDon(don, tau, bangTreEm) {
  var dong = layDongDon(tau, don, bangTreEm);
  return { dong: dong, tong: tinhTongDon(dong), khach: demKhach(don, tau, bangTreEm) };
}

// Khách đang xem web bằng tiếng Anh không (nút EN). Báo cho Ms Nguyên để trả lời bằng tiếng Anh.
function laKhachTiengAnh() {
  return typeof layNgonNgu === 'function' && layNgonNgu() === 'en';
}

function soanTinNhanDatCho(don, tau, bangTreEm, taiKhoan) {
  var tt = tomTatDon(don, tau, bangTreEm);
  var dong = [
    'Xin chào Ms Nguyên, tôi đã chuyển khoản đặt chỗ du thuyền:',
    '- Mã đơn: ' + don.maDon,
    '- Tàu: ' + tau.ten + ' (' + TEN_LOAI_DICH_VU[don.loai] + ')',
    '- Ngày lên tàu: ' + dinhDangNgay(don.ngay)
  ];
  for (var i = 0; i < tt.dong.length; i++) {
    dong.push('- ' + tt.dong[i].ten + ': ' + soVnd(tt.dong[i].gia) + ' x ' + tt.dong[i].soLuong + ' = ' + soVnd(tt.dong[i].thanhTien) + ' VND');
  }
  if (tt.khach.treEmMienPhi > 0) dong.push('- Trẻ em miễn phí: ' + tt.khach.treEmMienPhi);
  dong.push('- Tổng cộng: ' + soVnd(tt.tong) + ' VND');
  var canhBao = canhBaoTreEm(don, tau, bangTreEm);
  if (canhBao) dong.push('- Lưu ý: ' + canhBao);
  if (taiKhoan) dong.push('- Đã chuyển vào: ' + taiKhoan.nganHang + ' ' + taiKhoan.soTaiKhoan + ' (' + taiKhoan.chuTaiKhoan + ')');
  if (don.vat && don.congTy) dong.push('- Xuất VAT: ' + don.congTy.ten + ' – MST ' + don.congTy.mst);
  dong.push('- Họ tên: ' + don.hoTen.trim(), '- SĐT: ' + chuanHoaSoDienThoai(don.soDienThoai));
  if (laKhachTiengAnh()) dong.unshift('[English-speaking guest / Khách dùng tiếng Anh]');
  if (don.ghiChu && don.ghiChu.trim()) dong.push('- Ghi chú: ' + don.ghiChu.trim());
  return dong.join('\n');
}

// Tiêu đề email: "Đặt chỗ mới - <tên tàu> - <ngày lên tàu>".
function taoTieuDeEmail(don, tau) {
  return 'Đặt chỗ mới - ' + tau.ten + ' - ' + dinhDangNgay(don.ngay);
}

// Dữ liệu JSON gửi tới FormSubmit. linkXacNhan chỉ đi vào email của Ms Nguyên, khách không thấy.
function taoDuLieuEmail(don, tau, bangTreEm, taiKhoan, linkXacNhan) {
  var tt = tomTatDon(don, tau, bangTreEm);
  var chiTiet = [];
  for (var i = 0; i < tt.dong.length; i++) {
    chiTiet.push(tt.dong[i].ten + ': ' + soVnd(tt.dong[i].gia) + ' x ' + tt.dong[i].soLuong + ' = ' + soVnd(tt.dong[i].thanhTien));
  }
  var kq = {
    _subject: taoTieuDeEmail(don, tau) + ' - ' + don.maDon,
    _captcha: 'false',
    'Mã đơn': don.maDon,
    'Họ tên': don.hoTen.trim(),
    'Số điện thoại': chuanHoaSoDienThoai(don.soDienThoai),
    'Ngày lên tàu': dinhDangNgay(don.ngay),
    'Tàu': tau.ten,
    'Loại': TEN_LOAI_DICH_VU[don.loai],
    'Thực đơn': chiTiet.join(' | '),
    'Trẻ em miễn phí': tt.khach.treEmMienPhi,
    'Tổng cộng': soVnd(tt.tong) + ' VND',
    'Tài khoản nhận': taiKhoan ? taiKhoan.nganHang + ' ' + taiKhoan.soTaiKhoan + ' - ' + taiKhoan.chuTaiKhoan : '',
    'Nội dung chuyển khoản': taoNoiDungChuyenKhoan(don),
    'Xuất VAT': don.vat && don.congTy
      ? don.congTy.ten + ' | MST ' + don.congTy.mst + ' | ' + don.congTy.diaChi + ' | ' + don.congTy.email
      : 'Không'
  };
  if (don.ghiChu && don.ghiChu.trim()) kq['Ghi chú'] = don.ghiChu.trim();
  kq['Ngôn ngữ khách'] = laKhachTiengAnh() ? 'Tiếng Anh (English) – trả lời khách bằng tiếng Anh' : 'Tiếng Việt';
  var canhBaoTre = canhBaoTreEm(don, tau, bangTreEm);
  if (canhBaoTre) kq['Cần báo phụ phí trẻ em'] = canhBaoTre;
  if (don.giuCho === 'da-giu') kq['Giữ chỗ'] = 'Đã giữ trên Google Sheet đến ' + (don.giuDen ? new Date(don.giuDen).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '');
  else if (don.giuCho === 'loi') {
    kq['Giữ chỗ'] = 'CHƯA giữ được chỗ tự động (' + ({ mang: 'lỗi mạng', ban: 'máy chủ bận hoặc quá nhiều lượt', 'du-lieu': 'dữ liệu đơn không hợp lệ', 'may-chu': 'lỗi máy chủ' }[don.loiGiuCho] || 'lỗi') +
      ') – kiểm tra Google Sheet và thêm đơn bằng tay';
  }
  if (don.daChuyen === 'ok') kq['Báo chuyển khoản'] = 'Khách đã bấm "Tôi đã chuyển khoản" – chỗ đang giữ ở trạng thái "Chờ xác nhận"';
  else if (don.daChuyen === 'vuot') kq['Báo chuyển khoản'] = 'Khách báo đã chuyển khoản SAU KHI hết hạn giữ chỗ – ngày này đang vượt ' + don.vuotCho + ' chỗ, kiểm tra với tàu';
  else if (don.daChuyen === 'da-huy') kq['Báo chuyển khoản'] = 'Khách báo đã chuyển khoản nhưng đơn ĐÃ BỊ HỦY trên Google Sheet – kiểm tra tiền và chỗ với tàu';
  else if (don.daChuyen === 'loi' && don.loiChuyen === 'khong-co-don') kq['Báo chuyển khoản'] = 'Khách báo đã chuyển khoản nhưng Google Sheet CHƯA CÓ dòng của đơn này – thêm dòng "Chờ xác nhận" bằng tay';
  else if (don.daChuyen === 'loi') kq['Báo chuyển khoản'] = 'CHƯA báo được lên Google Sheet (mã lỗi ' + (don.loiChuyen || 'mang') + ') – đổi đơn sang "Chờ xác nhận" bằng tay để chỗ không tự hết hạn';
  if (linkXacNhan) kq['Link tạo phiếu sau khi kiểm tra tiền'] = linkXacNhan;
  return kq;
}

// Gửi bằng fetch POST JSON; trả Promise<boolean>. fetchHam truyền vào để test được.
function guiEmailDatCho(duLieuEmail, fetchHam) {
  if (typeof fetchHam !== 'function') return Promise.resolve(false);
  var yeuCau;
  try {
    yeuCau = fetchHam(URL_FORMSUBMIT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(duLieuEmail)
    });
  } catch (loi) {
    return Promise.resolve(false);
  }
  return Promise.resolve(yeuCau).then(function (phanHoi) {
    if (!phanHoi || !phanHoi.ok) return false;
    return Promise.resolve(phanHoi.json()).then(function (noiDung) {
      return !!noiDung && noiDung.success !== false && noiDung.success !== 'false';
    });
  }).then(function (kq) {
    return kq;
  }, function () {
    return false;
  });
}

// Đóng gói đơn vào chuỗi base64url (UTF-8) để đặt sau dấu # của link xác nhận.
function maHoaDon(don) {
  var json = JSON.stringify(don);
  var b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(json, 'utf8').toString('base64')
    : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function giaiMaDon(chuoi) {
  try {
    var b64 = String(chuoi).replace(/^#/, '').replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var json = typeof Buffer !== 'undefined'
      ? Buffer.from(b64, 'base64').toString('utf8')
      : decodeURIComponent(escape(atob(b64)));
    var don = JSON.parse(json);
    return don && typeof don === 'object' ? don : null;
  } catch (loi) {
    return null;
  }
}

// Link trang xác nhận cho Ms Nguyên (cùng thư mục với trang hiện tại).
function taoLinkXacNhan(don) {
  return location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '') + 'xac-nhan.html#' + maHoaDon(don);
}

// Đơn đọc từ link có đủ trường đúng kiểu để dựng phiếu không.
function laDonHopLe(don) {
  if (!don || typeof don !== 'object') return false;
  var chuoi = ['slugTau', 'ngay', 'loai', 'hoTen', 'soDienThoai', 'maDon'];
  for (var i = 0; i < chuoi.length; i++) if (typeof don[chuoi[i]] !== 'string' || !don[chuoi[i]]) return false;
  if (!don.hoTen.trim() || !laNgayCoThat(don.ngay)) return false;
  if (don.loai !== 'buffet' && don.loai !== 'setMenu') return false;
  if (don.mon !== undefined && (typeof don.mon !== 'object' || don.mon === null)) return false;
  if (don.congTy !== undefined && (typeof don.congTy !== 'object' || don.congTy === null)) return false;
  return true;
}

/* ---------- Phiếu xác nhận (chỉ tạo ở trang xac-nhan.html) ---------- */
function chinhSach(idMuc, tieuDeNhom) {
  return typeof layDongChinhSach === 'function' ? layDongChinhSach(idMuc, tieuDeNhom) : require('./du-lieu-tau.js').layDongChinhSach(idMuc, tieuDeNhom);
}

function danhSachLi(dong) {
  var html = '<ul>';
  for (var i = 0; i < dong.length; i++) html += '<li>' + escapeHtmlDatCho(dong[i]) + '</li>';
  return html + '</ul>';
}

function taoPhoDem() {
  // Phố đêm vẽ bằng CSS (không dùng ảnh để xuất PNG được cả khi mở bằng file://).
  var toa = [[2, 34, 46], [7, 22, 70], [11, 40, 38], [17, 26, 92], [22, 30, 58], [28, 18, 40], [33, 36, 76],
    [40, 24, 50], [45, 30, 104], [51, 22, 64], [56, 40, 44], [63, 26, 84], [69, 30, 54], [75, 20, 96],
    [80, 34, 60], [87, 24, 74], [92, 36, 48]];
  var html = '<div class="phieu-pho">';
  for (var i = 0; i < toa.length; i++) {
    html += '<span class="toa" style="left:' + toa[i][0] + '%;width:' + toa[i][1] + 'px;height:' + toa[i][2] + 'px"></span>';
  }
  return html + '<span class="nuoc"></span></div>';
}

// thongTin: { trangThai, codeVe, ngayXacNhan (Date) }.
function taoPhieuHtml(don, tau, congTy, lienHe, bangTreEm, taiKhoan, thongTin) {
  var e = escapeHtmlDatCho;
  var tt = tomTatDon(don, tau, bangTreEm);
  var gio = tau.gioChay || {};
  // Ngày đặt = ngày khách tạo đơn; đơn cũ không có thì lấy ngày xác nhận.
  var ngayDat = laNgayCoThat(don.ngayDat) ? new Date(don.ngayDat + 'T00:00:00') : thongTin.ngayXacNhan;
  var hai = function (n) { return (n < 10 ? '0' : '') + n; };
  var dongMon = '';
  for (var i = 0; i < tt.dong.length; i++) {
    var d = tt.dong[i];
    dongMon += '<tr>' + (i === 0 ? '<td class="nhan" rowspan="' + tt.dong.length + '">Thực đơn</td>' : '') +
      '<td colspan="2" class="giua">' + e(d.ten.toUpperCase()) + '</td>' +
      '<td>' + e(soVnd(d.gia)) + ' x ' + d.soLuong + '</td></tr>';
  }
  var congThuc = tt.dong.length === 1
    ? soVnd(tt.dong[0].gia) + ' x ' + tt.dong[0].soLuong + ' = ' + soVnd(tt.tong) + ' vnd'
    : soVnd(tt.tong) + ' vnd';

  // Phiếu luôn giữ tiếng Việt (mẫu phiếu chính thức), kể cả khi trang đang ở tiếng Anh.
  return '<div class="phieu" id="phieu" data-khong-dich><div class="phieu-goc"></div>' +
    (layLogoDaiLy() ? '<div class="phieu-chim">' + taoAnhLogo('', 'phieu-chim-anh') + '</div>' : '') +
    '<div class="phieu-noi">' +
    '<div class="phieu-dau">' + taoAnhLogo('', 'phieu-logo') +
    '<div class="phieu-cong-ty"><strong>' + e(congTy.ten) + '</strong>' +
    '<p>MST: ' + e(congTy.mst) + ' – ' + e(congTy.vaiTro) + '</p>' +
    '<p>Địa chỉ: ' + e(tau.diaChi) + '</p>' +
    '<p>Hỗ trợ dịch vụ: ' + e(lienHe.tenNguoiLienHe) + ' ' + e(lienHe.soDienThoai) + '</p></div></div>' +
    '<h2>PHIẾU XÁC NHẬN DỊCH VỤ DU THUYỀN<br>' + e(tau.ten.toUpperCase()) + '</h2>' +
    '<p class="phieu-ngay">Ngày đặt <b>' + hai(ngayDat.getDate()) + '</b> tháng <b>' + hai(ngayDat.getMonth() + 1) +
    '</b> năm <b>' + ngayDat.getFullYear() + '</b> · Mã đơn <b>' + e(don.maDon) + '</b></p>' +
    '<h3>Thông tin khách hàng:</h3>' +
    '<table><tbody>' +
    '<tr><td class="nhan">Họ và tên:</td><td colspan="3">' + e(don.hoTen.trim().toUpperCase()) + '</td></tr>' +
    '<tr><td class="nhan">Điện thoại liên hệ:</td><td colspan="3">' + e(chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai) + '</td></tr>' +
    '<tr><td class="nhan">Thời gian sử dụng dịch vụ:</td><td colspan="3" class="do">' + e(dinhDangNgay(don.ngay).replace(/\//g, '.')) + '</td></tr>' +
    '<tr><td class="nhan" rowspan="2">Số lượng khách:</td>' +
    '<td class="giua xanh-chu">Người lớn</td><td class="giua xanh-chu">' + (don.loai === 'setMenu' ? 'Trẻ em (menu trẻ em)' : 'Trẻ em (50%)') + '</td><td class="giua xanh-chu">Trẻ em miễn phí</td></tr>' +
    '<tr><td class="giua do">' + hai(tt.khach.nguoiLon) + '</td><td class="giua do">' + tt.khach.treEm50 +
    '</td><td class="giua do">' + tt.khach.treEmMienPhi + '</td></tr>' +
    dongMon +
    '<tr><td class="nhan">Tổng thanh toán</td><td colspan="3" class="giua">' + e(congThuc) + '</td></tr>' +
    '<tr><td class="nhan">Hình thức thanh toán</td><td colspan="3">' + e(taiKhoan ? 'Chuyển khoản ' + taiKhoan.nganHang + ' – ' + taiKhoan.chuTaiKhoan : '') +
    (don.vat && don.congTy ? '<br>Xuất VAT: ' + e(don.congTy.ten) + ' – MST ' + e(don.congTy.mst) : '') + '</td></tr>' +
    (thongTin.codeVe ? '<tr><td class="nhan">Code vé điện tử</td><td colspan="3" class="do">' + e(thongTin.codeVe) + '</td></tr>' : '') +
    '<tr><td class="nhan">Trạng thái</td><td colspan="3" class="do">' + e(thongTin.trangThai) + '</td></tr>' +
    '</tbody></table>' +
    '<h3>Thời gian phục vụ và hành trình di chuyển:</h3><div class="phieu-gio">' +
    (gio.donKhach ? '<p><b>' + e(gio.donKhach) + ':</b> Tàu bắt đầu đón khách tại Cảng Sài Gòn: ' + e(tau.diaChi) + '.</p>' : '') +
    (gio.khoiHanh ? '<p><b>' + e(gio.khoiHanh) + ':</b> Tàu rời bến tham quan dọc sông Sài Gòn.</p>' : '') +
    (gio.capBen ? '<p><b>' + e(gio.capBen) + ':</b> Tàu trở về bến kết thúc hành trình. Trân trọng cảm ơn và hẹn gặp lại quý khách.</p>' : '') +
    (gio.ghiChu ? '<p>' + e(gio.ghiChu) + '</p>' : '') +
    '</div>' +
    '<h3>Giá vé bao gồm:</h3>' + danhSachLi(chinhSach('dieu-kien-ve', 'Giá đã bao gồm')) +
    '<h3>Giá vé không bao gồm:</h3>' + danhSachLi(chinhSach('dieu-kien-ve', 'Giá chưa bao gồm')) +
    '<p class="phieu-luu-y">Lưu ý: Quý khách vui lòng có mặt tại tàu trước ' + e(gio.khoiHanh || 'giờ khởi hành') +
    ', trường hợp đến trễ hơn giờ tàu chạy, tàu có quyền từ chối phục vụ. Khi lên tàu, xuất trình vé điện tử qua điện thoại cho nhân viên. ' +
    'Vé chỉ có giá trị vào đúng ngày đăng ký.</p>' +
    (thongTin.xacThuc
      ? '<div class="phieu-xac-thuc"><img src="' + e(thongTin.xacThuc.qr) + '" alt="Mã QR kiểm tra vé">' +
        '<div><b>Vé điện tử có chữ ký số</b><br>Mã xác thực: <b>' + e(thongTin.xacThuc.maNgan) + '</b><br>' +
        'Nhân viên quét mã QR để kiểm tra vé thật. Phiếu bị sửa bất kỳ chi tiết nào sẽ báo không hợp lệ.</div></div>'
      : '') +
    '<p class="phieu-chuc">Chúc Quý Khách có một trải nghiệm nhiều niềm vui!</p>' +
    '</div>' + taoPhoDem() + '</div>';
}

// Nội dung vé được ký (js/xac-thuc.js) từ đơn đã xác nhận.
// Code vé điện tử tự tạo khi Ms Nguyên xác nhận đã nhận tiền (không có code riêng của tàu).
// Dạng <MÃ TÀU>-<ngày đi ddMM>-<4 ký tự>, ví dụ QUEEN-2410-7K3F. Bỏ các ký tự dễ nhầm (0/O, 1/I/L).
var MA_TAU_CODE = {
  'indochina-star': 'STAR', 'ben-nghe': 'BNGHE', 'indochina-queen': 'QUEEN',
  'elite-of-saigon': 'ELITE', 'saigon-princess': 'SGPRN', 'ben-thanh-princess': 'BTPRN'
};
var KY_TU_CODE = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function taoCodeVe(tau, ngayDi, ngauNhien) {
  var duoi = '';
  var so = [];
  if (typeof ngauNhien !== 'function' && typeof crypto !== 'undefined' && crypto.getRandomValues) {
    var mang = new Uint32Array(4);
    crypto.getRandomValues(mang);
    for (var k = 0; k < 4; k++) so.push(mang[k] / 4294967296);
  }
  for (var i = 0; i < 4; i++) {
    var r = typeof ngauNhien === 'function' ? ngauNhien() : (so.length ? so[i] : Math.random());
    duoi += KY_TU_CODE.charAt(Math.floor(r * KY_TU_CODE.length) % KY_TU_CODE.length);
  }
  var maTau = MA_TAU_CODE[tau && tau.slug] || 'VE';
  var ngay = /^\d{4}-(\d{2})-(\d{2})$/.exec(String(ngayDi || ''));
  return maTau + '-' + (ngay ? ngay[2] + ngay[1] : '0000') + '-' + duoi;
}

function taoNoiDungVe(don, tau, bangTreEm, codeVe, ngayXacNhan) {
  var tt = tomTatDon(don, tau, bangTreEm);
  return {
    m: don.maDon, t: tau.slug, tt: tau.ten, n: don.ngay, h: don.hoTen.trim(), s: chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai,
    nl: tt.khach.nguoiLon, te: tt.khach.treEm50, mp: tt.khach.treEmMienPhi, g: tt.tong, c: codeVe || '', x: ngayHomNayDiaPhuong(ngayXacNhan)
  };
}

// Link kiểm tra vé tuyệt đối (theo tenMien) để QR quét được cả khi phiếu tạo trên máy.
function taoLinkKiemTraVe(tenMien, chuoiVe) {
  return String(tenMien || '').replace(/\/+$/, '') + '/kiem-tra-ve.html#' + chuoiVe;
}

// Mã QR dạng ảnh (thư viện qrcode-generator). Trả '' nếu chưa tải được thư viện.
function taoAnhQR(noiDung) {
  if (typeof qrcode !== 'function') return '';
  var qr = qrcode(0, 'M');
  qr.addData(noiDung);
  qr.make();
  return qr.createDataURL(4, 8);
}

// Thông tin công ty (CONG_TY trong js/du-lieu-tau.js), dùng được cả trên trình duyệt lẫn Node.
function layCongTy() {
  if (typeof CONG_TY !== 'undefined') return CONG_TY;
  if (typeof module !== 'undefined') return require('./du-lieu-tau.js').CONG_TY;
  return { ten: '', mst: '', vaiTro: '' };
}

// Đường dẫn logo đại lý (CAU_HINH.logo.header); '' nếu chưa cấu hình.
function layLogoDaiLy() {
  var ch = typeof CAU_HINH !== 'undefined' ? CAU_HINH : null;
  return (ch && ch.logo && (ch.logo.header || ch.logo.footer)) || '';
}

// Ảnh logo; thiếu file thì tự ẩn (không hiện ảnh vỡ).
function taoAnhLogo(tienTo, lop) {
  var src = layLogoDaiLy();
  if (!src) return '';
  return '<img class="' + lop + '" src="' + escapeHtmlDatCho(tienTo + src) + '" alt="Logo ' + escapeHtmlDatCho(layCongTy().ten) +
    '" onerror="this.parentNode && this.parentNode.removeChild(this)">';
}

// Khung tin cậy ở bước thanh toán: đại lý chính thức, MST, các cam kết.
function taoKhoiUyTin(congTy, tienTo) {
  var e = escapeHtmlDatCho;
  return '<div class="khoi-uy-tin">' + taoAnhLogo(tienTo, 'uy-tin-logo') +
    '<div><strong>Thanh toán cho đại lý chính thức</strong>' +
    '<span>' + e(congTy.ten) + ' · MST ' + e(congTy.mst) + '</span>' +
    '<ul><li>' + hamHienThi.icon('khien') + 'Chỉ chuyển vào tài khoản ACB ghi trên trang này</li>' +
    '<li>' + hamHienThi.icon('dung') + 'Vé có chữ ký số, quét QR là biết vé thật</li></ul></div></div>';
}

/* ---------- Xuất ảnh phiếu ---------- */
var BE_RONG_PHIEU = 760;

// Phiếu luôn rộng 760px (ảnh xuất ra giống nhau trên mọi máy); khi xem thì thu nhỏ cho vừa khung.
function canhPhieuVuaKhung(khung) {
  var phieu = khung && khung.querySelector('.phieu');
  if (!phieu) return;
  var tiLe = khung.clientWidth / BE_RONG_PHIEU;
  phieu.style.zoom = tiLe > 0 && tiLe < 1 ? String(tiLe) : '';
}

// Chụp phiếu thành ảnh PNG. Trả Promise<Blob>; lỗi khi chưa tải được thư viện html2canvas.
function xuatAnhPhieu(phanTu) {
  if (typeof html2canvas !== 'function') return Promise.reject(new Error('khong-co-html2canvas'));
  var zoomCu = phanTu.style.zoom;
  phanTu.style.zoom = '';
  var traLaiZoom = function () { phanTu.style.zoom = zoomCu; };
  var tuyChon = {
    scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: 820,
    // html2canvas vẽ chữ lệch xuống vài px; trong bản chụp đệm thêm phía dưới ô bảng để chữ không chạm đường kẻ.
    onclone: function (banSao) {
      var kieu = banSao.createElement('style');
      kieu.textContent = 'img { display: inline-block !important; } .phieu td { line-height: 1.25 !important; padding: 1px 8px 7px !important; }';
      banSao.head.appendChild(kieu);
    }
  };
  var hua;
  try {
    hua = html2canvas(phanTu, tuyChon);
  } catch (loi) {
    traLaiZoom();
    return Promise.reject(loi);
  }
  return hua.then(function (canvas) {
    traLaiZoom();
    return new Promise(function (xong, loi) {
      canvas.toBlob(function (blob) { if (blob) xong(blob); else loi(new Error('khong-tao-duoc-anh')); }, 'image/png');
    });
  }, function (loi) {
    traLaiZoom();
    throw loi;
  });
}

function taiFileVeMay(blob, tenFile) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = tenFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

/* ---------- Sao chép ---------- */
function saoChepBangTextarea(noiDung) {
  var o = document.createElement('textarea');
  o.value = noiDung;
  o.setAttribute('readonly', '');
  o.style.position = 'fixed';
  o.style.top = '0';
  o.style.left = '-9999px';
  document.body.appendChild(o);
  o.select();
  var thanhCong = false;
  try {
    thanhCong = document.execCommand('copy');
  } catch (loi) {
    thanhCong = false;
  }
  document.body.removeChild(o);
  return thanhCong;
}

// Gọi xong(true/false) khi biết kết quả sao chép.
function saoChepNoiDung(noiDung, xong) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      navigator.clipboard.writeText(noiDung).then(function () {
        xong(true);
      }, function () {
        xong(saoChepBangTextarea(noiDung));
      });
      return;
    } catch (loi) {
      // rơi xuống cách dự phòng
    }
  }
  xong(saoChepBangTextarea(noiDung));
}

/* ---------- Trang đặt chỗ ---------- */
function docThamSoUrl(chuoiTim) {
  var kq = {};
  var phan = String(chuoiTim || '').replace(/^\?/, '').split('&');
  for (var i = 0; i < phan.length; i++) {
    if (!phan[i]) continue;
    var cap = phan[i].split('=');
    try {
      kq[decodeURIComponent(cap[0])] = decodeURIComponent((cap[1] || '').replace(/\+/g, ' '));
    } catch (loi) {
      // bỏ qua tham số hỏng
    }
  }
  return kq;
}

function taoOptionTau(danhSachTau, slugChon) {
  var html = '<option value="">-- Chọn du thuyền --</option>';
  for (var i = 0; i < danhSachTau.length; i++) {
    html += '<option value="' + escapeHtmlDatCho(danhSachTau[i].slug) + '"' +
      (danhSachTau[i].slug === slugChon ? ' selected' : '') + '>' + escapeHtmlDatCho(danhSachTau[i].ten) + '</option>';
  }
  return html;
}

function taoODem(ten, giaTri, toiThieu) {
  return '<div class="dem-so"><button type="button" data-dem="-1" data-ten="' + ten + '" aria-label="Bớt">−</button>' +
    '<input type="number" name="' + ten + '" min="' + toiThieu + '" step="1" value="' + giaTri + '" inputmode="numeric">' +
    '<button type="button" data-dem="1" data-ten="' + ten + '" aria-label="Thêm">+</button></div>';
}

function taoAnhNhoMon(mon) {
  return mon.anh.length > 0
    ? hamHienThi.taoAnh(mon.anh[0].src, mon.anh[0].alt, '', true, mon.ten)
    : '<span class="anh-trong">' + hamHienThi.icon('menu') + '</span>';
}

// Khối chọn món theo loại đang chọn (buffet: chọn 1 hạng + đếm người; set menu: đếm suất từng món).
function taoKhoiChonMon(tau, don, bangTreEm, lienHe) {
  var e = escapeHtmlDatCho;
  if (!tau) return '<p class="ghi-chu">Chọn du thuyền để xem thực đơn.</p>';
  var theoLoai = hamHienThi.layThucDonTheoLoai(tau);
  var html = '<div class="tab-loai" role="radiogroup" aria-label="Loại dịch vụ">';
  var cacLoai = ['buffet', 'setMenu'];
  for (var t = 0; t < cacLoai.length; t++) {
    var co = theoLoai[cacLoai[t]].length > 0;
    html += '<button type="button" role="radio" data-chon-loai="' + cacLoai[t] + '" aria-pressed="' + (don.loai === cacLoai[t]) + '"' +
      (co ? '' : ' class="khong-co"') + '><strong>' + TEN_LOAI_DICH_VU[cacLoai[t]] + '</strong><span>' +
      (co ? 'Chọn món bên dưới' : (cacLoai[t] === 'setMenu' && tau.moTaGia ? 'Liên hệ báo giá' : 'Tàu không phục vụ')) + '</span></button>';
  }
  html += '</div><p class="loi" data-loi="loai"></p>';
  if (don.loai !== 'buffet' && don.loai !== 'setMenu') return html;

  var nhom = theoLoai[don.loai];
  if (nhom.length === 0) {
    var coMoTa = tau.moTaGia && tau.moTaGia.indexOf(TEN_LOAI_DICH_VU[don.loai]) !== -1;
    var loaiKhac = don.loai === 'buffet' ? 'set menu' : 'buffet';
    return html + '<div class="hop-trong"><p>' + (coMoTa
      ? 'Tàu ' + e(tau.ten) + ' chưa có danh sách ' + TEN_LOAI_DICH_VU[don.loai].toLowerCase() + ' để đặt online (' + e(tau.moTaGia) + ').'
      : 'Tàu ' + e(tau.ten) + ' chỉ phục vụ ' + loaiKhac + '. Vui lòng chọn ' + loaiKhac + ' ở trên hoặc nhắn Zalo để được tư vấn.') + '</p>' +
      '<a class="nut nut-zalo nut-nho" href="' + e(lienHe.linkZalo) + '" target="_blank" rel="noopener">Nhắn Zalo Ms Nguyên</a></div>';
  }

  html += hamHienThi.taoChipNhomCon(nhom);
  html += '<div class="danh-sach-mon">';
  for (var g = 0; g < nhom.length; g++) {
    if (nhom[g].tieuDe !== TEN_LOAI_DICH_VU[don.loai]) html += '<h3 class="tieu-de-nhom">' + e(nhom[g].tieuDe) + '</h3>';
    for (var j = 0; j < nhom[g].dong.length; j++) {
      var mon = nhom[g].dong[j];
      var dangChon = don.loai === 'buffet' ? don.buffetMa === mon.ma : soNguyen(don.mon && don.mon[mon.ma]) > 0;
      html += '<div class="mon' + (dangChon ? ' dang-chon' : '') + '" data-nhom-con="' + e(hamHienThi.layNhomCon(mon.ten)) + '">' +
        '<button type="button" class="anh-mon" data-mo-anh="mon:' + mon.ma + '" data-i="0" aria-label="Xem menu ' + e(mon.ten) + '">' + taoAnhNhoMon(mon) + '</button>' +
        '<div class="mon-ten"><strong>' + e(mon.ten) + '</strong>' + (mon.tenPhu ? '<span>' + e(mon.tenPhu) + '</span>' : '') +
        '<button type="button" class="nut-xem-menu" data-mo-anh="mon:' + mon.ma + '" data-i="0">' + hamHienThi.icon('anh') + 'Xem menu</button></div>' +
        '<div class="mon-gia"><strong>' + e(hamHienThi.dinhDangGia(mon.gia)) + '</strong><small>/ khách</small></div>' +
        (don.loai === 'buffet'
          ? '<label class="chon-tron"><input type="radio" name="buffetMa" value="' + e(mon.ma) + '"' + (dangChon ? ' checked' : '') + '><span>Chọn</span></label>'
          : taoODem('mon:' + mon.ma, soNguyen(don.mon && don.mon[mon.ma]), 0)) +
        '</div>';
    }
  }
  html += '</div><p class="loi" data-loi="mon"></p>';

  var cs = layGiaTreEm(bangTreEm, tau.slug, don.loai) || {};
  html += '<div class="dem-khach">';
  if (don.loai === 'buffet') {
    html += '<div class="dong-dem"><div><strong>Người lớn</strong><span>Tính giá đầy đủ</span></div>' + taoODem('nguoiLon', soNguyen(don.nguoiLon), 1) + '</div>';
    if (cs.nuaGia) {
      html += '<div class="dong-dem"><div><strong>Trẻ em 50%</strong><span>' + e(cs.nuaGia) + ' – tính 50% giá vé</span></div>' +
        taoODem('treEm50', soNguyen(don.treEm50), 0) + '</div>';
    }
  }
  html += '<div class="dong-dem"><div><strong>Trẻ em miễn phí</strong><span>' + e(cs.mienPhi || 'Theo chính sách của tàu') + '</span></div>' +
    taoODem('treEmMienPhi', soNguyen(don.treEmMienPhi), 0) + '</div>';
  if (don.loai === 'buffet' && cs.nuaGia) {
    html += '<p class="ghi-chu">Bé miễn phí: 2 người lớn chỉ được kèm 1 bé, bé thứ 2 trở đi tự tính vé trẻ em (50%).</p>';
  }
  if (cs.ghiChu) html += '<p class="ghi-chu">' + e(cs.ghiChu) + '</p>';
  html += '<p class="canh-bao-tre" data-canh-bao-tre' + (canhBaoTreEm(don, tau, bangTreEm) ? '' : ' hidden') + '>' + e(canhBaoTreEm(don, tau, bangTreEm) || '') + '</p>';
  return html + '</div>';
}

// Khung tóm tắt đơn bên phải (giống thẻ "Chi tiết giá" của Traveloka).
function taoTomTatDon(don, tau, bangTreEm, tienTo) {
  var e = escapeHtmlDatCho;
  if (!tau) return '<p class="ghi-chu">Chưa chọn du thuyền.</p>';
  var tt = tomTatDon(don, tau, bangTreEm);
  var anhDaiDien = hamHienThi.layAnhDaiDien(tau);
  var html = '<div class="tt-tau">' + (anhDaiDien ? hamHienThi.taoAnh(anhDaiDien.src, '', tienTo, false, tau.ten) : '') +
    '<div><strong>' + e(tau.ten) + '</strong><span>' + (laNgayCoThat(don.ngay) ? 'Ngày ' + e(dinhDangNgay(don.ngay)) : 'Chưa chọn ngày') +
    (tau.gioChay && tau.gioChay.donKhach ? ' · Đón ' + e(tau.gioChay.donKhach) : '') + '</span></div></div>';
  if (tt.dong.length === 0) return html + '<p class="ghi-chu">Chưa chọn thực đơn.</p>';
  html += '<ul class="tt-dong">';
  for (var i = 0; i < tt.dong.length; i++) {
    html += '<li><span>' + e(tt.dong[i].ten) + '<small>' + e(soVnd(tt.dong[i].gia)) + ' x ' + tt.dong[i].soLuong + '</small></span><b>' +
      e(soVnd(tt.dong[i].thanhTien)) + '</b></li>';
  }
  if (tt.khach.treEmMienPhi > 0) html += '<li><span>Trẻ em miễn phí<small>x ' + tt.khach.treEmMienPhi + '</small></span><b>0</b></li>';
  return html + '</ul><div class="tt-tong"><span>Tổng thanh toán</span><strong>' + e(hamHienThi.dinhDangGia(tt.tong)) + '</strong></div>' +
    '<div class="tt-dai-ly">' + taoAnhLogo(tienTo, 'tt-logo') + '<span>Đặt qua <b>' + e(layCongTy().ten) +
    '</b> – Đại lý chính thức</span></div>';
}

// Không tải được mã QR (mất mạng, dịch vụ lỗi): thay bằng lời nhắn, khách vẫn chuyển khoản theo thông tin bên cạnh.
function anhQRLoi(img) {
  var hop = document.createElement('div');
  hop.className = 'qr-loi';
  hop.textContent = 'Không tải được mã QR. Vui lòng chuyển khoản theo thông tin bên cạnh (đúng số tiền và nội dung).';
  img.parentNode.replaceChild(hop, img);
}

function taoKhoiThanhToan(don, tau, bangTreEm, cauHinhThanhToan) {
  var e = escapeHtmlDatCho;
  var tt = tomTatDon(don, tau, bangTreEm);
  // Trên web khách chỉ chuyển vào tài khoản cá nhân, không xuất hóa đơn VAT.
  var tk = cauHinhThanhToan.caNhan;
  var noiDung = taoNoiDungChuyenKhoan(don);
  var anhQR = tk.anhQR ? tk.anhQR : taoLinkVietQR(tk, tt.tong, noiDung);
  var html = taoKhoiUyTin(layCongTy(), '') + '<p class="loi-nhan">Quý khách thanh toán vé trước để tàu giữ chỗ. Thanh toán xong, Ms Nguyên sẽ gửi <b>phiếu xác nhận</b> và ' +
    '<b>code vé điện tử</b>; khi lên tàu quý khách đưa code cho nhân viên soát vé.</p>' +
    '<p class="loi-nhan cam-ket-hoan">Chỗ trên tàu do Ms Nguyên xác nhận với tàu sau khi quý khách thanh toán. ' +
    'Nếu tàu hết chỗ ngày đã chọn, Nguyên Nguyên Travel <b>hoàn 100% số tiền</b> hoặc đổi sang ngày khác theo lựa chọn của quý khách.</p>';
  html += '<div class="hop-chuyen-khoan">' +
    '<div class="qr"><img src="' + e(anhQR) + '" alt="Mã QR chuyển khoản ' + e(tk.nganHang + ' ' + tk.soTaiKhoan) + '" onerror="anhQRLoi(this)">' +
    '<small>' + (tk.anhQR ? 'Quét mã rồi nhập đúng số tiền và nội dung bên cạnh' : 'Quét bằng app ngân hàng – số tiền và nội dung đã điền sẵn') + '</small></div>' +
    '<dl>' +
    '<dt>Ngân hàng</dt><dd>' + e(tk.nganHang) + '</dd>' +
    '<dt>Số tài khoản</dt><dd><b>' + e(tk.soTaiKhoan) + '</b> <button type="button" class="nut-chep" data-chep="' + e(tk.soTaiKhoan) + '">Sao chép</button></dd>' +
    '<dt>Chủ tài khoản</dt><dd>' + e(tk.chuTaiKhoan) + '</dd>' +
    '<dt>Số tiền</dt><dd><b class="so-tien">' + e(hamHienThi.dinhDangGia(tt.tong)) + '</b> <button type="button" class="nut-chep" data-chep="' + tt.tong + '">Sao chép</button></dd>' +
    '<dt>Nội dung</dt><dd><b>' + e(noiDung) + '</b> <button type="button" class="nut-chep" data-chep="' + e(noiDung) + '">Sao chép</button></dd>' +
    '</dl></div>';
  return html;
}

function ganSuKienDatCho(goc, danhSachTau, bangTreEm, cauHinhThanhToan, congTy, lienHe, thamSo) {
  if (!goc) return;
  var form = goc.querySelector('#form-dat-cho');
  var el = form.elements;
  var khungMon = goc.querySelector('#khung-chon-mon');
  var khungTomTat = document.getElementById('khung-tom-tat');
  var khungThanhToan = goc.querySelector('#khung-thanh-toan');
  var cheDoMsNguyen = thamSo && thamSo.ms === '1';
  var oThongBao = document.getElementById('thong-bao');
  var cacBuoc = goc.querySelectorAll('[data-buoc]');
  var cacChiBuoc = document.querySelectorAll('[data-chi-buoc]');
  var dangGui = false;
  thamSo = thamSo || {};

  var don = {
    slugTau: '', ngay: '', loai: '', buffetMa: '', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {},
    hoTen: '', soDienThoai: '', email: '', ghiChu: '', vat: false,
    congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: ''
  };

  // Điền sẵn từ link (nút "Đặt" ở trang tàu, ô tìm kiếm trang chủ).
  var tauDau = timTauTheoSlug(danhSachTau, thamSo.tau);
  if (tauDau) {
    don.slugTau = tauDau.slug;
    var theoLoai = hamHienThi.layThucDonTheoLoai(tauDau);
    don.loai = (thamSo.loai === 'buffet' || thamSo.loai === 'setMenu') ? thamSo.loai : (theoLoai.buffet.length > 0 ? 'buffet' : 'setMenu');
    if (thamSo.menu && timMon(tauDau, don.loai, thamSo.menu)) {
      if (don.loai === 'buffet') don.buffetMa = thamSo.menu;
      else don.mon[thamSo.menu] = 2;
    }
  }
  if (thamSo.ngay && laNgayCoThat(thamSo.ngay)) don.ngay = thamSo.ngay;
  if (thamSo.nl && soNguyen(thamSo.nl) > 0) don.nguoiLon = soNguyen(thamSo.nl);

  el.slugTau.innerHTML = taoOptionTau(danhSachTau, don.slugTau);
  el.ngay.value = don.ngay;
  // Lịch còn chỗ / hết chỗ (js/lich-cho.js): bấm ngày nào thì điền vào ô ngày (ô ẩn).
  var oNgayDaChon = document.getElementById('ngay-da-chon');
  function hienNgayDaChon() { if (oNgayDaChon) oNgayDaChon.textContent = don.ngay ? '· ' + dinhDangNgay(don.ngay) : ''; }
  // Ngày đang chọn vừa thành hết chỗ (lịch online, hoặc không đủ chỗ cho số khách): bỏ chọn và nhắc khách.
  function boChonNgayHetCho() {
    if (!don.ngay || !don.slugTau || hamLichCho.trangThaiNgay(don.slugTau, don.ngay, hamLichCho.ngayHomNayVN()) !== 'het') return;
    don.ngay = '';
    el.ngay.value = '';
    hienNgayDaChon();
    if (lich) lich.ve('');
    var oLoiNgay = goc.querySelector('[data-loi="ngay"]');
    if (oLoiNgay) oLoiNgay.textContent = 'Ngày đã chọn không còn đủ chỗ, vui lòng chọn ngày khác.';
    veTomTat();
  }
  // Mở link ?ngay= đúng ngày tàu đã hết chỗ: bỏ chọn ngày đó.
  if (don.ngay && don.slugTau && hamLichCho.trangThaiNgay(don.slugTau, don.ngay, hamLichCho.ngayHomNayVN()) === 'het') {
    don.ngay = '';
    el.ngay.value = '';
  }
  var oDoiTra = document.getElementById('dong-y-doi-tra');
  function capNhatDoiTra() {
    if (!oDoiTra) return;
    oDoiTra.textContent = loiNhacDoiTra(don.slugTau);
    oDoiTra.hidden = !oDoiTra.textContent;
  }
  capNhatDoiTra();
  var khungLich = document.getElementById('lich-dat-cho');
  var lich = null;
  try {
    lich = hamLichCho.ganLichCho(khungLich, hamLichCho.ngayHomNayVN(),
      function () { return don.slugTau; },
      function (ngay) { el.ngay.value = ngay; el.ngay.dispatchEvent(new Event('change', { bubbles: true })); }, don.ngay, {
        layKhach: function () { var c = soChoCuaDon(don, tauHienTai(), bangTreEm); return { khach: Math.max(1, c.tong), be: c.beMienPhi }; },
        khiCapNhat: boChonNgayHetCho
      });
  } catch (loiLich) {
    lich = null;
  }
  // Lịch không chạy được (thiếu file, dữ liệu lỗi): trả ô ngày về ô chọn ngày thường để khách vẫn đặt được.
  if (!lich) {
    if (khungLich) khungLich.hidden = true;
    el.ngay.type = 'date';
    el.ngay.min = hamLichCho.ngayHomNayVN();
  }
  hienNgayDaChon();

  function tauHienTai() { return timTauTheoSlug(danhSachTau, don.slugTau); }

  function veMon() {
    khungMon.innerHTML = taoKhoiChonMon(tauHienTai(), don, bangTreEm, lienHe);
  }
  var thanhDuoi = document.getElementById('thanh-lien-he');
  var soKhachLich = 0;
  function veTomTat() {
    var choMoi = soChoCuaDon(don, tauHienTai(), bangTreEm);
    var soMoi = choMoi.tong + '|' + choMoi.beMienPhi;
    if (typeof lich !== 'undefined' && lich && soMoi !== soKhachLich) { soKhachLich = soMoi; lich.ve(); boChonNgayHetCho(); }
    if (khungTomTat) khungTomTat.innerHTML = taoTomTatDon(don, tauHienTai(), bangTreEm, '');
    if (thanhDuoi) {
      var tong = tomTatDon(don, tauHienTai(), bangTreEm).tong;
      thanhDuoi.hidden = false;
      thanhDuoi.innerHTML = '<div class="gia-nho"><small>Tổng thanh toán</small><strong>' +
        (tong > 0 ? escapeHtmlDatCho(hamHienThi.dinhDangGia(tong)) : '—') + '</strong></div>' +
        '<button type="button" class="nut" data-xem-don>Xem đơn</button>';
    }
  }
  if (thanhDuoi) {
    thanhDuoi.addEventListener('click', function (e) {
      if (!e.target.closest('[data-xem-don]')) return;
      var oTomTat = document.querySelector('.cot-tom-tat');
      if (oTomTat && oTomTat.scrollIntoView) oTomTat.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  function thongBao(noiDung, lop) {
    if (!oThongBao) return;
    oThongBao.textContent = noiDung;
    oThongBao.className = 'thong-bao' + (lop ? ' ' + lop : '');
  }
  // Khách sửa ô nào thì bỏ thông báo lỗi của ô đó (tránh hiểu nhầm là vẫn còn lỗi).
  function xoaLoiTruong(ten) {
    var oLoi = goc.querySelector('[data-loi="' + ten + '"]');
    if (!oLoi || !oLoi.textContent) return;
    oLoi.textContent = '';
    if (oLoi.parentNode && oLoi.parentNode.classList) oLoi.parentNode.classList.remove('co-loi');
  }
  function xoaLoiKhiSua(e) {
    var ten = e.target && e.target.name;
    if (!ten) return;
    if (ten === 'ngay') {
      if (laNgayCoThat(e.target.value) && e.target.value >= hamLichCho.ngayHomNayVN()) xoaLoiTruong('ngay');
      return;
    }
    if (ten === 'buffetMa' || ten.indexOf('mon:') === 0 || ten === 'nguoiLon') { xoaLoiTruong('mon'); return; }
    if (ten === 'dongY') { if (e.target.checked) xoaLoiTruong('dongY'); return; }
    if (ten === 'vat') return;
    // Chỉ tắt lỗi khi ô đã điền đúng (gõ dở số điện thoại, email, MST thì lỗi vẫn hiện).
    var gt = String(e.target.value || '');
    var dung = ten === 'soDienThoai' ? chuanHoaSoDienThoai(gt) !== null
      : ten === 'congTyEmail' ? laEmail(gt)
      : ten === 'congTyMst' ? laMaSoThue(gt)
      : !!gt.trim();
    if (dung) xoaLoiTruong(ten);
  }
  form.addEventListener('input', xoaLoiKhiSua);
  form.addEventListener('change', xoaLoiKhiSua);

  function baoLoi(ketQua, thuTu) {
    var cacOLoi = goc.querySelectorAll('.loi');
    for (var i = 0; i < cacOLoi.length; i++) {
      cacOLoi[i].textContent = '';
      if (cacOLoi[i].parentNode && cacOLoi[i].parentNode.classList) cacOLoi[i].parentNode.classList.remove('co-loi');
    }
    if (ketQua.hopLe) return true;
    var daFocus = false;
    for (var j = 0; j < thuTu.length; j++) {
      var ten = thuTu[j];
      if (!ketQua.loi[ten]) continue;
      var oLoi = goc.querySelector('[data-loi="' + ten + '"]');
      if (!oLoi) continue;
      oLoi.textContent = ketQua.loi[ten];
      if (oLoi.parentNode && oLoi.parentNode.classList) oLoi.parentNode.classList.add('co-loi');
      if (!daFocus) {
        if (oLoi.scrollIntoView) oLoi.scrollIntoView({ behavior: 'smooth', block: 'center' });
        daFocus = true;
      }
    }
    return false;
  }
  // Ms Nguyên xác nhận xong thì màn hình chờ của khách tự đổi (cần lịch online; chưa cài thì giữ màn hình chờ).
  var khoDon = null;
  try { khoDon = window.localStorage; } catch (loiKho) { /* trình duyệt chặn: chỉ theo dõi khi còn mở trang */ }
  var dangTheoDoi = {};
  function theoDoiDon(maDon, baoKetQua) {
    if (dangTheoDoi[maDon]) dangTheoDoi[maDon]();
    dangTheoDoi[maDon] = hamLichCho.theoDoiThanhToan(maDon, function (tt) {
      if (tt === 'da-tt') quenDonChoXacNhan(maDon, khoDon);
      baoKetQua(tt);
    });
  }
  function theoDoiDonVuaGui(maDon) {
    if (cheDoMsNguyen || !hamLichCho.urlLichOnline()) return;
    nhoDonChoXacNhan(maDon, khoDon);
    theoDoiDon(maDon, function (tt) { hienKetQuaThanhToan(goc, tt, maDon); });
  }
  // Khách mở lại trang: đơn đã có kết quả thì báo ở đầu trang, chưa có thì tiếp tục hỏi ngầm.
  function hienBaoDonCu(maDon, tt) {
    var oBao = document.getElementById('don-cu');
    var mau = document.getElementById(tt === 'da-tt' ? 'don-cu-xong' : 'don-cu-huy');
    if (!oBao || !mau) return;
    var cu = oBao.querySelector('[data-ma-don="' + maDon + '"]');
    if (cu) oBao.removeChild(cu);
    var dong = mau.cloneNode(true);
    dong.removeAttribute('id');
    dong.setAttribute('data-ma-don', maDon);
    dong.querySelector('.ma-don-cu').textContent = maDon;
    dong.hidden = false;
    oBao.appendChild(dong);
    oBao.hidden = false;
  }
  function theoDoiDonCu() {
    if (cheDoMsNguyen || !hamLichCho.urlLichOnline()) return;
    layDonChoXacNhan(khoDon).forEach(function (maCu) {
      theoDoiDon(maCu, function (tt) { hienBaoDonCu(maCu, tt); });
    });
  }

  function denBuoc(so) {
    for (var i = 0; i < cacBuoc.length; i++) cacBuoc[i].hidden = Number(cacBuoc[i].getAttribute('data-buoc')) !== so;
    for (var k = 0; k < cacChiBuoc.length; k++) {
      var n = Number(cacChiBuoc[k].getAttribute('data-chi-buoc'));
      cacChiBuoc[k].className = n < so ? 'xong' : (n === so ? 'dang' : '');
    }
    thongBao('', '');
    if (goc.scrollIntoView) goc.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function docThongTin() {
    don.hoTen = el.hoTen.value;
    don.soDienThoai = el.soDienThoai.value;
    don.ghiChu = el.ghiChu.value;
    don.dongY = el.dongY.checked;
  }

  // Ảnh menu từng món (lightbox dùng chung với trang tàu).
  var nhomAnh = {};
  function capNhatNhomAnh() {
    var tau = tauHienTai();
    for (var k in nhomAnh) delete nhomAnh[k];
    if (!tau) return;
    var nhom = hamHienThi.layNhomThucDon(tau);
    for (var i = 0; i < nhom.length; i++) {
      for (var j = 0; j < nhom[i].dong.length; j++) {
        nhomAnh['mon:' + nhom[i].dong[j].ma] = nhom[i].dong[j].anh.length > 0 ? nhom[i].dong[j].anh : [{ src: '', alt: 'Thực đơn ' + nhom[i].dong[j].ten }];
      }
    }
  }
  if (typeof ganLightbox === 'function') ganLightbox(khungMon, nhomAnh, '');

  el.slugTau.addEventListener('change', function () {
    don.slugTau = el.slugTau.value;
    var tau = tauHienTai();
    var theoLoai = tau ? hamHienThi.layThucDonTheoLoai(tau) : null;
    don.loai = theoLoai ? (theoLoai.buffet.length > 0 ? 'buffet' : 'setMenu') : '';
    don.buffetMa = '';
    don.mon = {};
    don.treEm50 = 0;
    // Đổi tàu: ngày đang chọn mà tàu mới đã hết chỗ thì bỏ chọn.
    if (tau && don.ngay && hamLichCho.trangThaiNgay(tau.slug, don.ngay, hamLichCho.ngayHomNayVN()) === 'het') { don.ngay = ''; el.ngay.value = ''; hienNgayDaChon(); }
    if (lich) lich.ve(don.ngay);
    capNhatDoiTra();
    capNhatNhomAnh();
    veMon();
    veTomTat();
  });
  el.ngay.addEventListener('change', function () { don.ngay = el.ngay.value; hienNgayDaChon(); veTomTat(); });

  khungMon.addEventListener('click', function (e) {
    var chipLoc = e.target.closest('[data-loc-nhom-con]');
    if (chipLoc) {
      hamHienThi.locNhomCon(khungMon, chipLoc);
      return;
    }
    var nutLoai = e.target.closest('[data-chon-loai]');
    if (nutLoai) {
      don.loai = nutLoai.getAttribute('data-chon-loai');
      veMon();
      veTomTat();
      return;
    }
    var nutDem = e.target.closest('[data-dem]');
    if (nutDem) {
      var o = khungMon.querySelector('input[name="' + nutDem.getAttribute('data-ten') + '"]');
      o.value = String(Math.max(Number(o.min) || 0, soNguyen(o.value) + Number(nutDem.getAttribute('data-dem'))));
      capNhatTuO(o);
    }
  });
  function capNhatTuO(o) {
    if (o.name === 'buffetMa') {
      don.buffetMa = o.value;
    } else if (o.name.indexOf('mon:') === 0) {
      don.mon[o.name.slice(4)] = soNguyen(o.value);
    } else if (o.name === 'nguoiLon' || o.name === 'treEm50' || o.name === 'treEmMienPhi') {
      don[o.name] = soNguyen(o.value);
    }
    var dong = o.closest ? o.closest('.mon') : null;
    if (o.name === 'buffetMa') {
      var cacMon = khungMon.querySelectorAll('.mon');
      for (var i = 0; i < cacMon.length; i++) cacMon[i].classList.toggle('dang-chon', cacMon[i] === dong);
    } else if (dong) {
      dong.classList.toggle('dang-chon', soNguyen(o.value) > 0);
    }
    var oCanhBao = khungMon.querySelector('[data-canh-bao-tre]');
    if (oCanhBao) {
      var canhBao = canhBaoTreEm(don, tauHienTai(), bangTreEm);
      oCanhBao.textContent = canhBao || '';
      oCanhBao.hidden = !canhBao;
    }
    veTomTat();
  }
  khungMon.addEventListener('input', function (e) { capNhatTuO(e.target); });
  khungMon.addEventListener('change', function (e) { capNhatTuO(e.target); });

  form.addEventListener('submit', function (e) { e.preventDefault(); });

  goc.addEventListener('click', function (e) {
    var nut = e.target.closest('[data-hanh-dong]');
    if (!nut) return;
    var hanhDong = nut.getAttribute('data-hanh-dong');
    var homNay = hamLichCho.ngayHomNayVN();

    if (hanhDong === 'buoc-2') {
      don.ngay = el.ngay.value;
      if (baoLoi(kiemTraBuoc1(don, danhSachTau, homNay), ['slugTau', 'ngay', 'loai', 'mon'])) denBuoc(2);
    } else if (hanhDong === 've-buoc-1') {
      denBuoc(1);
    } else if (hanhDong === 've-buoc-2') {
      denBuoc(2);
    } else if (hanhDong === 'buoc-3') {
      docThongTin();
      if (!baoLoi(kiemTraBuoc2(don), ['hoTen', 'soDienThoai', 'dongY'])) return;
      if (!don.maDon) {
        don.maDon = taoMaDon(new Date(), Math.random);
        don.ngayDat = ngayHomNayDiaPhuong(new Date());
      }
      var hienThanhToan = function () {
        khungThanhToan.innerHTML = taoLoiNhanGiuCho(don.giuDen) + taoKhoiThanhToan(don, tauHienTai(), bangTreEm, cauHinhThanhToan) + taoKhoiMsNguyen(cheDoMsNguyen, don);
        denBuoc(3);
      };
      // Chế độ Ms Nguyên (nhập lại đơn từ Zalo): không giữ chỗ tự động.
      if (cheDoMsNguyen) { hienThanhToan(); return; }
      var cho = soChoCuaDon(don, tauHienTai(), bangTreEm);
      nut.disabled = true;
      thongBao('Đang kiểm tra và giữ chỗ…', '');
      hamLichCho.giuChoOnline({
        action: 'giu', maDon: don.maDon, tau: don.slugTau, ngay: don.ngay,
        nguoiLon: cho.nguoiLon, treEm: cho.treEm, beMienPhi: cho.beMienPhi,
        hoTen: don.hoTen.trim(), sdt: chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai
      }).then(function (kq) {
        nut.disabled = false;
        thongBao('', '');
        if (kq.ok) {
          don.giuCho = 'da-giu';
          // Chỉ hiện "đã giữ chỗ đến …" khi đại lý có hạn mức thật (không thì chỗ do tàu xác nhận sau).
          don.giuDen = kq.coHanMuc ? (kq.giuDen || '') : '';
          hienThanhToan();
        } else if (kq.loi === 'da-chuyen') {
          thongBao('Đơn này đã báo chuyển khoản nên không đổi được tàu hoặc ngày trên web. Vui lòng nhắn Zalo Ms Nguyên 0948170036 để đổi.', 'loi-gui');
        } else if (kq.loi === 'doan-dong' || kq.loi === 'nhieu-don') {
          // Đoàn đông hoặc SĐT đang có đơn chờ thanh toán: nhờ khách liên hệ Ms Nguyên.
          don.giuCho = '';
          var loiDoan = kq.loi === 'doan-dong'
            ? 'Đoàn đông vui lòng gọi hoặc nhắn Zalo Ms Nguyên 0948170036 để được giữ chỗ.'
            : 'Số điện thoại này đang có đơn chờ chuyển khoản. Vui lòng hoàn tất đơn đó hoặc nhắn Zalo Ms Nguyên 0948170036.';
          thongBao(loiDoan, 'loi-gui');
        } else if (kq.loi === 'het' || kq.loi === 'ngay-qua' || kq.loi === 'sat-gio') {
          // Vừa hết chỗ (khách khác đặt trước): quay lại chọn ngày khác.
          don.giuCho = '';
          don.giuDen = '';
          if (lich) lich.taiLai();
          denBuoc(1);
          var oLoiNgay = goc.querySelector('[data-loi="ngay"]');
          var loiNhan = kq.loi === 'het' ? 'Ngày này vừa hết chỗ cho ' + cho.tong + ' khách, vui lòng chọn ngày khác hoặc nhắn Zalo để được hỗ trợ.'
            : kq.loi === 'sat-gio' ? 'Đã quá giờ nhận đặt online cho ngày này, vui lòng gọi hoặc nhắn Zalo Ms Nguyên.'
              : 'Vui lòng chọn ngày từ hôm nay trở đi.';
          if (oLoiNgay) oLoiNgay.textContent = loiNhan;
          thongBao(loiNhan, 'loi-gui');
        } else {
          // Chưa cài lịch online, hoặc mạng lỗi: vẫn cho thanh toán; email báo Ms Nguyên kiểm tra chỗ.
          don.giuCho = kq.loi === 'chua-cai' ? '' : 'loi';
          don.loiGiuCho = kq.loi || '';
          don.giuDen = '';
          hienThanhToan();
        }
      });
    } else if (hanhDong === 'da-chuyen') {
      if (dangGui) return;
      var tau = tauHienTai();
      var tk = layTaiKhoan(cauHinhThanhToan, don);
      don.tongLucDat = tomTatDon(don, tau, bangTreEm).tong;
      var linkXacNhan = taoLinkXacNhan(don);
      dangGui = true;
      nut.disabled = true;
      thongBao('Đang gửi thông tin cho Ms Nguyên…', '');
      // Gửi cả khi lần giữ chỗ bị lỗi mạng (máy chủ có thể đã giữ được); không có đơn thì máy chủ trả khong-co-don.
      var baoChuyen = (don.giuCho === 'da-giu' || don.giuCho === 'loi')
        ? hamLichCho.giuChoOnline({ action: 'daChuyen', maDon: don.maDon, sdt: chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai })
        : Promise.resolve(null);
      baoChuyen.then(function (kqChuyen) {
        if (kqChuyen && kqChuyen.ok) { don.daChuyen = kqChuyen.vuot ? 'vuot' : 'ok'; don.vuotCho = kqChuyen.vuot || 0; }
        else if (kqChuyen) { don.daChuyen = kqChuyen.loi === 'da-huy' ? 'da-huy' : 'loi'; don.loiChuyen = kqChuyen.loi || ''; }
        return guiEmailDatCho(taoDuLieuEmail(don, tau, bangTreEm, tk, linkXacNhan), typeof fetch === 'function' ? fetch.bind(window) : null);
      }).then(function (ok) {
        dangGui = false;
        nut.disabled = false;
        goc.querySelector('#ma-don-cho').textContent = don.maDon;
        goc.querySelector('#email-ok').hidden = !ok;
        goc.querySelector('#email-loi').hidden = ok;
        denBuoc(4);
        theoDoiDonVuaGui(don.maDon);
      });
    } else if (hanhDong === 'mo-xac-nhan') {
      var oMa = goc.querySelector('#ma-don-khach');
      var ma = oMa ? oMa.value.trim().toUpperCase() : '';
      if (!laMaDon(ma)) {
        thongBao('Mã đơn không đúng định dạng (VT + 6 số + 4 ký tự, ví dụ VT261010ABCD). Kiểm tra lại tin nhắn Zalo của khách.', 'loi-gui');
        if (oMa) oMa.focus();
        return;
      }
      don.maDon = ma;
      don.tongLucDat = tomTatDon(don, tauHienTai(), bangTreEm).tong;
      window.open(taoLinkXacNhan(don), '_blank', 'noopener');
    } else if (hanhDong === 'zalo') {
      var noiDungZalo = soanTinNhanDatCho(don, tauHienTai(), bangTreEm, layTaiKhoan(cauHinhThanhToan, don));
      var khungChep = goc.querySelector('#khung-sao-chep');
      saoChepNoiDung(noiDungZalo, function (ok) {
        if (ok) {
          thongBao('Đã sao chép thông tin đặt chỗ. Trong Zalo, nhấn giữ ô nhập tin, chọn Dán rồi gửi.', 'da-gui');
          if (khungChep) khungChep.innerHTML = '';
          return;
        }
        thongBao('Không sao chép tự động được. Hãy chọn và sao chép nội dung bên dưới, rồi trong Zalo nhấn giữ ô nhập tin, chọn Dán rồi gửi.', 'loi-gui');
        if (khungChep) {
          khungChep.innerHTML = '<textarea readonly rows="10">' + escapeHtmlDatCho(noiDungZalo) + '</textarea>';
          khungChep.firstChild.focus();
          khungChep.firstChild.select();
        }
      });
      window.open(lienHe.linkZalo, '_blank', 'noopener');
    }
  });

  // Chọn tài khoản nhận tiền / sao chép số tài khoản, số tiền, nội dung.
  khungThanhToan.addEventListener('click', function (e) {
    var nut = e.target.closest('[data-chep]');
    if (!nut) return;
    saoChepNoiDung(nut.getAttribute('data-chep'), function (ok) {
      nut.textContent = ok ? 'Đã chép' : 'Không chép được';
      setTimeout(function () { nut.textContent = 'Sao chép'; }, 1600);
    });
  });

  capNhatNhomAnh();
  veMon();
  veTomTat();
  denBuocDau();
  theoDoiDonCu();
  function denBuocDau() {
    for (var i = 0; i < cacBuoc.length; i++) cacBuoc[i].hidden = cacBuoc[i].getAttribute('data-buoc') !== '1';
  }
}

// Ô dành cho Ms Nguyên (chỉ hiện khi mở dat-cho.html?ms=1): dùng khi email đơn không tới.
function taoKhoiMsNguyen(bat, don) {
  if (!bat) return '';
  return '<div class="hop-ms-nguyen"><strong>Dành cho Ms Nguyên</strong>' +
    '<p>Đơn nhập lại theo tin nhắn Zalo của khách. Điền mã đơn khách gửi (dạng VT…) rồi mở trang xác nhận.</p>' +
    '<div class="o-nhap"><label for="ma-don-khach">Mã đơn của khách</label><input type="text" id="ma-don-khach" value="' +
    escapeHtmlDatCho(don.maDon) + '"></div>' +
    '<button type="button" class="nut nut-xanh" data-hanh-dong="mo-xac-nhan">Mở trang xác nhận đơn này</button></div>';
}

function khoiChayTrangDatCho() {
  if (typeof apDungCauHinhChung === 'function') apDungCauHinhChung('');
  ganSuKienDatCho(document.getElementById('dat-cho'), DANH_SACH_TAU, GIA_TRE_EM, CAU_HINH.thanhToan, CONG_TY, LIEN_HE, docThamSoUrl(location.search));
}

// Ký phiếu an toàn: kiểm khoá trên máy khớp khoá công khai, ký, rồi tự kiểm lại chữ ký trước khi trả về.
// layKhoa: hàm trả Promise<bản ghi khoá | null> (thường là docKhoaBiMat). Trả Promise<chuỗi vé đã ký>.
function kyPhieuAnToan(congKhai, layKhoa, noiDungVe) {
  return Promise.resolve().then(layKhoa).then(function (banGhi) {
    var loiKhoa = kiemTraKhoaTruocKhiKy(congKhai, banGhi);
    if (loiKhoa) throw new Error(loiKhoa);
    return kyVe(banGhi, noiDungVe);
  }).then(function (chuoiVe) {
    return kiemTraVe(congKhai, chuoiVe).then(function (kq) {
      if (!kq.hopLe) throw new Error('Phiếu vừa ký không qua được bước tự kiểm tra (' + kq.lyDo + '). Nạp lại file khoá sao lưu rồi thử lại.');
      return chuoiVe;
    });
  });
}

/* ---------- Khoá ký phiếu (trang xác nhận) ---------- */
function taiChuoiVeMay(noiDung, tenFile) {
  taiFileVeMay(new Blob([noiDung], { type: 'application/json' }), tenFile);
}

// Mục "Khoá ký phiếu": báo trạng thái, tạo khoá (lần đầu hoặc khi mất/lộ khoá), nạp khoá từ file sao lưu.
// Trang xác nhận: lấy khoá công khai mới nhất từ máy chủ (không dùng bản trình duyệt còn lưu tới 10 phút),
// để vừa đổi khoá xong là ký phiếu được ngay. Lỗi mạng thì giữ khoá đang có.
function capNhatKhoaCongKhaiMoiNhat(fetchHam) {
  if (typeof CAU_HINH === 'undefined' || typeof fetchHam !== 'function') return Promise.resolve(false);
  return fetchHam('js/cau-hinh.js?t=' + Date.now(), { cache: 'no-store' })
    .then(function (tl) { return tl.text(); })
    .then(function (noiDung) {
      var m = /khoaCongKhai:\s*(\{[^}]*\})/.exec(noiDung);
      if (!m) return false;
      var moi = JSON.parse(m[1]);
      if (!moi || moi.kty !== 'EC' || typeof moi.x !== 'string' || typeof moi.y !== 'string') return false;
      var cu = CAU_HINH.khoaCongKhai;
      if (cu && cu.x === moi.x && cu.y === moi.y) return false;
      CAU_HINH.khoaCongKhai = { kty: 'EC', crv: 'P-256', x: moi.x, y: moi.y };
      return true;
    })
    .then(null, function () { return false; });
}

function ganQuanLyKhoa(goc) {
  var khung = goc.querySelector('#khung-khoa');
  if (!khung) return;
  var congKhai = typeof CAU_HINH !== 'undefined' ? CAU_HINH.khoaCongKhai : null;
  var dongCauHinh = function (banGhi) {
    return '<textarea readonly rows="3">' + escapeHtmlDatCho('khoaCongKhai: ' + JSON.stringify({ kty: 'EC', crv: 'P-256', x: banGhi.x, y: banGhi.y }) + ',') + '</textarea>';
  };
  function baoLoi(chu) {
    khung.insertAdjacentHTML('beforeend', '<p class="khoa-loi">' + escapeHtmlDatCho(chu) + '</p>');
  }
  function ve() {
    return docKhoaBiMat().then(function (banGhi) {
      var html;
      if (banGhi && congKhai && khoaKhop(congKhai, banGhi)) {
        html = '<p class="khoa-ok">✓ Máy này đã có khoá ký phiếu, khớp với khoá công khai của web.</p>';
      } else if (banGhi && !congKhai) {
        html = '<p class="khoa-canh-bao">Máy này đã có khoá nhưng web chưa cài khoá công khai. Dán dòng dưới vào <code>js/cau-hinh.js</code> (thay <code>khoaCongKhai: null</code>), tạo lại trang rồi push lên GitHub:</p>' + dongCauHinh(banGhi);
      } else if (banGhi) {
        html = '<p class="khoa-loi">Khoá trên máy này KHÔNG khớp khoá công khai của web, nên chưa ký phiếu được.</p>' +
          '<p class="khoa-canh-bao">Nạp đúng file khoá sao lưu. Nếu bạn vừa CỐ Ý tạo khoá mới (vì mất hoặc lộ khoá cũ), dán dòng dưới vào <code>js/cau-hinh.js</code> thay dòng khoaCongKhai cũ, tạo lại trang rồi push:</p>' + dongCauHinh(banGhi);
      } else {
        html = '<p class="khoa-canh-bao">Máy này chưa có khoá ký phiếu. ' + (congKhai
          ? 'Bấm "Nạp khoá từ file" và chọn file khoá sao lưu (khoa-bi-mat-ms-nguyen.json).'
          : 'Lần đầu dùng: bấm "Tạo khoá ký phiếu". Web sẽ tải về file khoá sao lưu, cất kỹ file này.') + '</p>';
      }
      html += '<div class="nhom-nut-khoa">' +
        '<button type="button" class="nut nut-nho' + (congKhai ? ' nut-vien' : '') + '" data-khoa="tao">' + (congKhai ? 'Tạo khoá mới (khi mất/lộ khoá)' : 'Tạo khoá ký phiếu') + '</button>' +
        '<label class="nut nut-nho nut-vien">Nạp khoá từ file<input type="file" accept="application/json,.json" data-khoa="nap" hidden></label></div>';
      khung.innerHTML = html;
      return banGhi;
    }, function (loi) {
      khung.innerHTML = '<p class="khoa-loi">' + escapeHtmlDatCho(loi && loi.message ? loi.message : 'Không đọc được kho khoá.') + '</p>';
    });
  }
  khung.addEventListener('click', function (e) {
    if (!e.target.closest('[data-khoa="tao"]')) return;
    docKhoaBiMat().then(function (banGhi) {
      if (congKhai && !window.confirm('Chỉ tạo khoá mới khi MẤT hoặc LỘ file khoá. Sau khi tạo phải dán khoá công khai mới vào js/cau-hinh.js và push; mọi phiếu đã ký bằng khoá cũ sẽ báo KHÔNG HỢP LỆ. Tiếp tục?')) return null;
      if (!congKhai && banGhi && !window.confirm('Máy này đã có khoá. Tạo khoá mới sẽ thay khoá cũ. Tiếp tục?')) return null;
      return taoCapKhoa().then(function (cap) {
        taiChuoiVeMay(JSON.stringify(cap.biMat), 'khoa-bi-mat-ms-nguyen.json');
        return luuKhoaBiMat(cap.biMat);
      }).then(ve);
    }).then(null, function (loi) { baoLoi(loi && loi.message ? loi.message : 'Không tạo được khoá.'); });
  });
  khung.addEventListener('change', function (e) {
    var o = e.target;
    if (o.getAttribute('data-khoa') !== 'nap' || !o.files || !o.files[0]) return;
    var doc = new FileReader();
    doc.onload = function () {
      var jwk = null;
      try { jwk = JSON.parse(doc.result); } catch (loi) { jwk = null; }
      var loiFile = kiemTraFileKhoa(congKhai, jwk);
      if (loiFile) { baoLoi(loiFile); return; }
      docKhoaBiMat().then(function (banGhi) {
        if (banGhi && !khoaKhop(jwk, banGhi) && !window.confirm('Máy này đang có một khoá khác. Thay bằng khoá trong file?')) return null;
        return luuKhoaBiMat(jwk).then(ve);
      }).then(null, function (loi) { baoLoi(loi && loi.message ? loi.message : 'Không nạp được khoá.'); });
    };
    doc.readAsText(o.files[0]);
  });
  ve();
}

/* ---------- Trang xác nhận (Ms Nguyên dùng) ---------- */
function khoiChayTrangXacNhan() {
  if (typeof apDungCauHinhChung === 'function') apDungCauHinhChung('');
  var goc = document.getElementById('xac-nhan');
  var don = giaiMaDon(location.hash);
  var tau = laDonHopLe(don) ? timTauTheoSlug(DANH_SACH_TAU, don.slugTau) : null;
  if (!tau) {
    // Không có đơn: vẫn giữ mục "Khoá ký phiếu" (để tạo/nạp khoá lần đầu), ẩn phần tạo phiếu.
    var oDon = goc.querySelector('#tom-tat-xac-nhan');
    var oForm = goc.querySelector('#form-xac-nhan');
    var thongBaoKhongDon = '<h3>' + (location.hash.length > 1 ? 'Không đọc được đơn' : 'Chưa mở đơn nào') + '</h3>' +
      '<p>Để tạo phiếu, hãy mở đúng link “Link tạo phiếu sau khi kiểm tra tiền” trong email đặt chỗ.</p>' +
      '<p>Không có email (gửi email lỗi)? Mở <a href="dat-cho.html?ms=1">trang đặt chỗ ở chế độ Ms Nguyên</a>, nhập lại đơn theo tin nhắn Zalo của khách, ' +
      'tới bước thanh toán rồi bấm “Mở trang xác nhận đơn này”.</p>';
    if (oDon) oDon.innerHTML = thongBaoKhongDon;
    else goc.innerHTML = '<div class="the-form">' + thongBaoKhongDon + '</div>';
    if (oForm) oForm.hidden = true;
    if (goc.querySelector('#khung-khoa')) {
      if (typeof docKhoaBiMat === 'function') capNhatKhoaCongKhaiMoiNhat(typeof fetch === 'function' ? fetch.bind(window) : null).then(function () { ganQuanLyKhoa(goc); });
      else goc.querySelector('#khung-khoa').innerHTML = '<p class="khoa-loi">Chưa tải được phần chữ ký số (js/xac-thuc.js). Kiểm tra mạng rồi tải lại trang.</p>';
    }
    return;
  }
  var tk = layTaiKhoan(CAU_HINH.thanhToan, don);
  var tt = tomTatDon(don, tau, GIA_TRE_EM);
  goc.querySelector('#tom-tat-xac-nhan').innerHTML = taoTomTatDon(don, tau, GIA_TRE_EM, '') +
    '<p class="hop-vat">Kiểm tra tài khoản <b>' + escapeHtmlDatCho(tk.nganHang + ' ' + tk.soTaiKhoan) + '</b> đã nhận <b>' +
    escapeHtmlDatCho(hamHienThi.dinhDangGia(tt.tong)) + '</b> với nội dung <b>' + escapeHtmlDatCho(taoNoiDungChuyenKhoan(don)) + '</b>.</p>' +
    (typeof don.tongLucDat === 'number' && don.tongLucDat !== tt.tong
      ? '<p class="thong-bao loi-gui">Giá đã thay đổi từ lúc khách đặt: lúc đặt khách thấy <b>' + escapeHtmlDatCho(hamHienThi.dinhDangGia(don.tongLucDat)) +
        '</b>, bảng giá hiện tại là <b>' + escapeHtmlDatCho(hamHienThi.dinhDangGia(tt.tong)) + '</b>. Kiểm tra theo số tiền khách đã chuyển trước khi tạo phiếu.</p>'
      : '');
  var form = goc.querySelector('#form-xac-nhan');
  var khungPhieu = goc.querySelector('#khung-phieu');
  // Lịch chỗ online: tạo phiếu xong thì đổi đơn trên Google Sheet sang "Đã thanh toán" (để chỗ không tự trả lại).
  var KHOA_MA_QUAN_LY = 'veTauSaiGon.maQuanLyLich';
  var oMaQuanLy = goc.querySelector('#o-ma-quan-ly');
  var coLichOnline = typeof urlLichOnline === 'function' && !!urlLichOnline();
  if (oMaQuanLy && coLichOnline) {
    oMaQuanLy.hidden = false;
    try { form.elements.maQuanLy.value = localStorage.getItem(KHOA_MA_QUAN_LY) || ''; } catch (loiLuu) { /* bỏ qua */ }
    var nutQuen = oMaQuanLy.querySelector('[data-quen-ma]');
    if (nutQuen) nutQuen.addEventListener('click', function () {
      try { localStorage.removeItem(KHOA_MA_QUAN_LY); } catch (loiLuu) { /* bỏ qua */ }
      form.elements.maQuanLy.value = '';
    });
  }
  function baoDaThanhToanLenSheet() {
    if (!coLichOnline || !form.elements.maQuanLy) return Promise.resolve('');
    var ma = form.elements.maQuanLy.value.trim();
    if (!ma) return Promise.resolve(' Chưa nhập Mã quản lý lịch chỗ: nhớ đổi đơn này sang “Đã thanh toán” trong Google Sheet.');
    try { localStorage.setItem(KHOA_MA_QUAN_LY, ma); } catch (loiLuu) { /* bỏ qua */ }
    var cho = soChoCuaDon(don, tau, GIA_TRE_EM);
    return giuChoOnline({
      action: 'xacNhan', maDon: don.maDon, ma: ma, tau: don.slugTau, ngay: don.ngay,
      nguoiLon: cho.nguoiLon, treEm: cho.treEm, beMienPhi: cho.beMienPhi,
      hoTen: don.hoTen, sdt: chuanHoaSoDienThoai(don.soDienThoai) || don.soDienThoai
    }).then(function (kq) {
      if (kq.ok && kq.moiTao) return ' Đơn chưa có trong Google Sheet nên web đã thêm dòng “Đã thanh toán”.' + (kq.vuot ? ' Ngày này đang vượt ' + kq.vuot + ' chỗ – kiểm tra với tàu.' : '');
      if (kq.ok && kq.vuot) return ' Đã đổi sang “Đã thanh toán”, NHƯNG đơn đã quá hạn giữ chỗ và ngày này đang vượt ' + kq.vuot + ' chỗ – kiểm tra với tàu.' + (kq.daHuy ? ' (Đơn trước đó đang “Hủy”.)' : '');
      if (kq.ok && kq.daHuy) return ' Đã đổi sang “Đã thanh toán” (đơn trước đó đang “Hủy”, kiểm tra lại).';
      if (kq.ok) return ' Đã đổi đơn sang “Đã thanh toán” trong Google Sheet.';
      if (kq.loi === 'ma') return ' Mã quản lý lịch chỗ không đúng: đổi đơn sang “Đã thanh toán” trong Google Sheet bằng tay.';
      if (kq.loi === 'khong-co-don') return ' Không thấy đơn này trong Google Sheet (khách đặt lúc lịch online chưa bật?): thêm dòng “Đã thanh toán” bằng tay.';
      return ' Chưa cập nhật được Google Sheet (lỗi mạng): đổi đơn sang “Đã thanh toán” bằng tay.';
    });
  }
  var khuVucPhieu = goc.querySelector('#khu-vuc-phieu');
  var oThongBao = goc.querySelector('#thong-bao');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.elements.daNhanTien.checked) {
      oThongBao.textContent = 'Chỉ tạo phiếu khi đã thấy tiền vào tài khoản.';
      oThongBao.className = 'thong-bao loi-gui';
      return;
    }
    // Chưa có code của tàu thì web tự tạo code (chỉ sau khi đã tích "đã nhận đủ tiền" ở trên).
    var codeVe = form.elements.codeVe.value.trim();
    if (!codeVe) {
      codeVe = taoCodeVe(tau, don.ngay);
      form.elements.codeVe.value = codeVe;
    }
    var ngayXacNhan = new Date();
    oThongBao.textContent = 'Đang ký phiếu…';
    oThongBao.className = 'thong-bao';
    if (typeof docKhoaBiMat !== 'function') {
      oThongBao.textContent = 'Chưa tải được phần chữ ký số (js/xac-thuc.js). Kiểm tra mạng rồi tải lại trang.';
      oThongBao.className = 'thong-bao loi-gui';
      return;
    }
    kyPhieuAnToan(CAU_HINH.khoaCongKhai, docKhoaBiMat, taoNoiDungVe(don, tau, GIA_TRE_EM, codeVe, ngayXacNhan)).then(function (chuoiVe) {
      var link = taoLinkKiemTraVe(CAU_HINH.tenMien, chuoiVe);
      var anhQR = taoAnhQR(link);
      khungPhieu.innerHTML = taoPhieuHtml(don, tau, CONG_TY, LIEN_HE, GIA_TRE_EM, tk, {
        trangThai: 'Đã thanh toán.', codeVe: codeVe, ngayXacNhan: ngayXacNhan,
        xacThuc: anhQR ? { qr: anhQR, maNgan: maXacThucNgan(chuoiVe), link: link } : null
      });
      oThongBao.textContent = anhQR ? 'Đã ký phiếu. Tải ảnh phiếu rồi gửi cho khách.' : 'Đã ký nhưng chưa tải được thư viện mã QR, kiểm tra mạng rồi bấm tạo lại.';
      oThongBao.className = anhQR ? 'thong-bao da-gui' : 'thong-bao loi-gui';
      baoDaThanhToanLenSheet().then(function (them) { if (them) oThongBao.textContent += them; });
      var oLink = goc.querySelector('#link-kiem-tra');
      if (oLink) { oLink.href = link; oLink.hidden = false; }
      khuVucPhieu.hidden = false;
      canhPhieuVuaKhung(khungPhieu);
      khuVucPhieu.scrollIntoView({ behavior: 'smooth' });
    }, function (loi) {
      oThongBao.textContent = loi && loi.message ? loi.message : 'Không ký được phiếu.';
      oThongBao.className = 'thong-bao loi-gui';
    });
  });
  if (typeof docKhoaBiMat === 'function') {
    capNhatKhoaCongKhaiMoiNhat(typeof fetch === 'function' ? fetch.bind(window) : null).then(function () { ganQuanLyKhoa(goc); });
  } else {
    var oKhoa = goc.querySelector('#khung-khoa');
    if (oKhoa) oKhoa.innerHTML = '<p class="khoa-loi">Chưa tải được phần chữ ký số (js/xac-thuc.js). Kiểm tra mạng rồi tải lại trang.</p>';
  }
  goc.addEventListener('click', function (e) {
    var nut = e.target.closest('[data-hanh-dong]');
    if (!nut) return;
    if (nut.getAttribute('data-hanh-dong') === 'in') {
      window.print();
      return;
    }
    oThongBao.textContent = 'Đang tạo ảnh phiếu…';
    xuatAnhPhieu(document.getElementById('phieu')).then(function (blob) {
      taiFileVeMay(blob, 'phieu-xac-nhan-' + don.maDon + '.png');
      oThongBao.textContent = 'Đã tải ảnh phiếu. Gửi ảnh này cho khách qua Zalo (SĐT ' + chuanHoaSoDienThoai(don.soDienThoai) + ').';
      oThongBao.className = 'thong-bao da-gui';
    }, function () {
      oThongBao.textContent = 'Chưa tạo được ảnh. Dùng nút “In / Lưu PDF” hoặc chụp màn hình phiếu.';
      oThongBao.className = 'thong-bao loi-gui';
    });
  });
  window.addEventListener('resize', function () { canhPhieuVuaKhung(khungPhieu); });
  window.addEventListener('beforeprint', function () { var p = document.getElementById('phieu'); if (p) p.style.zoom = ''; });
  window.addEventListener('afterprint', function () { canhPhieuVuaKhung(khungPhieu); });
}

if (typeof module !== 'undefined') {
  module.exports = {
    chuanHoaSoDienThoai, laEmail, laMaSoThue, timMon, layDongDon, tinhTongDon, demKhach, kiemTraBuoc1, kiemTraBuoc2,
    taoMaDon, laMaDon, taoKhoiUyTin, layLogoDaiLy, taoNoiDungVe, taoLinkKiemTraVe, kyPhieuAnToan, taoNoiDungChuyenKhoan, laDonHopLe, taoKhoiMsNguyen, soTreToiDa, soBeMienPhiVuot, canhBaoTreEm, phanBoTreBuffet, layTaiKhoan, taoLinkVietQR, tomTatDon, soanTinNhanDatCho, taoTieuDeEmail,
    taoDuLieuEmail, guiEmailDatCho, soChoCuaDon, taoLoiNhanGiuCho, taoCodeVe, loiNhacDoiTra, nhoDonChoXacNhan, layDonChoXacNhan, quenDonChoXacNhan, hienKetQuaThanhToan, capNhatKhoaCongKhaiMoiNhat, maHoaDon, giaiMaDon, taoPhieuHtml, taoKhoiChonMon, taoTomTatDon, taoKhoiThanhToan,
    dinhDangNgay, ngayHomNayDiaPhuong, docThamSoUrl, layGiaTreEm, DIA_CHI_NHAN_EMAIL, URL_FORMSUBMIT
  };
}
