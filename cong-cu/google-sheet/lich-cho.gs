/**
 * LỊCH CÒN CHỖ – chạy trong Google Sheet (Tiện ích mở rộng > Apps Script).
 * Hướng dẫn cài: cong-cu/google-sheet/HUONG-DAN.md
 *
 * Mỗi tàu mỗi ngày có SỐ CHỖ của đại lý (mặc định 50, sửa ở tab "Cài đặt", hoặc từng ngày ở tab "Số chỗ riêng").
 * Còn lại = số chỗ − khách của các đơn đang chiếm chỗ:
 *   "Đã thanh toán", "Chờ xác nhận" (khách báo đã chuyển khoản, chờ Ms Nguyên kiểm tra),
 *   "Giữ chỗ" chưa quá hạn (mặc định 1 giờ để khách chuyển khoản).
 * "Giữ chỗ" quá hạn mà khách chưa bấm "Tôi đã chuyển khoản" thì tự trả chỗ (thành "Hết hạn").
 * Khách trên web chỉ thấy ngày "còn chỗ" hoặc "hết chỗ", không thấy con số.
 */

var TAB = { caiDat: 'Cài đặt', soCho: 'Số chỗ riêng', don: 'Đơn giữ chỗ', tongHop: 'Tổng hợp' };
var TT = { giu: 'Giữ chỗ', choXN: 'Chờ xác nhận', daTT: 'Đã thanh toán', huy: 'Hủy', hetHan: 'Hết hạn' };
var DS_TAU = ['indochina-star', 'ben-nghe', 'indochina-queen', 'elite-of-saigon', 'saigon-princess', 'ben-thanh-princess'];
var TEN_TAU = {
  'indochina-star': 'Indochina Star', 'ben-nghe': 'Bến Nghé', 'indochina-queen': 'Indochina Queen',
  'elite-of-saigon': 'Elite of Saigon', 'saigon-princess': 'Saigon Princess', 'ben-thanh-princess': 'Bến Thành Princess'
};
var MUI_GIO = 'Asia/Ho_Chi_Minh';
// Cột của tab "Đơn giữ chỗ" (bắt đầu từ 1).
var COT = { maDon: 1, tau: 2, ngay: 3, nguoiLon: 4, treEm: 5, beMienPhi: 6, soCho: 7, trangThai: 8, giuDen: 9, taoLuc: 10, hoTen: 11, sdt: 12, ghiChu: 13 };
var TIEU_DE_DON = ['Mã đơn', 'Tàu (mã)', 'Ngày đi', 'Người lớn', 'Trẻ em (tính vé)', 'Bé miễn phí', 'Số chỗ', 'Trạng thái', 'Giữ đến', 'Tạo lúc', 'Họ tên', 'SĐT', 'Ghi chú'];
var CD = {
  soCho: 'Số chỗ mỗi ngày', gioGiu: 'Số giờ giữ chỗ chờ chuyển khoản', tinhBe: 'Tính bé miễn phí vào số chỗ',
  ma: 'Mã quản lý (không chia sẻ)', chanGio: 'Chặn đặt trước ngày đi (giờ)', toiDaKhach: 'Tối đa khách mỗi đơn online',
  toiDaDonSdt: 'Tối đa đơn đang giữ mỗi SĐT', toiDaLan: 'Tối đa lượt giữ chỗ mỗi 10 phút (toàn web)'
};

