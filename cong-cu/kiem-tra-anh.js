// Liệt kê ảnh đã có / còn thiếu theo js/cau-hinh.js, và ảnh quá nặng.
// Chạy: node cong-cu/kiem-tra-anh.js
const fs = require('fs');
const path = require('path');
const GOC = path.join(__dirname, '..');
const { CAU_HINH } = require(path.join(GOC, 'js/cau-hinh.js'));
const { DANH_SACH_TAU } = require(path.join(GOC, 'js/du-lieu-tau.js'));
const GIOI_HAN = 500 * 1024;

const nhom = [];
nhom.push(['Logo', [CAU_HINH.logo.header, CAU_HINH.logo.footer].filter((f, i, ds) => ds.indexOf(f) === i)]);
nhom.push(['Ảnh bìa trang chủ', CAU_HINH.anhBia.concat(CAU_HINH.videoBia ? [CAU_HINH.videoBia] : [])]);
for (const t of DANH_SACH_TAU) {
  const a = CAU_HINH.anhTau[t.slug] || {};
  nhom.push([t.ten + ' – ảnh tàu', [a.daiDien].concat(a.thuVien || [], Object.values(a.khuyenMai || {}))]);
  const menu = [];
  for (const bang of Object.values(CAU_HINH.anhThucDon[t.slug] || {})) for (const ds of Object.values(bang)) menu.push(...[].concat(ds));
  nhom.push([t.ten + ' – ảnh menu', menu]);
}

let co = 0, thieu = 0, nang = 0;
for (const [ten, ds] of nhom) {
  const tep = ds.filter(Boolean);
  const daCo = tep.filter((f) => fs.existsSync(path.join(GOC, f)));
  co += daCo.length;
  thieu += tep.length - daCo.length;
  console.log('\n== ' + ten + ': có ' + daCo.length + '/' + tep.length);
  for (const f of tep) {
    const p = path.join(GOC, f);
    if (!fs.existsSync(p)) { console.log('   [thiếu] ' + f); continue; }
    const kb = Math.round(fs.statSync(p).size / 1024);
    if (!/\.mp4$/.test(f) && fs.statSync(p).size > GIOI_HAN) { nang++; console.log('   [NẶNG ' + kb + 'KB, nên < 500KB] ' + f); }
    else console.log('   [có] ' + f + ' (' + kb + 'KB)');
  }
}
console.log('\nTổng: có ' + co + ', thiếu ' + thieu + (nang ? ', quá nặng ' + nang : '') + '.');
if (co > 0) console.log('Nhớ chạy "node cong-cu/tao-trang.js" sau khi thêm ảnh đại diện để link chia sẻ có ảnh xem trước.');

// node cong-cu/kiem-tra-anh.js --tao-thu-muc : tạo đủ thư mục (kèm .gitkeep để git giữ thư mục trống)
// và viết anh/README.md liệt kê tên file cần có trong từng thư mục.
if (process.argv.includes('--tao-thu-muc')) {
  const theoThuMuc = {};
  for (const [, ds] of nhom) {
    for (const f of ds.filter(Boolean)) (theoThuMuc[path.dirname(f)] = theoThuMuc[path.dirname(f)] || []).push(path.basename(f));
  }
  let md = '# Thư mục ảnh của web\n\n' +
    'Chép ảnh vào đúng thư mục với **đúng tên file** dưới đây là web tự hiện, không cần sửa code.\n' +
    'Danh sách lấy từ `js/cau-hinh.js`. Kiểm tra ảnh còn thiếu: `node cong-cu/kiem-tra-anh.js`.\n\n' +
    '- Ảnh JPG, mỗi ảnh < 500KB, rộng tối đa 1600px (logo dùng PNG nền trong suốt).\n' +
    '- `dai-dien.jpg`: ảnh ngoài tàu đẹp nhất (thẻ trang chủ, ảnh lớn trang tàu, ảnh chia sẻ link).\n' +
    '- `tau-01.jpg` … `tau-08.jpg`: thư viện ảnh trong và ngoài tàu (không bắt buộc đủ 8).\n' +
    '- `menu/…`: ảnh thực đơn của từng món, hiện khi khách bấm "Xem menu".\n' +
    '- Ảnh cũ (bị gán sai tàu) nằm trong `anh-cu/` để tham khảo, web không dùng.\n';
  for (const thuMuc of Object.keys(theoThuMuc).sort()) {
    fs.mkdirSync(path.join(GOC, thuMuc), { recursive: true });
    const giu = path.join(GOC, thuMuc, '.gitkeep');
    if (!fs.existsSync(giu)) fs.writeFileSync(giu, '');
    md += '\n## `' + thuMuc + '/`\n\n' + theoThuMuc[thuMuc].map((t) => '- `' + t + '`').join('\n') + '\n';
  }
  fs.mkdirSync(path.join(GOC, 'anh', 'qr'), { recursive: true });
  if (!fs.existsSync(path.join(GOC, 'anh', 'qr', '.gitkeep'))) fs.writeFileSync(path.join(GOC, 'anh', 'qr', '.gitkeep'), '');
  md += '\n## `anh/qr/` (không bắt buộc)\n\nẢnh QR ngân hàng. Chỉ dùng khi điền `anhQR` trong `js/cau-hinh.js`; để trống thì web tự tạo mã VietQR có sẵn số tiền.\n';
  fs.writeFileSync(path.join(GOC, 'anh', 'README.md'), md);
  console.log('Đã tạo thư mục và anh/README.md');
}
