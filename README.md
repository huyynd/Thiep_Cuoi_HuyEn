# Thiệp cưới Huy & En — Website React + Vite

Website thiệp cưới **frontend tĩnh**, tông hồng pastel, có đường link cá nhân hóa theo từng khách. **Không cần backend hoặc database**.

## Công nghệ và tính năng
- React 19 + Vite 6 + Lucide Icons.
- Tối ưu giao diện trên điện thoại.
- Mỗi khách có URL dạng `/moi/anh-nguyen-van-nam-k001` và tên hiển thị trong thiệp.
- Tạo hàng loạt link từ `data/guests.csv` (mở bằng Excel, lưu dưới dạng CSV UTF-8).
- Tạo HTML riêng cho từng khách khi build nhằm hỗ trợ tiêu đề xem trước khi gửi Zalo/Facebook.
- Đếm ngược ngày cưới, thêm album ảnh/nhạc, nút chỉ đường và lưu lịch.
- Không có chức năng RSVP (xác nhận tham dự). Muốn lưu RSVP cần một dịch vụ bên ngoài.

## Chạy trên Windows

Cài Node.js phiên bản **20.19+** và VS Code. Trong thư mục gốc chạy:

```powershell
npm install
npm run dev
```

Mở `http://localhost:5173` hoặc link mà Vite hiển thị.

Để kiểm tra tên khách mẫu, mở:

`http://localhost:5173/moi/anh-nguyen-van-nam-k001`

## Cập nhật thông tin cưới

Mở `src/config/wedding.js` và chỉnh:
- `groom`, `bride`: tên chú rể và cô dâu.
- `dateISO`: thời gian có múi giờ, ví dụ `2026-12-20T17:30:00+07:00`.
- `dateLabel`, `hourLabel`: thời gian hiển thị.
- `venue`, `address`, `mapsUrl`: địa điểm.
- `siteUrl`: URL **chính thức** của website sau deploy, không có dấu / ở cuối.
- `photos`: mảng đường dẫn ảnh.
- `musicUrl`: đường dẫn file MP3.
- `shareImageUrl`: đường dẫn URL HTTPS tuyệt đối tới ảnh bìa khi chia sẻ.

**Tất cả dữ liệu trong repo hiện là ví dụ; phải đổi thành thông tin thật trước khi gửi link.**

### Ảnh, nhạc và chia sẻ

Đặt ảnh vào `public/photos/`. Ví dụ: `photos: ['/photos/anh-1.webp', '/photos/anh-2.webp']`.

Đặt nhạc vào `public/music/`. Ví dụ: `musicUrl: '/music/nhac-nen.mp3'`. Chỉ dùng bản nhạc bạn có quyền sử dụng. Trình duyệt điện thoại thường yêu cầu khách nhấn nút mới phát được.

Để hình xem trước trên Zalo/Facebook đẹp, thêm ảnh bìa ngang và cấu hình `shareImageUrl`; lưu ý các nền tảng có thể cache ảnh/tiêu đề.

## Quản lý khách và sinh link

Mở `data/guests.csv`. Các cột:

| ma | ten_hien_thi |
|---|---|
| K001 | Anh Nguyễn Văn Nam |
| K002 | Chị Trần Thị Lan |
| K003 | Gia đình anh Phạm Đức Minh |

Mỗi khách có **mã riêng không trùng**, đặc biệt khi khách trùng tên. Lưu CSV dưới dạng UTF-8.

Tạo/cập nhật danh sách:

```powershell
npm run links
```

Script sinh `src/data/guests.generated.json` và `danh-sach-link.csv` với từng URL. Khi chạy `npm run dev` hoặc `npm run build`, dữ liệu cũng được đồng bộ từ CSV.

## Build và chạy thử bản production

```powershell
npm run build
npm run preview
```

Vite sẽ build các file tĩnh trong `dist/`. Sau đó `scripts/build-invite-pages.mjs` sinh các file `dist/moi/<slug>.html`, một trang cho mỗi khách, để mỗi link có `<title>` và meta description cá nhân hóa.

## Deploy lên Vercel

1. Đăng nhập [Vercel](https://vercel.com/new).
2. Chọn **Add New Project**, import repo `huyynd/Thiep_Cuoi_HuyEn`.
3. Framework: **Vite**. Root Directory: thư mục gốc.
4. Build Command: `npm run build`. Output Directory: `dist`.
5. Deploy, sau đó lấy URL Vercel thực tế.
6. Cập nhật `siteUrl` trong `src/config/wedding.js` rồi push lên GitHub và deploy lại.
7. Chạy `npm run links`, dùng `danh-sach-link.csv` để gửi link riêng qua Zalo.

**Quan trọng:** Chỉ gửi link sau khi cấu hình domain thật, nội dung cưới thật, ảnh và kiểm thử thực tế trên Vercel. Vercel Hobby dành cho mục đích cá nhân/phi thương mại.

## Cấu trúc dự án

```
├── data/guests.csv
├── public/music/
├── public/photos/
├── scripts/build-invite-pages.mjs
├── scripts/sync-guests.mjs
├── src/config/wedding.js
├── src/data/guests.generated.json
├── src/App.jsx
├── src/main.jsx
├── src/styles.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Giới hạn và lưu ý riêng tư

- Tên khách mời và link được lưu trong nguồn tĩnh, không phải dữ liệu riêng tư có kiểm soát truy cập.
- Ai có URL hoặc đọc source công khai đều có khả năng biết tên; không dùng cách này để lưu thông tin nhạy cảm.
- Chưa triển khai RSVP, bảng quản trị, thống kê lượt truy cập hay đăng nhập.
- Trong lần chuẩn bị mã nguồn, môi trường không tải được npm nên hãy chạy `npm install` và `npm run build` để kiểm chứng trước khi phát hành.