/* ---------- Chạy 1 lần khi cài ---------- */
function caiDat() {
  var ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(MUI_GIO);
  var cd = layTab(TAB.caiDat);
  if (cd.getLastRow() < 2) {
    cd.clear();
    cd.getRange(1, 1, 9, 3).setValues([
      ['Mục', 'Giá trị', 'Giải thích'],
      [CD.soCho, 50, 'Số chỗ đại lý được giữ cho mỗi tàu mỗi ngày (ngày nào khác thì ghi ở tab "Số chỗ riêng").'],
      [CD.gioGiu, 1, 'Khách có bấy nhiêu giờ để chuyển khoản và bấm "Tôi đã chuyển khoản". Quá hạn thì chỗ tự trả lại. Bấm rồi thì giữ tới khi Ms Nguyên xác nhận.'],
      [CD.tinhBe, 'Không', 'Ghi "Có" nếu bé miễn phí cũng chiếm chỗ ngồi.'],
      [CD.ma, taoMaBiMat(), 'Nhập mã này ở trang xác nhận đơn để web tự đổi đơn sang "Đã thanh toán". Không chia sẻ cho ai.'],
      [CD.chanGio, 0, 'Ví dụ 3: còn dưới 3 giờ trước 18h ngày đi thì không nhận giữ chỗ online. 0 = không chặn.'],
      [CD.toiDaKhach, 20, 'Đoàn đông hơn số này thì web nhắn khách liên hệ Zalo (chống giữ chỗ ảo).'],
      [CD.toiDaDonSdt, 2, 'Một số điện thoại được giữ tối đa bấy nhiêu đơn chưa thanh toán cùng lúc.'],
      [CD.toiDaLan, 30, 'Chống spam: quá số lượt này trong 10 phút thì tạm ngừng giữ chỗ tự động (khách vẫn đặt được, Ms Nguyên kiểm tra tay).']
    ]);
    cd.getRange('A1:C1').setFontWeight('bold');
    cd.setColumnWidth(1, 300); cd.setColumnWidth(2, 160); cd.setColumnWidth(3, 620);
  }
  var sc = layTab(TAB.soCho);
  if (sc.getLastRow() < 1) {
    sc.getRange(1, 1, 1, 4).setValues([['Tàu (mã)', 'Ngày đi', 'Số chỗ', 'Ghi chú']]).setFontWeight('bold');
    sc.getRange('B:B').setNumberFormat('@');
    sc.getRange('E1').setValue('Ví dụ: indochina-queen | 2026-12-31 | 0  → đóng ngày đó. Số chỗ để trống thì dòng không có tác dụng.');
    themChonTau(sc.getRange('A2:A'));
  }
  var don = layTab(TAB.don);
  if (don.getLastRow() < 1) {
    don.getRange(1, 1, 1, TIEU_DE_DON.length).setValues([TIEU_DE_DON]).setFontWeight('bold');
    don.setFrozenRows(1);
    // Ngày đi và SĐT để dạng chữ (giữ số 0 đầu SĐT, không tự đổi ngày).
    don.getRange('C:C').setNumberFormat('@');
    don.getRange('L:L').setNumberFormat('@');
    don.getRange('I:J').setNumberFormat('dd/MM/yyyy HH:mm');
    themChonTau(don.getRange('B2:B'));
    don.getRange('H2:H').setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList([TT.giu, TT.choXN, TT.daTT, TT.huy, TT.hetHan], true).setAllowInvalid(false).build());
  }
  layTab(TAB.tongHop);
  // Mỗi 15 phút tự đổi đơn quá hạn sang "Hết hạn" (để nhìn bảng cho dễ; web đã tự không tính đơn quá hạn).
  var coRoi = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'donDepHetHan'; });
  if (!coRoi) ScriptApp.newTrigger('donDepHetHan').timeBased().everyMinutes(15).create();
  capNhatTongHop();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Vé Tàu')
    .addItem('Xem chỗ còn lại 45 ngày tới', 'capNhatTongHop')
    .addItem('Trả chỗ các đơn quá hạn ngay', 'donDepHetHan')
    .addItem('Hủy các đơn chưa thanh toán của một SĐT (Giữ chỗ + Chờ xác nhận, khi bị spam)', 'huyTheoSdt')
    .addItem('Hủy TẤT CẢ đơn "Giữ chỗ" chưa chuyển khoản (khi bị spam)', 'huyTatCaGiuCho')
    .addItem('Cài đặt lần đầu', 'caiDat')
    .addToUi();
}

/* ---------- Web gọi vào ---------- */
// GET ?action=lich&tau=<mã tàu>&thang=YYYY-MM&khach=<người lớn + trẻ tính vé>&be=<bé miễn phí>
// → { ok: true, het: ['2026-10-25', ...] }  (ngày không đủ chỗ cho số khách đó)
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'lich') return traJson(lichThang(p.tau, p.thang, p.khach, p.be));
    return traJson({ ok: false, loi: 'action' });
  } catch (loi) {
    return traJson({ ok: false, loi: 'may-chu' });
  }
}

