/**
 * CHỈNH THÔNG TIN ĐÁM CƯỚI TẠI ĐÂY.
 * Các tên, thời gian, địa chỉ bên dưới là DỮ LIỆU MẪU.
 */
export const wedding = {
  groom: 'Đức Huy',
  bride: 'Bùi Yến',
  // Thời gian chính thức (tiệc mời khách). Giữ định dạng ISO và múi giờ Việt Nam (+07:00).
  dateISO: '2026-12-27T17:30:00+07:00',
  // Ngày mời tiệc cưới:
  partyDateLabel: 'Chủ Nhật · 27 tháng 12, 2026',
  partyHourLabel: '17:30',
  // Ngày lễ thành hôn & đón dâu:
  ceremonyDateLabel: 'Thứ Hai · 28 tháng 12, 2026',
  ceremonyHourLabel: 'Lễ thành hôn & đón dâu',
  // Nhãn hiển thị chung:
  dateLabel: 'Chủ Nhật · 27 tháng 12, 2026',
  hourLabel: '17:30',
  // Địa điểm tổ chức: Tư gia nhà trai & Tư gia nhà gái
  groomHouse: {
    title: 'Tư gia nhà trai',
    host: 'Nhà Chú Rể Đức Huy',
    address: 'Bấm nút bên dưới để mở vị trí trên Google Maps',
    mapsUrl: 'https://maps.app.goo.gl/3EjJ7uw3DarNp7Py8'
  },
  brideHouse: {
    title: 'Tư gia nhà gái',
    host: 'Nhà Cô Dâu Bùi Yến',
    address: 'Bấm nút bên dưới để mở vị trí trên Google Maps',
    mapsUrl: 'https://maps.app.goo.gl/YsBMfjM8U3YQrUXi7'
  },
  venue: 'Tư gia nhà trai & Tư gia nhà gái',
  address: 'Bấm nút chỉ đường của từng nhà để mở Google Maps',
  mapsUrl: 'https://maps.app.goo.gl/3EjJ7uw3DarNp7Py8',
  message: 'Sự hiện diện của bạn là niềm hạnh phúc và vinh dự lớn đối với gia đình chúng mình.',
  // URL Vercel CHÍNH THỨC sau khi triển khai (không có dấu / cuối).
  siteUrl: 'https://thiep-cuoi-huy-en.vercel.app',
  // Đặt ảnh trong public/photos/ và nhập đường dẫn, ví dụ '/photos/anh-1.jpg'.
  photos: [],
  // Không tự phát nhạc: cần khách bấm nút theo quy định của trình duyệt.
  // Đặt file trong public/music/ rồi khai báo '/music/nhac-nen.mp3'.
  musicUrl: '',
  // Ảnh xem trước khi chia sẻ link trên Zalo/Facebook, phải là URL HTTPS đầy đủ.
  // Ví dụ: 'https://ten-mien-cua-ban.vercel.app/photos/anh-bia.jpg'
  shareImageUrl: ''
};
