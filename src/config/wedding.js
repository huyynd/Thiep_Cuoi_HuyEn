/**
 * CHỈNH THÔNG TIN ĐÁM CƯỚI TẠI ĐÂY.
 * Các tên, thời gian, địa chỉ bên dưới là DỮ LIỆU MẪU.
 */
export const wedding = {
  groom: 'Đức Huy',
  bride: 'Bùi Yến',
  // Thời gian chính thức (tiệc mời khách). Giữ định dạng ISO và múi giờ Việt Nam (+07:00).
  dateISO: '2026-12-27T16:30:00+07:00',
  // Ngày mời tiệc cưới:
  partyDateLabel: 'Chủ Nhật · 27 tháng 12, 2026',
  partyHourLabel: '16:30',
  // Ngày lễ thành hôn & đón dâu:
  ceremonyDateLabel: 'Thứ Hai · 28 tháng 12, 2026',
  ceremonyHourLabel: '09:30',
  // Ngày cưới hiển thị trên lịch lớn.
  calendarDateISO: '2026-12-28T00:00:00+07:00',
  // Nhãn hiển thị chung:
  dateLabel: 'Chủ Nhật · 27 tháng 12, 2026',
  hourLabel: '16:30',
  // Địa điểm tổ chức: Tư gia nhà trai & Tư gia nhà gái
  groomHouse: {
    title: 'Tư gia nhà trai',
    host: 'Nhà Chú Rể Đức Huy',
    address: 'Hạ Chuế, Kim Xá, Vĩnh Tường, Vĩnh Phúc',
    // Tọa độ lấy trực tiếp từ link Google Maps ở dưới để bản đồ nhúng trùng đúng ghim.
    mapQuery: '21.312664,105.487414',
    mapsUrl: 'https://maps.app.goo.gl/3EjJ7uw3DarNp7Py8'
  },
  brideHouse: {
    title: 'Tư gia nhà gái',
    host: 'Nhà Cô Dâu Bùi Yến',
    address: 'Vườn Gấu, Đại Đồng, Vĩnh Tường, Vĩnh Phúc',
    // Tọa độ lấy trực tiếp từ link Google Maps ở dưới để bản đồ nhúng trùng đúng ghim.
    mapQuery: '21.271812,105.520389',
    mapsUrl: 'https://maps.app.goo.gl/YsBMfjM8U3YQrUXi7'
  },
  venue: 'Tư gia nhà trai & Tư gia nhà gái',
  address: 'Bấm nút chỉ đường của từng nhà để mở Google Maps',
  mapsUrl: 'https://maps.app.goo.gl/3EjJ7uw3DarNp7Py8',
  message: 'Sự hiện diện của bạn là niềm hạnh phúc và vinh dự lớn đối với gia đình chúng mình.',
  // Thông tin hai gia đình hiển thị dưới lịch. Có thể thay đổi trực tiếp tại đây.
  familyInfo: {
    groom: {
      title: 'Ông Bà',
      names: ['Nguyễn Văn Hạnh', 'Nguyễn Thị Hưng'],
      address: 'Hạ Chuế, Kim Xá, Vĩnh Tường, Vĩnh Phúc',
    },
    bride: {
      title: 'Ông Bà',
      names: ['Bùi Văn Hải', 'Ngô Thị Bích'],
      address: 'Vườn Gấu, Đại Đồng, Vĩnh Tường, Vĩnh Phúc',
    },
    groomFullName: 'Nguyễn Đức Huy',
    groomRole: 'Đại Hoàng Tử',
    brideFullName: 'Bùi Thị Yến',
    brideRole: 'Trưởng Công Chúa',
  },
  // URL Vercel CHÍNH THỨC sau khi triển khai (không có dấu / cuối).
  siteUrl: 'https://thiepcuoihuyyen.vercel.app',
  // Đặt ảnh trong public/photos/ và nhập đường dẫn, ví dụ '/photos/anh-1.jpg'.
  photos: [],
  // Ảnh cho slideshow "Khoảnh khắc của chúng mình".
  momentPhotos: [
    '/photos/khoanhkhac/anh9.jpg',
    '/photos/khoanhkhac/anh1.jpg',
    '/photos/khoanhkhac/anh4.jpg',
    '/photos/khoanhkhac/anh8.jpg',
    '/photos/khoanhkhac/anh3.jpg',
    '/photos/khoanhkhac/anh2.jpg',
    '/photos/khoanhkhac/anh5.jpg',
    '/photos/khoanhkhac/anh6.jpg',
    '/photos/khoanhkhac/anh7.jpg',
  ],
  // Hành trình tình yêu hiển thị trước phần lịch cưới.
  loveStory: [
    {
      year: 'Cấp 3',
      title: 'Những năm tháng thanh xuân',
      text: 'Gặp nhau dưới mái trường cấp 3, cùng lưu giữ những năm tháng thanh xuân hồn nhiên và rực rỡ.',
      photo: '/photos/khoanhkhac/anh1.jpg',
    },
    {
      year: 'Đại học',
      title: 'Từ những cuộc trò chuyện',
      text: 'Tại đại học, những cuộc trò chuyện giản dị mỗi ngày dần kéo hai trái tim tìm thấy sự đồng điệu.',
      photo: '/photos/khoanhkhac/anh2.jpg',
    },
    {
      year: 'Tình yêu',
      title: 'Từ bạn bè thành người thương',
      text: 'Từ tình bạn năm nào, chúng mình học cách lắng nghe, thấu hiểu và trân trọng những phút giây đồng hành.',
      photo: '/photos/khoanhkhac/anh4.jpg',
    },
    {
      year: 'Lời hứa',
      title: 'Cùng hướng về một mái nhà',
      text: 'Cùng trưởng thành, chúng mình chọn nắm tay và biến tình yêu thành lời hứa cho chặng đường phía trước.',
      photo: '/photos/khoanhkhac/anh9.jpg',
    },
    {
      year: 'Năm 2026',
      title: 'Lời cầu hôn',
      text: 'Năm 2026, Huy cầu hôn Yến — một lời hứa mở ra chương mới về mái nhà chung.',
      photo: '/photos/khoanhkhac/anh8.jpg',
    },
    {
      year: 'Hôm nay',
      title: 'Về chung một nhà',
      text: 'Hôm nay, chúng mình về chung một nhà, cùng bắt đầu hành trình xây dựng gia đình nhỏ.',
      photo: '/photos/khoanhkhac/anh1.jpg',
    },
  ],
  todayTogether: {
    bridePhoto: '/photos/khoanhkhac/anh3.jpg',
    groomPhoto: '/photos/khoanhkhac/anh7.jpg',
    brideSignature: '/photos/chuki/chukyyen.png',
    groomSignature: '/photos/chuki/chukyhuy-transparent.png',
  },
  // Nhạc nền được phát khi khách mở thiệp; nút góc phải dưới dùng để tạm dừng/phát lại.
  musicUrl: '/music/ngaydautien.mp3',
  // Ảnh xem trước khi chia sẻ link trên Zalo/Facebook, phải là URL HTTPS đầy đủ.
  // Ví dụ: 'https://ten-mien-cua-ban.vercel.app/photos/anh-bia.jpg'
  shareImageUrl: 'https://thiepcuoihuyyen.vercel.app/photos/anh1.png'
};