// POST (body JSON dạng text):
//   { action: 'giu', maDon, tau, ngay, nguoiLon, treEm, beMienPhi, hoTen, sdt }   khách sang bước thanh toán
//   { action: 'daChuyen', maDon, sdt }                                          khách bấm "Tôi đã chuyển khoản"
//   { action: 'xacNhan', maDon, ma }                                            Ms Nguyên đã kiểm tra tiền (ma = Mã quản lý)
function doPost(e) {
  var duLieu;
  try { duLieu = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (loi) { return traJson({ ok: false, loi: 'du-lieu' }); }
  var khoa = LockService.getScriptLock();
  if (!khoa.tryLock(8000)) return traJson({ ok: false, loi: 'ban' });
  try {
    if (duLieu.action === 'giu') return traJson(giuCho(duLieu));
    if (duLieu.action === 'daChuyen') return traJson(baoDaChuyen(duLieu));
    if (duLieu.action === 'xacNhan') return traJson(xacNhanThanhToan(duLieu));
    return traJson({ ok: false, loi: 'action' });
  } catch (loi) {
    return traJson({ ok: false, loi: 'may-chu' });
  } finally {
    // Ghi hết vào Sheet rồi mới mở khoá, để yêu cầu kế tiếp đọc đúng số chỗ (không bán quá chỗ).
    SpreadsheetApp.flush();
    khoa.releaseLock();
  }
}

function lichThang(tau, thang, khach, be) {
  if (DS_TAU.indexOf(tau) === -1 || !/^\d{4}-\d{2}$/.test(String(thang || ''))) return { ok: false, loi: 'tham-so' };
  var bang = docBang();
  var toiDa = Number(bang.caiDat[CD.toiDaKhach]) || 20;
  // Giới hạn theo mức tối đa mỗi đơn: không dò được con số còn lại chính xác.
  var can = Math.max(1, Math.min(toiDa, (parseInt(khach, 10) || 1) + (laCo(bang.caiDat[CD.tinhBe]) ? soNguyen(be) : 0)));
  var nam = Number(thang.slice(0, 4)), th = Number(thang.slice(5, 7));
  var soNgay = new Date(nam, th, 0).getDate();
  var het = [];
  for (var d = 1; d <= soNgay; d++) {
    var ngay = thang + '-' + (d < 10 ? '0' : '') + d;
    if (conLai(bang, tau, ngay, '') < can) het.push(ngay);
  }
  return { ok: true, het: het };
}

function giuCho(d) {
  var maDon = String(d.maDon || '').trim().toUpperCase();
  var tau = String(d.tau || '');
  var ngay = String(d.ngay || '');
  var nguoiLon = soNguyen(d.nguoiLon), treEm = soNguyen(d.treEm), beMienPhi = soNguyen(d.beMienPhi);
  var sdt = chuanSdt(d.sdt);
  if (!/^VT\d{6}[A-Z0-9]{4}$/.test(maDon) || DS_TAU.indexOf(tau) === -1 || !laNgay(ngay) || !sdt) return { ok: false, loi: 'du-lieu' };
  if (nguoiLon + treEm + beMienPhi < 1) return { ok: false, loi: 'du-lieu' };
  // Mã đơn mang ngày đặt (VTyyMMdd…): chỉ nhận đơn tạo hôm qua, hôm nay hoặc ngày mai (máy khách ở múi giờ khác).
  var homNay = Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd');
  var homQua = Utilities.formatDate(new Date(Date.now() - 86400000), MUI_GIO, 'yyyy-MM-dd');
  var ngayMai = Utilities.formatDate(new Date(Date.now() + 86400000), MUI_GIO, 'yyyy-MM-dd');
  var ngayMa = '20' + maDon.slice(2, 4) + '-' + maDon.slice(4, 6) + '-' + maDon.slice(6, 8);
  if (ngayMa !== homNay && ngayMa !== homQua && ngayMa !== ngayMai) return { ok: false, loi: 'du-lieu' };
  if (ngay < homNay) return { ok: false, loi: 'ngay-qua' };
  var bang = docBang();
  var cd = bang.caiDat;
  if ((Number(cd[CD.chanGio]) || 0) > 0 && gioDenNgayDi(ngay) < Number(cd[CD.chanGio])) return { ok: false, loi: 'sat-gio' };
  var soCho = nguoiLon + treEm + (laCo(cd[CD.tinhBe]) ? beMienPhi : 0);
  if (soCho > (Number(cd[CD.toiDaKhach]) || 20)) return { ok: false, loi: 'doan-dong' };
  var viTri = timDongDon(bang, maDon);
  var cu = viTri > 0 ? bang.don[viTri - 2] : null;
  if (cu && (cu.trangThai === TT.daTT || cu.trangThai === TT.choXN)) {
    if (cu.tau !== tau || cu.ngay !== ngay) return { ok: false, loi: 'da-chuyen' };
    return { ok: true, giuDen: null, daChuyen: true };
  }
  // Chống spam: số đơn đang giữ của SĐT này, và tổng lượt giữ chỗ trong 10 phút.
  var bayGio = Date.now();
  var dangGiu = 0;
  for (var i = 0; i < bang.don.length; i++) {
    var x = bang.don[i];
    if (x.sdt === sdt && x.maDon !== maDon && ((x.trangThai === TT.giu && x.giuDen > bayGio) || x.trangThai === TT.choXN)) dangGiu++;
  }
  if (dangGiu >= (Number(cd[CD.toiDaDonSdt]) || 2)) return { ok: false, loi: 'nhieu-don' };
  if (!demLuot(Number(cd[CD.toiDaLan]) || 30)) return { ok: false, loi: 'ban' };
  var tab = layTab(TAB.don);
  // Cùng mã đơn (khách quay lại sửa đơn): không tính chỗ của chính đơn đó khi kiểm tra.
  if (conLai(bang, tau, ngay, maDon) < soCho) {
    // Không giữ được ngày mới: trả luôn chỗ của ngày cũ mà đơn này đang giữ.
    if (cu && cu.trangThai === TT.giu) tab.getRange(viTri, COT.trangThai).setValue(TT.huy);
    return { ok: false, loi: 'het' };
  }
  var gio = Number(cd[CD.gioGiu]) || 1;
  var giuDen = new Date(bayGio + gio * 3600 * 1000);
  var dong = [maDon, tau, ngay, nguoiLon, treEm, beMienPhi, soCho, TT.giu, giuDen, new Date(bayGio), chuSach(d.hoTen, 100), sdt, ''];
  if (viTri > 0) tab.getRange(viTri, 1, 1, dong.length).setValues([dong]);
  else { tab.appendRow(dong); viTri = tab.getLastRow(); }
  tab.getRange(viTri, COT.ngay).setNumberFormat('@').setValue(ngay);
  tab.getRange(viTri, COT.sdt).setNumberFormat('@').setValue(sdt);
  return { ok: true, giuDen: giuDen.toISOString(), gio: gio };
}

// Khách bấm "Tôi đã chuyển khoản": giữ chỗ tới khi Ms Nguyên kiểm tra (không tự hết hạn nữa).
function baoDaChuyen(d) {
  var maDon = String(d.maDon || '').trim().toUpperCase();
  var bang = docBang();
  var viTri = timDongDon(bang, maDon);
  if (viTri < 0) return { ok: false, loi: 'khong-co-don' };
  var don = bang.don[viTri - 2];
  if (don.sdt && chuanSdt(d.sdt) !== don.sdt) return { ok: false, loi: 'du-lieu' };
  if (don.trangThai === TT.daTT || don.trangThai === TT.choXN) return { ok: true };
  if (don.trangThai === TT.huy) return { ok: false, loi: 'da-huy' };
  // Đã quá hạn giữ chỗ: vẫn ghi nhận (khách đã trả tiền), báo số chỗ vượt để Ms Nguyên kiểm tra với tàu.
  var vuot = 0;
  if (don.trangThai !== TT.giu || don.giuDen <= Date.now()) vuot = Math.max(0, don.soCho - conLai(bang, don.tau, don.ngay, maDon));
  layTab(TAB.don).getRange(viTri, COT.trangThai).setValue(TT.choXN);
  return vuot > 0 ? { ok: true, vuot: vuot } : { ok: true };
}

function xacNhanThanhToan(d) {
  var bang = docBang();
  var ma = String(bang.caiDat[CD.ma] || '');
  if (!ma || String(d.ma || '') !== ma) return { ok: false, loi: 'ma' };
  var maDon = String(d.maDon || '').trim().toUpperCase();
  var viTri = timDongDon(bang, maDon);
  if (viTri < 0) return { ok: false, loi: 'khong-co-don' };
  var don = bang.don[viTri - 2];
  var kq = { ok: true };
  if (don.trangThai === TT.huy) kq.daHuy = true;
  // Đơn không còn chiếm chỗ (quá hạn / đã hủy): xác nhận có thể làm vượt số chỗ.
  if (!chiemCho(don, Date.now())) {
    var vuot = don.soCho - conLai(bang, don.tau, don.ngay, maDon);
    if (vuot > 0) kq.vuot = vuot;
  }
  layTab(TAB.don).getRange(viTri, COT.trangThai).setValue(TT.daTT);
  return kq;
}

/* ---------- Tính chỗ ---------- */
function docBang() {
  var caiDat = {};
  var cd = layTab(TAB.caiDat).getDataRange().getValues();
  for (var i = 1; i < cd.length; i++) caiDat[String(cd[i][0]).trim()] = cd[i][1];
  var tinhBe = laCo(caiDat[CD.tinhBe]);
  var soChoRieng = {};
  var sc = layTab(TAB.soCho).getDataRange().getValues();
  for (var j = 1; j < sc.length; j++) {
    var t = String(sc[j][0]).trim(), n = chuanNgay(sc[j][1]);
    if (t && n && sc[j][2] !== '' && sc[j][2] !== null && !isNaN(Number(sc[j][2]))) soChoRieng[t + '|' + n] = Number(sc[j][2]);
  }
  var don = [];
  var dd = layTab(TAB.don).getDataRange().getValues();
  for (var k = 1; k < dd.length; k++) {
    var r = dd[k];
    var soCho = r[COT.soCho - 1];
    // Đơn nhập tay để trống cột "Số chỗ": lấy người lớn + trẻ em (+ bé nếu cài đặt tính bé).
    if (soCho === '' || soCho === null || isNaN(Number(soCho))) {
      soCho = soNguyen(r[COT.nguoiLon - 1]) + soNguyen(r[COT.treEm - 1]) + (tinhBe ? soNguyen(r[COT.beMienPhi - 1]) : 0);
    }
    var giuDen = r[COT.giuDen - 1];
    don.push({
      maDon: String(r[COT.maDon - 1]).trim().toUpperCase(), tau: String(r[COT.tau - 1]).trim(), ngay: chuanNgay(r[COT.ngay - 1]),
      soCho: Number(soCho) || 0, trangThai: chuanTrangThai(r[COT.trangThai - 1]),
      // Đơn "Giữ chỗ" nhập tay không ghi "Giữ đến": coi như giữ tới khi người quản lý đổi trạng thái.
      giuDen: giuDen instanceof Date ? giuDen.getTime() : Infinity,
      sdt: chuanSdt(r[COT.sdt - 1])
    });
  }
  return { caiDat: caiDat, soChoRieng: soChoRieng, don: don };
}

function chiemCho(d, bayGio) {
  if (d.trangThai === TT.huy || d.trangThai === TT.hetHan) return false;
  if (d.trangThai === TT.giu) return d.giuDen > bayGio;
  return true; // Đã thanh toán, Chờ xác nhận, hoặc trạng thái lạ (an toàn: coi là đang chiếm chỗ)
}

function conLai(bang, tau, ngay, boQuaMaDon) {
  var khoa = tau + '|' + ngay;
  var tong = Object.prototype.hasOwnProperty.call(bang.soChoRieng, khoa) ? bang.soChoRieng[khoa] : (Number(bang.caiDat[CD.soCho]) || 0);
  var bayGio = Date.now();
  for (var i = 0; i < bang.don.length; i++) {
    var d = bang.don[i];
    if (d.tau !== tau || d.ngay !== ngay || (boQuaMaDon && d.maDon === boQuaMaDon)) continue;
    if (chiemCho(d, bayGio)) tong -= d.soCho;
  }
  return tong;
}

// Đổi đơn "Giữ chỗ" quá hạn sang "Hết hạn". Có khoá để không ghi đè đơn vừa được xác nhận.
function donDepHetHan() {
  var khoa = LockService.getScriptLock();
  if (!khoa.tryLock(20000)) return;
  try {
    var tab = layTab(TAB.don);
    var dd = tab.getDataRange().getValues();
    if (dd.length < 2) return;
    var bayGio = Date.now();
    // Chỉ ghi ô thật sự đổi (không ghi đè cả cột, tránh mất chữ Ms Nguyên đang gõ tay).
    for (var i = 1; i < dd.length; i++) {
      var giuDen = dd[i][COT.giuDen - 1];
      if (chuanTrangThai(dd[i][COT.trangThai - 1]) === TT.giu && giuDen instanceof Date && giuDen.getTime() <= bayGio) {
        tab.getRange(i + 1, COT.trangThai).setValue(TT.hetHan);
      }
    }
    SpreadsheetApp.flush();
  } finally {
    khoa.releaseLock();
  }
}

// Menu: hủy các đơn "Giữ chỗ" (chưa chuyển khoản) của một SĐT.
function huyTheoSdt() {
  var ui = SpreadsheetApp.getUi();
  var tl = ui.prompt('Hủy đơn chưa thanh toán theo SĐT', 'Nhập số điện thoại (hủy cả đơn "Giữ chỗ" và "Chờ xác nhận" của số này):', ui.ButtonSet.OK_CANCEL);
  if (tl.getSelectedButton() !== ui.Button.OK) return;
  var so = huyGiuCho(chuanSdt(tl.getResponseText()), true);
  ui.alert('Đã hủy ' + so + ' đơn.');
}
function huyTatCaGiuCho() {
  var ui = SpreadsheetApp.getUi();
  if (ui.alert('Hủy TẤT CẢ đơn đang "Giữ chỗ" (khách chưa bấm đã chuyển khoản)?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  ui.alert('Đã hủy ' + huyGiuCho('*') + ' đơn.');
}
// sdt = '*': mọi SĐT (chỉ hủy "Giữ chỗ"). caChoXN = true: hủy cả "Chờ xác nhận" của SĐT đó.
function huyGiuCho(sdt, caChoXN) {
  if (!sdt) return 0;
  var khoa = LockService.getScriptLock();
  if (!khoa.tryLock(20000)) return 0;
  try {
    var tab = layTab(TAB.don);
    var dd = tab.getDataRange().getValues();
    var so = 0;
    for (var i = 1; i < dd.length; i++) {
      var tt = chuanTrangThai(dd[i][COT.trangThai - 1]);
      var dungSdt = sdt === '*' || chuanSdt(dd[i][COT.sdt - 1]) === sdt;
      if (dungSdt && (tt === TT.giu || (caChoXN && sdt !== '*' && tt === TT.choXN))) {
        tab.getRange(i + 1, COT.trangThai).setValue(TT.huy);
        so++;
      }
    }
    SpreadsheetApp.flush();
    return so;
  } finally {
    khoa.releaseLock();
  }
}

// Tab "Tổng hợp": số chỗ còn lại của từng tàu trong 45 ngày tới (chỉ người quản lý xem). Số âm = đang vượt số chỗ.
function capNhatTongHop() {
  var bang = docBang();
  var tab = layTab(TAB.tongHop);
  tab.clear();
  var dong = [['Ngày'].concat(DS_TAU.map(function (t) { return TEN_TAU[t]; }))];
  var bayGio = new Date();
  for (var i = 0; i < 45; i++) {
    var ngay = Utilities.formatDate(new Date(bayGio.getTime() + i * 86400000), MUI_GIO, 'yyyy-MM-dd');
    dong.push([ngay].concat(DS_TAU.map(function (t) { return conLai(bang, t, ngay, ''); })));
  }
  tab.getRange(1, 1, dong.length, dong[0].length).setValues(dong);
  tab.getRange(1, 1, 1, dong[0].length).setFontWeight('bold');
  tab.getRange(2, 1, dong.length - 1, 1).setNumberFormat('@');
  tab.setFrozenRows(1);
  tab.getRange(1, dong[0].length + 2).setValue('Cập nhật lúc ' + Utilities.formatDate(bayGio, MUI_GIO, 'dd/MM/yyyy HH:mm') +
    ' (menu Vé Tàu > Xem chỗ còn lại để làm mới). Số âm = đang vượt số chỗ, cần kiểm tra với tàu.');
}

/* ---------- Tiện ích ---------- */
function layTab(ten) {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(ten) || ss.insertSheet(ten);
}
function themChonTau(vung) {
  vung.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(DS_TAU, true).setAllowInvalid(false).build());
}
function traJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// Đếm lượt giữ chỗ toàn web trong 10 phút; quá giới hạn thì trả false.
function demLuot(toiDa) {
  var cache = CacheService.getScriptCache();
  var khoa = 'luot-' + Math.floor(Date.now() / 600000);
  var so = Number(cache.get(khoa)) || 0;
  if (so >= toiDa) return false;
  cache.put(khoa, String(so + 1), 700);
  return true;
}
function soNguyen(x) { var n = parseInt(x, 10); return isNaN(n) || n < 0 ? 0 : n; }
function laNgay(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00').getTime()); }
function laCo(x) { return /^(có|co|yes|x|true|1)$/i.test(String(x).trim()); }
// SĐT về dạng 0xxxxxxxxx (Sheet có thể đã bỏ số 0 đầu, hoặc khách gõ +84).
function chuanSdt(x) {
  var s = String(x === null || x === undefined ? '' : x).replace(/[^\d+]/g, '');
  if (s.indexOf('+84') === 0) s = '0' + s.slice(3);
  else if (s.indexOf('84') === 0 && s.length === 11) s = '0' + s.slice(2);
  else if (/^[1-9]\d{8}$/.test(s)) s = '0' + s;
  return /^0\d{9}$/.test(s) ? s : '';
}
// Ngày gõ tay trong Sheet có thể là kiểu Date hoặc chữ 25/10/2026: đưa về 2026-10-25.
function chuanNgay(v) {
  if (v instanceof Date) return Utilities.formatDate(v, MUI_GIO, 'yyyy-MM-dd');
  var s = String(v || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  return m ? m[3] + '-' + (m[2].length < 2 ? '0' : '') + m[2] + '-' + (m[1].length < 2 ? '0' : '') + m[1] : '';
}
// Trạng thái gõ tay: "Hủy", "Hết hạn" mới trả chỗ; chữ lạ (vd "chưa thanh toán") coi là đang chiếm chỗ.
function chuanTrangThai(v) {
  var s = String(v || '').trim().toLowerCase();
  if (/hủy|huỷ|huy/.test(s)) return TT.huy;
  if (/hết hạn|het han/.test(s)) return TT.hetHan;
  if (/chưa|chua/.test(s)) return TT.choXN;
  if (/thanh toán|thanh toan/.test(s)) return TT.daTT;
  if (/chờ|cho xac|xác nhận/.test(s)) return TT.choXN;
  if (/giữ|giu/.test(s)) return TT.giu;
  return 'khac';
}
function timDongDon(bang, maDon) {
  if (!maDon) return -1;
  for (var i = 0; i < bang.don.length; i++) if (bang.don[i].maDon === maDon) return i + 2;
  return -1;
}
// Số giờ từ bây giờ tới 18h00 ngày đi (giờ VN).
function gioDenNgayDi(ngay) {
  var moc = new Date(ngay + 'T18:00:00+07:00').getTime();
  return (moc - Date.now()) / 3600000;
}
// Chữ khách gõ: cắt ngắn, chặn công thức (=, +, -, @ ở đầu) để Sheet không chạy như công thức.
function chuSach(x, toiDa) {
  var s = String(x || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, toiDa);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function taoMaBiMat() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}
