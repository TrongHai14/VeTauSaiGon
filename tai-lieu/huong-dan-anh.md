# Hướng dẫn đưa ảnh, logo, mã QR vào web

Mọi đường dẫn ảnh đều điền ở **một file duy nhất: `js/cau-hinh.js`**. Không cần sửa file nào khác.

## Cách làm chung

1. Chép ảnh vào thư mục `anh/` (tạo thư mục con nếu cần, ví dụ `anh/logo/`).
2. Mở `js/cau-hinh.js`, điền đường dẫn **tính từ thư mục gốc của web**, đặt trong dấu nháy đơn:
   `'anh/logo/logo-mau.png'`.
3. Lưu file rồi tải lại trang (Ctrl + F5) để xem.

Quy ước:
- Tên file viết thường, không dấu, không khoảng trắng: `menu-indo7.jpg` (đúng), `Menu INDO 7.JPG` (sai).
- Mỗi ảnh nhỏ hơn **500KB**. Ảnh rộng tối đa 1600px là đủ nét.
- Ô nào chưa có ảnh thì để trống (`''` hoặc `[]`): web tự dùng ảnh hoặc biểu tượng mặc định, không bị lỗi.

## 1. Logo (header và footer)

```js
logo: {
  header: 'anh/logo/logo-mau.png',   // logo màu, nền trong suốt, hiện cao 40px
  footer: 'anh/logo/logo-trang.png'  // logo màu trắng cho nền xanh đậm, hiện cao 48px
},
```

- Nên dùng PNG hoặc SVG **nền trong suốt**, ảnh cao khoảng 120–160px.
- Chỉ có 1 bản logo thì điền vào `header`. Footer sẽ tự dùng lại logo đó.

## 2. Ảnh bìa chuyển động (trang chủ)

```js
anhBia: [
  'anh/bia/bia-01.jpg',
  'anh/bia/bia-02.jpg',
  'anh/bia/bia-03.jpg'
],
videoBia: '',   // hoặc 'anh/bia/video-bia.mp4'
```

- Các ảnh tự chạy lần lượt mỗi 6 giây, mờ dần và phóng nhẹ. Khách bấm chấm tròn để chuyển ảnh.
- Nên dùng ảnh **ngang**, rộng ≥ 1600px. Ảnh tàu ban đêm, đèn sáng là đẹp nhất. Phần giữa và phía dưới ảnh sẽ bị chữ và ô tìm kiếm che, nên chọn ảnh có chủ thể nằm phía trên hoặc hai bên.
- Muốn dùng **video** thì điền `videoBia`: file .mp4 dài 10–20 giây, nhỏ hơn 5MB, không cần tiếng. Khi có video, video thay cho ảnh bìa. Ảnh đầu tiên trong `anhBia` vẫn dùng làm hình chờ trong lúc video đang tải.
- Hiện đang tạm dùng ảnh của 4 tàu.

## 3. Mã QR thanh toán

Web **tự tạo mã QR** (VietQR) có sẵn số tiền và nội dung chuyển khoản cho từng đơn. Không có ảnh QR thì web vẫn chạy được.

Nếu muốn dùng ảnh QR của ngân hàng thì điền `anhQR`:

```js
caNhan: { ..., anhQR: 'anh/qr/qr-ca-nhan.png' },
congTy: { ..., anhQR: 'anh/qr/qr-cong-ty.png' }
```

Lưu ý: ảnh QR tĩnh **không chứa số tiền**, nên khách phải tự nhập số tiền và nội dung. Vì vậy nên để trống `anhQR` và dùng QR tự tạo.

Số tài khoản, chủ tài khoản và ngân hàng cũng sửa trong `thanhToan`. `maNganHang` là mã BIN VietQR, ACB = `970416`.

## 4. Ảnh thực đơn cho từng món

Mỗi món khách chọn (Buffet Tầng 1, INDO7, 3 món – Việt Nam…) có một ô ảnh riêng trong `anhThucDon`. Đã liệt kê sẵn đủ món của 6 tàu, chỉ cần điền vào `[]`:

```js
'indochina-queen': {
  'Buffet': {
    'Tầng 1': ['anh/indochina-queen/menu-buffet-1.jpg'],
    ...
  },
  'Set menu': {
    'INDO7': ['anh/indochina-queen/menu-indo7.jpg'],
    'INDO8': ['anh/indochina-queen/menu-indo8-a.jpg', 'anh/indochina-queen/menu-indo8-b.jpg'],
    ...
```

- Một món có thể có nhiều ảnh, cách nhau bằng dấu phẩy.
- Ảnh đầu tiên của món hiện thành ảnh nhỏ cạnh tên món. Khi khách bấm "Xem menu" thì mở tất cả ảnh của món đó.
- Món chưa có ảnh: nút "Xem menu" mở toàn bộ ảnh menu chung đang có của tàu (`anh/<tàu>/menu-01.jpg`…).
- **Không sửa tên món** bên trái dấu `:`. Tên món phải khớp với bảng giá trong `js/du-lieu-tau.js`.

Ảnh menu chung đang có trong thư mục `anh/`. Có thể dùng lại các ảnh này bằng cách điền đường dẫn vào đúng món:

| Tàu | Ảnh menu đang có | Số món cần ảnh |
|---|---|---|
| Indochina Star | `anh/indochina-star/menu-01.jpg` … `menu-03.jpg` | 2 (Buffet Tầng 1, Tầng 2) |
| Bến Nghé | `anh/ben-nghe/menu-01.jpg` … `menu-11.jpg` | 1 (Buffet) |
| Indochina Queen | `anh/indochina-queen/menu-01.jpg` … `menu-13.jpg` | 3 buffet + 11 set menu (INDO7–INDO17) |
| Elite of Saigon | `anh/elite-of-saigon/menu-01.jpg` … `menu-14.jpg` | 1 buffet + 6 set menu |
| Saigon Princess | `anh/saigon-princess/menu-01.jpg` … `menu-20.jpg` | 20 set menu |
| Bến Thành Princess | `anh/ben-thanh-princess/menu-01.jpg` … `menu-20.jpg` | 20 set menu |

## 5. Còn thiếu dữ liệu (không phải ảnh)

- **Bến Nghé – Set menu**: web đang ghi "Set menu từ 469.000đ" nhưng chưa có danh sách từng set và giá. Cần tên từng set menu và giá mỗi khách. Có rồi thì thêm vào `bangGia` của Bến Nghé trong `js/du-lieu-tau.js`, theo cách ghi của Indochina Queen.
- **Giới thiệu công ty** ở chân trang: sửa câu `gioiThieuCongTy` trong `js/cau-hinh.js`.

## Sửa header/footer hoặc thêm tàu

Header và footer nằm trong `cong-cu/tao-trang.js`. Sửa xong, chạy lệnh sau để tạo lại tất cả trang HTML:

```
node cong-cu/tao-trang.js
```

## Sửa nội dung chính sách (trẻ em, điều kiện vé, đổi trả, hướng dẫn, lưu ý)

Nội dung nằm trong `CHINH_SACH_CHUNG` ở cuối file `js/du-lieu-tau.js`. Có 3 chỗ dùng nội dung này:
- trang `chinh-sach.html`,
- mục "Điều kiện vé & chính sách" trên trang từng tàu,
- phần "Giá vé bao gồm / không bao gồm" trên phiếu xác nhận.

Sửa xong thì chạy `node cong-cu/tao-trang.js` để tạo lại trang `chinh-sach.html`.
