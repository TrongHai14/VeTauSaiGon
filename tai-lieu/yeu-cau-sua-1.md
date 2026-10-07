# Yêu cầu sửa lần 1 (sau review)

Đồng ý với review, nhưng CÓ THAY ĐỔI PHẠM VI. Giao cho coder sửa:

1. `package.json`: đổi lệnh test thành `"node --test"`.

2. Nút "Gửi qua Zalo": sao chép nội dung TRƯỚC rồi mới mở Zalo. Sao chép xong hiện thông báo rõ:
   "Đã sao chép thông tin đặt chỗ. Trong Zalo, nhấn giữ ô nhập tin, chọn Dán rồi gửi."
   Nếu trình duyệt không cho sao chép thì hiện nội dung trong một ô để khách tự chọn và sao chép.

3. Sửa test dò số điện thoại để bắt cả dạng "+84…".

4. THÊM gửi email (thay đổi phạm vi — bỏ quy định cấm `fetch(` cho riêng phần này):
   - Nút "Gửi đặt chỗ qua email" gửi form qua FormSubmit: `https://formsubmit.co/ajax/bookingindochinaqueen@gmail.com`, dùng fetch POST JSON.
   - Tiêu đề email: "Đặt chỗ mới - <tên tàu> - <ngày lên tàu>".
   - Gửi thành công hiện: "Đã gửi, chúng tôi sẽ liên hệ lại sớm". Lỗi thì gợi ý gọi 0948170036.
   - Đặt địa chỉ email trong MỘT hằng số duy nhất để sau này thay bằng mã FormSubmit.
   - Cập nhật test cho phù hợp.

5. Form: đổi nhãn "Ngày" thành "Ngày lên tàu".

6. Bến Thành Princess: đưa "1 ly trà hoặc cà phê sau món chính" vào ghi chú giá vé, bỏ khỏi mục khuyến mãi.

7. Trang tàu: đưa form đặt chỗ lên TRƯỚC khối Liên hệ.

8. Bến Nghé: thẻ ở trang chủ và trang tàu ghi rõ 2 mức giá: "Set menu từ 469.000đ · Buffet 733.320đ".

9. Link SMS dùng dạng `sms:0948170036?&body=...` để chạy trên cả iPhone và Android.

10. Indochina Queen: nếu thư mục `tai-lieu/anh-indochina-queen/` có ảnh thì thêm mục "Ảnh tàu" cho trang Queen (nén mỗi ảnh dưới 500KB như các tàu khác). Nếu thư mục trống hoặc không có thì bỏ qua mục này.

Sửa xong chạy lại tester và reviewer. Không commit, không push.
