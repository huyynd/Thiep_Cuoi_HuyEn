/**
 * CHỈNH THÔNG TIN ĐÁM CƯỚI TẠI ĐÂY.
 * Các tên, thời gian, địa chỉ bên dưới là DỮ LIỆU MẪU.
 */
export const wedding = {
  groom: 'Minh',
  bride: 'An',
  // Thời gian chính thức. Giữ định dạng ISO và múi giờ Việt Nam (+07:00).
  dateISO: '2026-12-20T17:30:00+07:00',
  // Nội dung mô tả đẹp mắt xuất hiện trên thiệp:
  dateLabel: 'Chủ Nhật · 20 tháng 12, 2026',
  hourLabel: '17:30',
  venue: 'Địa điểm tổ chức tiệc cưới',
  address: 'Hãy cập nhật địa chỉ tổ chức tại src/config/wedding.js',
  // Dán URL Google Maps chính xác; để trống nếu chưa có.
  mapsUrl: '',
  message: 'Sự hiện diện của bạn là niềm hạnh phúc và vinh dự lớn đối với gia đình chúng mình.',
  // URL Vercel CHÍNH THỨC sau khi triển khai (không có dấu / cuối).
  siteUrl: 'https://thiep-cuoi-cua-ban.vercel.app',
  // Đặt ảnh trong public/photos/ và nhập đường dẫn, ví dụ '/photos/anh-1.jpg'.
  photos: [],
  // Không tự phát nhạc: cần khách bấm nút theo quy định của trình duyệt.
  // Đặt file trong public/music/ rồi khai báo '/music/nhac-nen.mp3'.
  musicUrl: '',
  // Ảnh xem trước khi chia sẻ link trên Zalo/Facebook, phải là URL HTTPS đầy đủ.
  // Ví dụ: 'https://ten-mien-cua-ban.vercel.app/photos/anh-bia.jpg'
  shareImageUrl: ''
};
