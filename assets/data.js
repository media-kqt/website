// =========================================================
// ULAW site — content data (edit here; views render from these globals)
//
// Every item carries:
//   status    "verified" | "illustrative" | "pending"
//   sourceUrl official source once verified (null until then)
//   updatedAt ISO date of the last content check (null until verified)
// No item in this prototype is verified yet. In production set
// ULAW_PUBLISH_MODE = "production" so only `verified` items are rendered.
// =========================================================

window.ULAW_PUBLISH_MODE = "prototype";

// Official ULAW admissions counselling site (Phòng Tư vấn tuyển sinh).
window.ULAW_ADMISSIONS_URL = "https://tuyensinh.hcmulaw.edu.vn/";
// Official postgraduate admissions page (Cổng tuyển sinh → Sau đại học).
window.ULAW_ADMISSIONS_POSTGRAD_URL = "https://ts.hcmulaw.edu.vn/sau-dai-hoc";

window.ULAW_published = function(list){
  list = list || [];
  if(window.ULAW_PUBLISH_MODE !== "production") return list.slice();
  return list.filter(function(item){ return item.status === "verified"; });
};


window.ULAW_PROGRAMS = [
  {
    slug: "quan-tri-kinh-doanh",
    group: "business",
    groupLabel: "Business",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Quản trị kinh doanh",
    // Two tracks (same keys/anchors as Quản trị – Luật); Hội nhập quốc tế details await official confirmation.
    tracks: [
      { key: "chinh-quy", label: "Thường", status: "pending",
        summary: "Thông tin chương trình hệ thường đang chờ nguồn chính thức xác nhận." },
      { key: "tich-hop", label: "Hội nhập quốc tế", status: "pending",
        summary: "Thông tin chương trình Hội nhập quốc tế đang chờ nguồn chính thức xác nhận." },
    ],
    short: "Xây nền tảng quản trị tổng quát: vận hành, marketing, nhân sự và chiến lược cho môi trường kinh doanh nhiều biến động.",
    keywords: ["Quản trị", "Marketing", "Vận hành"],
    focus: ["Ra quyết định quản trị", "Marketing & thương hiệu", "Vận hành & chiến lược"],
    curriculum: [
      {title:"Nền tảng quản trị", desc:"Nguyên lý quản trị, hành vi tổ chức, kinh tế học ứng dụng."},
      {title:"Chức năng doanh nghiệp", desc:"Marketing, nhân sự, tài chính doanh nghiệp, vận hành."},
      {title:"Tư duy pháp lý trong kinh doanh", desc:"Pháp luật doanh nghiệp, hợp đồng thương mại, quản trị rủi ro pháp lý."},
      {title:"Ứng dụng & dự án", desc:"Case study doanh nghiệp, dự án tốt nghiệp, thực tập."},
    ],
    careers: ["Chuyên viên/Quản lý vận hành", "Chuyên viên marketing – thương hiệu", "Chuyên viên phát triển kinh doanh"],
  },
  {
    slug: "quan-tri-luat",
    group: "business",
    groupLabel: "Business",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Quản trị – Luật",
    // Two tracks; Hội nhập quốc tế details await official confirmation.
    tracks: [
      { key: "chinh-quy", label: "Thường", status: "illustrative",
        summary: "Chương trình chuẩn kết hợp quản trị doanh nghiệp với nền tảng pháp lý kinh doanh." },
      { key: "tich-hop", label: "Hội nhập quốc tế", status: "pending",
        summary: "Thông tin chương trình Hội nhập quốc tế đang chờ nguồn chính thức xác nhận." },
    ],
    short: "Kết hợp tư duy quản trị với nền tảng pháp lý kinh doanh — thế mạnh đặc trưng của một khoa thuộc trường luật.",
    keywords: ["Quản trị", "Pháp lý", "Compliance"],
    focus: ["Quản trị doanh nghiệp", "Pháp lý kinh doanh", "Tuân thủ & quản trị rủi ro"],
    curriculum: [
      {title:"Nền tảng quản trị & pháp luật", desc:"Quản trị học, luật kinh tế đại cương."},
      {title:"Quản trị doanh nghiệp & Governance", desc:"Cơ cấu quản trị công ty, trách nhiệm giải trình."},
      {title:"Pháp lý kinh doanh chuyên sâu", desc:"Hợp đồng, sở hữu trí tuệ, giải quyết tranh chấp thương mại."},
      {title:"Ứng dụng thực tiễn", desc:"Mô phỏng tình huống pháp lý – quản trị, dự án tốt nghiệp."},
    ],
    careers: ["Chuyên viên quản trị & tuân thủ (compliance)", "Chuyên viên pháp chế doanh nghiệp", "Tư vấn quản trị rủi ro"],
  },
  {
    slug: "kinh-doanh-quoc-te",
    group: "business",
    groupLabel: "Business",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Kinh doanh quốc tế",
    short: "Trang bị năng lực vận hành doanh nghiệp trong môi trường toàn cầu: thương mại quốc tế, chuỗi cung ứng và văn hóa kinh doanh đa quốc gia.",
    keywords: ["Toàn cầu hóa", "Thương mại quốc tế", "Chuỗi cung ứng"],
    focus: ["Thương mại & đầu tư quốc tế", "Quản trị chuỗi cung ứng", "Văn hóa kinh doanh đa quốc gia"],
    curriculum: [
      {title:"Nền tảng kinh doanh quốc tế", desc:"Kinh tế quốc tế, thương mại toàn cầu."},
      {title:"Vận hành xuyên biên giới", desc:"Logistics, chuỗi cung ứng, thanh toán quốc tế."},
      {title:"Pháp lý thương mại quốc tế", desc:"Hợp đồng ngoại thương, giải quyết tranh chấp quốc tế."},
      {title:"Ứng dụng & dự án", desc:"Case study doanh nghiệp đa quốc gia, thực tập."},
    ],
    careers: ["Chuyên viên xuất nhập khẩu", "Chuyên viên phát triển thị trường quốc tế", "Chuyên viên logistics & chuỗi cung ứng"],
  },
  {
    slug: "tai-chinh-ngan-hang",
    group: "finance",
    groupLabel: "Finance",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Tài chính – Ngân hàng",
    short: "Nền tảng phân tích tài chính, quản trị rủi ro và hiểu biết pháp lý trong lĩnh vực tài chính – ngân hàng.",
    keywords: ["Tài chính doanh nghiệp", "Ngân hàng", "Quản trị rủi ro"],
    focus: ["Phân tích & định giá tài chính", "Nghiệp vụ ngân hàng", "Pháp lý tài chính – tín dụng"],
    curriculum: [
      {title:"Nền tảng tài chính", desc:"Tài chính doanh nghiệp, thị trường tài chính."},
      {title:"Nghiệp vụ ngân hàng", desc:"Tín dụng, thanh toán, quản trị rủi ro ngân hàng."},
      {title:"Pháp lý tài chính", desc:"Quy định tín dụng, chứng khoán, phòng chống rửa tiền."},
      {title:"Ứng dụng & dự án", desc:"Mô hình tài chính, thực tập tại tổ chức tín dụng."},
    ],
    careers: ["Chuyên viên tín dụng/ngân hàng", "Chuyên viên phân tích tài chính", "Chuyên viên quản trị rủi ro"],
  },
  {
    slug: "kinh-te-so",
    group: "digital",
    groupLabel: "Digital",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Kinh tế số",
    short: "Hiểu và vận dụng dữ liệu, nền tảng số và mô hình kinh doanh mới trong nền kinh tế số.",
    keywords: ["Dữ liệu", "Mô hình số", "Đổi mới sáng tạo"],
    focus: ["Phân tích dữ liệu kinh doanh", "Mô hình kinh doanh số", "Chính sách & pháp lý kinh tế số"],
    curriculum: [
      {title:"Nền tảng kinh tế số", desc:"Kinh tế học số, chuyển đổi số doanh nghiệp."},
      {title:"Dữ liệu & công nghệ", desc:"Phân tích dữ liệu, nền tảng số, tự động hóa."},
      {title:"Pháp lý kinh tế số", desc:"Bảo vệ dữ liệu cá nhân, quy định nền tảng số."},
      {title:"Ứng dụng & dự án", desc:"Dự án chuyển đổi số thực tế, thực tập doanh nghiệp công nghệ."},
    ],
    careers: ["Chuyên viên phân tích dữ liệu kinh doanh", "Chuyên viên chuyển đổi số", "Chuyên viên vận hành nền tảng số"],
  },
  {
    slug: "thuong-mai-dien-tu",
    group: "digital",
    groupLabel: "Digital",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Thương mại điện tử",
    short: "Từ vận hành sàn thương mại điện tử đến pháp lý giao dịch số — chuẩn bị cho môi trường bán lẻ và giao dịch trực tuyến.",
    keywords: ["E-commerce", "Vận hành số", "Giao dịch điện tử"],
    focus: ["Vận hành thương mại điện tử", "Marketing số", "Pháp lý giao dịch điện tử"],
    curriculum: [
      {title:"Nền tảng thương mại điện tử", desc:"Mô hình TMĐT, hành vi người tiêu dùng số."},
      {title:"Vận hành & marketing số", desc:"Quản trị sàn TMĐT, digital marketing, logistics chặng cuối."},
      {title:"Pháp lý giao dịch điện tử", desc:"Hợp đồng điện tử, bảo vệ người tiêu dùng trực tuyến."},
      {title:"Ứng dụng & dự án", desc:"Dự án vận hành gian hàng/case TMĐT thực tế."},
    ],
    careers: ["Chuyên viên vận hành sàn TMĐT", "Chuyên viên digital marketing", "Chuyên viên pháp lý giao dịch số"],
  },
  {
    slug: "cong-nghe-tai-chinh",
    group: "digital",
    groupLabel: "Digital",
    status: "illustrative", sourceUrl: null, updatedAt: null,
    // Credits (tín chỉ) per knowledge block — fill from the official CTĐT; null = "Đang cập nhật".
    // `luat` = credits of law courses inside the programme (highlighted separately).
    credits: { coSo: null, chuyenNganh: null, thucTap: null, khoaLuan: null, luat: null },
    name: "Công nghệ tài chính",
    short: "Giao điểm giữa tài chính, công nghệ và pháp lý — chuẩn bị năng lực cho lĩnh vực FinTech đang phát triển nhanh.",
    keywords: ["FinTech", "Đổi mới tài chính", "Pháp lý công nghệ"],
    focus: ["Công nghệ trong tài chính", "Đổi mới mô hình FinTech", "Pháp lý & quản trị rủi ro công nghệ tài chính"],
    curriculum: [
      {title:"Nền tảng FinTech", desc:"Tổng quan công nghệ tài chính, thanh toán số."},
      {title:"Công nghệ & dữ liệu tài chính", desc:"Phân tích dữ liệu tài chính, nền tảng thanh toán."},
      {title:"Pháp lý FinTech", desc:"Quy định về công nghệ tài chính, an toàn dữ liệu tài chính."},
      {title:"Ứng dụng & dự án", desc:"Dự án mô phỏng sản phẩm FinTech, thực tập."},
    ],
    careers: ["Chuyên viên sản phẩm FinTech", "Chuyên viên phân tích dữ liệu tài chính", "Chuyên viên tuân thủ công nghệ tài chính"],
  },
];

window.ULAW_FAQ_GENERIC = [
  {q:"Chương trình có được kiểm định chính thức không?", a:"Thông tin đang cập nhật. ULAW sẽ công bố khi có văn bản/kết quả kiểm định chính thức.", status:"pending"},
  {q:"Học phí và học bổng của ngành này ra sao?", a:"Thông tin đang cập nhật — vui lòng tham khảo cổng tuyển sinh chính thức của Trường khi được công bố.", status:"pending"},
  {q:"Sinh viên có cơ hội thực tập tại doanh nghiệp không?", a:"Chương trình định hướng có hoạt động trải nghiệm thực tiễn/doanh nghiệp; số lượng và hình thức cụ thể sẽ được cập nhật theo từng khóa.", status:"illustrative"},
];

// News — all items link to the single sample article until real posts exist.
// `date: null` renders as "Ngày: chưa xác thực". `image` is a scene key (see scenes.js)
// or, once licensed photos exist, an image path relative to the site root.
window.ULAW_NEWS = [
  {
    url: "tin-tuc/mau-bai-viet.html",
    category: "Đào tạo",
    title: "[Minh họa] Khoa Quản trị định hướng phát triển chương trình theo hướng liên ngành Quản trị – Luật – Công nghệ",
    excerpt: "Bài viết minh họa mô tả định hướng phát triển chương trình đào tạo; nội dung sẽ được thay bằng tin chính thức khi có nguồn xác thực.",
    image: "hero-programs", alt: "Ảnh minh họa: toà nhà giảng đường và sinh viên",
    date: null, status: "illustrative", sourceUrl: null, updatedAt: null,
  },
  {
    url: "tin-tuc/mau-bai-viet.html",
    category: "Sinh viên",
    title: "[Minh họa] Hoạt động trải nghiệm thực tế dành cho sinh viên năm cuối",
    excerpt: "Nội dung minh họa về hình thức tổ chức hoạt động kết nối sinh viên với môi trường doanh nghiệp.",
    image: "study_group__navy", alt: "Ảnh minh họa: nhóm sinh viên thảo luận",
    date: null, status: "illustrative", sourceUrl: null, updatedAt: null,
  },
  {
    url: "tin-tuc/mau-bai-viet.html",
    category: "Nghiên cứu",
    title: "[Minh họa] Hướng nghiên cứu liên ngành giữa quản trị và pháp lý kinh doanh",
    excerpt: "Bài viết minh họa giới thiệu cách trình bày một tin nghiên cứu; số liệu và tên tác giả sẽ được cập nhật khi có dữ liệu thật.",
    image: "research_books__purple", alt: "Ảnh minh họa: sách và tài liệu nghiên cứu",
    date: null, status: "illustrative", sourceUrl: null, updatedAt: null,
  },
  {
    url: "tin-tuc/mau-bai-viet.html",
    category: "Doanh nghiệp",
    title: "[Minh họa] Mô hình hợp tác đào tạo giữa Khoa và doanh nghiệp",
    excerpt: "Minh họa cách trình bày tin hợp tác doanh nghiệp trên trang chủ và trang tin tức.",
    image: "handshake_business__purple", alt: "Ảnh minh họa: hai người bắt tay hợp tác",
    date: null, status: "illustrative", sourceUrl: null, updatedAt: null,
  },
];

// Events — intentionally empty: no verified event schedule has been supplied.
// Shape: { title, startAt:"2026-10-15T08:30:00+07:00", endAt, place, mode:"Trực tiếp"|"Trực tuyến",
//          registerUrl, url, status, sourceUrl, updatedAt }
// Renderers sort by startAt, drop past events and show the next 3–4.
// ULAW_EVENTS item: {title, startAt:"2026-10-15T08:30", endAt, category, place, mode, excerpt, url, registerUrl, status, sourceUrl, updatedAt}
//   Home "Sự kiện" calendar marks every day from startAt to endAt; clicking a day shows its events.
window.ULAW_EVENTS = [];

// Lịch trực khoa (tin-tuc/index.html#lich-truc) — intentionally empty until the Khoa office supplies
// the official roster. One item per shift:
// { date:"2026-10-05", shift:"sang"|"chieu", person, role, room, time:"07:30–11:30", phone, note,
//   status, sourceUrl, updatedAt }
// Empty → the month grid shows dashed "chưa phân công" slots on weekdays.
window.ULAW_DUTY = [];

// Key figures (scale milestones) for the home "Những cột mốc đáng nhớ" counters.
// Fill `value` with the official number (e.g. 12500), optional `suffix` ("+"),
// `sourceUrl`, and set status "verified". `value: null` renders "Đang cập nhật"
// — never put an estimated number here.
window.ULAW_STATS = [
  { value: null, suffix: "+", label: "Sinh viên đã nhập học", note: "Tổng số sinh viên qua các khóa", tone: "#2D55A8", status: "pending", sourceUrl: null },
  { value: null, suffix: "",  label: "Khóa đã tuyển sinh", note: "Tính đến năm học hiện tại", tone: "#169C83", status: "pending", sourceUrl: null },
  { value: null, suffix: "+", label: "Cử nhân đã tốt nghiệp", note: "Cựu sinh viên Khoa Quản trị", tone: "#9B57A0", status: "pending", sourceUrl: null },
  { value: null, suffix: "+", label: "Sinh viên đang theo học", note: "Năm học hiện tại", tone: "#E08A2E", status: "pending", sourceUrl: null },
  { value: null, suffix: "+", label: "Giảng viên & chuyên gia", note: "Cơ hữu và thỉnh giảng", tone: "#1C5E97", status: "pending", sourceUrl: null },
  { value: null, suffix: "+", label: "Đối tác doanh nghiệp", note: "Thực tập, tuyển dụng, học bổng", tone: "#0E9A9A", status: "pending", sourceUrl: null },
  { value: null, suffix: "",  label: "Năm hình thành & phát triển", note: "Kể từ khi thành lập Khoa", tone: "#9B57A0", status: "pending", sourceUrl: null },
  { value: 7,    suffix: "",  label: "Ngành đào tạo đại học", note: "Cùng 1 chương trình thạc sĩ", tone: "#2D55A8", status: "verified" }
];

// Research — all empty until Khoa supplies verified records (never invent entries).
// Publication: { title, authors, venue, type ("Bài báo tạp chí"|"Kỷ yếu hội thảo"|"Sách/chương sách"),
//   date:"2026-03-15" (quarter is derived), url, image (scene key or path), featured:true, status, sourceUrl }
window.ULAW_PUBLICATIONS = [];
// Project: { name, type ("Cấp Trường"|"Cấp Bộ"|"Cấp Nhà nước"|"Hợp tác doanh nghiệp"|"Quốc tế"), lead, period, state ("Đang thực hiện"|"Đã nghiệm thu"), status }
window.ULAW_PROJECTS = [];
// Conference: { title, startAt, endAt, place, mode, summary, url, registerUrl, status }
// Past or undated → "Thông tin hội thảo"; startAt in the future → "Hội thảo sắp diễn ra".
window.ULAW_CONFERENCES = [];
// Case study: { title, lens: "business"|"law"|"tech", org (or "Doanh nghiệp ẩn danh"), question, tags:[], url, status, sourceUrl }
window.ULAW_CASES = [];

// Ban Chủ nhiệm Khoa — fill with verified, consented details. null = "Đang cập nhật".
// photo: image path (e.g. "assets/images/truong-khoa.jpg"); intro: short introduction paragraph.
window.ULAW_LEADERSHIP = [
  { role: "Trưởng Khoa",      name: null, degree: null, field: null, email: null, photo: null, intro: null },
  { role: "Phó Trưởng Khoa",  name: null, degree: null, field: null, email: null, photo: null, intro: null },
  { role: "Phó Trưởng Khoa",  name: null, degree: null, field: null, email: null, photo: null, intro: null }
];

// Bộ môn (departments) — names per the site's illustrative structure; confirm with the official org chart.
// head / lecturers: { name, degree, email, photo (image path), cv (URL or path to CV/profile) }.
// Lecturers render only when listed; a CV link appears only when `cv` is set.
window.ULAW_DEPARTMENTS = [  // A→Z
  { id: "cong-nghe-quan-ly", name: "Bộ môn Công nghệ quản lý", tone: "#0E9A9A", status: "pending", intro: null,
    head: { name: null, degree: null, email: null, photo: null, cv: null },
    lecturers: [] },
  { id: "kinh-doanh", name: "Bộ môn Kinh doanh", tone: "#2D55A8", status: "pending", intro: null,
    head: { name: null, degree: null, email: null, photo: null, cv: null },
    lecturers: [] },
  { id: "kinh-te-doi-ngoai", name: "Bộ môn Kinh tế đối ngoại", tone: "#9B57A0", status: "pending", intro: null,
    head: { name: null, degree: null, email: null, photo: null, cv: null },
    lecturers: [] },
  { id: "quan-tri-tai-chinh-ke-toan", name: "Bộ môn Quản trị tài chính kế toán", tone: "#169C83", status: "pending", intro: null,
    head: { name: null, degree: null, email: null, photo: null, cv: null },
    lecturers: [] }
];

// Lecturer leisure moments (Đội ngũ › Giảng viên gallery), in frame order.
// { image: "assets/images/…jpg", caption: "…" } — empty slots show a template frame.
window.ULAW_FACULTY_MOMENTS = [];

// Chuyên gia / giảng viên thỉnh giảng — verified, consented entries only.
// { title: "TS."|"ThS."|"LS."…, name, position: "Giám đốc…", org: "Công ty…", photo: "assets/images/…jpg" }
window.ULAW_GUEST_EXPERTS = [];

// Thạc sĩ QTKD class photos (home block + ThS page), in order: { image: "assets/images/…jpg", caption }
window.ULAW_THS_PHOTOS = [];

// Thạc sĩ QTKD — notices shown on the ThS page (newest first by date).
// { title, date:"2026-10-01", url (e.g. a sdh.hcmulaw.edu.vn/thong-bao/... link), tag: "Tuyển sinh"|"Học vụ"|"Lịch thi" }
window.ULAW_THS_NOTICES = [];
// Thạc sĩ QTKD — posts published on this site (with images).
// { type:"news"|"event", title, date:"2026-10-01", image:"assets/images/….jpg", excerpt, url (optional: full article or SĐH link) }
window.ULAW_THS_POSTS = [];

// Biểu mẫu grouped for bieu-mau/index.html. `group` must be one of ULAW_FORM_GROUPS[].key.
// File names are generic placeholders; attach `file` only when the Faculty supplies the official form.
window.ULAW_FORM_GROUPS = [
  { key:"hoc-tap",   label:"Biểu mẫu học tập",          desc:"Học vụ, đăng ký học phần, bảo lưu, nghiên cứu khoa học sinh viên." },
  { key:"tot-nghiep",label:"Biểu mẫu tốt nghiệp",       desc:"Khóa luận, xét và công nhận tốt nghiệp." },
  { key:"thuc-tap",  label:"Biểu mẫu thực tập",         desc:"Giới thiệu thực tập, báo cáo và đánh giá thực tập." },
  { key:"hoc-phi",   label:"Biểu mẫu học phí & hỗ trợ", desc:"Học phí, miễn giảm, học bổng và hỗ trợ sinh viên." }
];
window.ULAW_FORMS = [
  { group:"hoc-tap",    name:"Đơn xin bảo lưu kết quả học tập", status:"pending", file:null },
  { group:"hoc-tap",    name:"Đơn đăng ký học lại/học cải thiện", status:"pending", file:null },
  { group:"hoc-tap",    name:"Đề xuất đề tài nghiên cứu khoa học sinh viên", status:"pending", file:null },
  { group:"hoc-tap",    name:"Mẫu đăng ký tham gia hội thảo khoa học", status:"pending", file:null },
  { group:"tot-nghiep", name:"Đơn đăng ký khóa luận tốt nghiệp", status:"pending", file:null },
  { group:"tot-nghiep", name:"Phiếu nhận xét giảng viên hướng dẫn (mẫu)", status:"pending", file:null },
  { group:"thuc-tap",   name:"Giấy giới thiệu thực tập", status:"pending", file:null },
  { group:"thuc-tap",   name:"Mẫu báo cáo thực tập", status:"pending", file:null },
  { group:"thuc-tap",   name:"Phiếu đánh giá của đơn vị thực tập", status:"pending", file:null },
  { group:"hoc-phi",    name:"Đơn đề nghị hỗ trợ học phí", status:"pending", file:null },
  { group:"hoc-phi",    name:"Hồ sơ đăng ký học bổng khuyến khích học tập", status:"pending", file:null },
];

// Học liệu catalogue (illustrative). Only the catalogue entry is public.
//   access "public"  → viewable without login (file attached once ULAW supplies it)
//   access "student" → requires official ULAW SSO/OIDC + server-side permission check.
//                      No file/URL is ever stored in public assets for these items,
//                      and they are never added to the search index.
// Official ULAW single sign-on for restricted Học liệu (set by ULAW IT, e.g. the Microsoft 365 / Google
// Workspace or OIDC authorize URL). Students type their ULAW email + password ONLY on that official page;
// this site never shows a password field. null = not connected yet (buttons show "Đang chờ kết nối").
window.ULAW_SSO_URL = null;
window.ULAW_RESOURCE_TYPES = [
  { key:"ctdt", label:"Chương trình đào tạo", desc:"Khung chương trình, chuẩn đầu ra, cấu trúc học phần theo khóa." },
  { key:"de-cuong", label:"Đề cương học phần", desc:"Mục tiêu, nội dung, phương pháp đánh giá từng học phần." },
  { key:"tai-lieu", label:"Tài liệu học phần", desc:"Bài giảng, tài liệu đọc, bài tập — dành cho sinh viên đang học." },
];
window.ULAW_RESOURCES = (function(){
  var list = [];
  window.ULAW_PROGRAMS.forEach(function(p){
    list.push({
      type:"ctdt", program:p.slug, programName:p.name,
      title:"Chương trình đào tạo ngành " + p.name,
      course:null, cohort:"Khóa tuyển sinh (minh họa)", semester:null, version:"Phiên bản minh họa",
      access:"public", file:null, source:"Khoa Quản trị (chờ xác thực)",
      status:"illustrative", sourceUrl:null, updatedAt:null,
    });
    p.curriculum.slice(0, 2).forEach(function(c, i){
      list.push({
        type:"de-cuong", program:p.slug, programName:p.name,
        title:"Đề cương học phần: " + c.title,
        course:c.title, cohort:"Khóa tuyển sinh (minh họa)", semester:"Học kỳ " + (i + 1), version:"Phiên bản minh họa",
        access:"public", file:null, source:"Bộ môn phụ trách (chờ xác thực)",
        status:"illustrative", sourceUrl:null, updatedAt:null,
      });
    });
    list.push({
      type:"tai-lieu", program:p.slug, programName:p.name,
      title:"Tài liệu học phần: " + p.curriculum[0].title,
      course:p.curriculum[0].title, cohort:"Khóa tuyển sinh (minh họa)", semester:"Học kỳ 1", version:"Phiên bản minh họa",
      access:"student", file:null, source:"Giảng viên phụ trách (chờ xác thực)",
      status:"illustrative", sourceUrl:null, updatedAt:null,
    });
  });
  return list;
})();

// Tin nổi bật slider (home, above the "Tư duy Quản trị" banner) — at most 5 published items are shown.
// { order, category:"Sự kiện"|"Thông báo"|"Hoạt động", title, date:"2026-10-05", image (photo path, ideally
//   1920×1080 landscape), alt, url, ctaLabel, status, sourceUrl, updatedAt, startAt/endAt (null = always) }
// Only items with BOTH a title and a real photo (image path .jpg/.png/.webp/.avif) are shown;
// when none qualify the whole slider is hidden. Add real items here, e.g.:
// { order:1, category:"Sự kiện", title:"…", date:"2026-10-05", image:"assets/img/highlights/su-kien.jpg",
//   alt:"…", url:"tin-tuc/…", ctaLabel:"Xem chi tiết", status:"verified", sourceUrl:null, updatedAt:null, startAt:null, endAt:null }
// DEMO (to show the idea): status "illustrative" items may use an animated scenes.js ULAW_HL_SCENES key (hl-event/-notice/-activity/-admissions) instead of a photo.
// Delete these 4 items when real photos arrive; an empty list hides the slider.
window.ULAW_HIGHLIGHTS = [
  { order: 1, category: "Sự kiện", title: "[Demo] Ảnh sự kiện nổi bật của Khoa", date: null, image: "hl-event", alt: "Ảnh demo động: sân khấu sự kiện với đèn và pháo giấy", url: "tin-tuc/index.html#su-kien", ctaLabel: "Xem lịch sự kiện",
    status: "illustrative", sourceUrl: null, updatedAt: null, startAt: null, endAt: null },
  { order: 2, category: "Thông báo", title: "[Demo] Thông báo quan trọng dành cho người học", date: null, image: "hl-notice", alt: "Ảnh demo động: loa và chuông thông báo", url: "sinh-vien/index.html", ctaLabel: "Xem thông báo",
    status: "illustrative", sourceUrl: null, updatedAt: null, startAt: null, endAt: null },
  { order: 3, category: "Hoạt động", title: "[Demo] Hoạt động học thuật và phong trào tiêu biểu", date: null, image: "hl-activity", alt: "Ảnh demo động: biểu đồ tăng trưởng và sinh viên", url: "tin-tuc/index.html#tin-tuc", ctaLabel: "Xem tin tức",
    status: "illustrative", sourceUrl: null, updatedAt: null, startAt: null, endAt: null },
  { order: 4, category: "Tuyển sinh", title: "[Demo] Thông tin tuyển sinh và tư vấn ngành học", date: null, image: "hl-admissions", alt: "Ảnh demo động: mũ tốt nghiệp trên bậc thang", url: "dao-tao/index.html", ctaLabel: "Khám phá ngành học",
    status: "illustrative", sourceUrl: null, updatedAt: null, startAt: null, endAt: null },
];

// Hero carousel — at most 3 published slides (see site.js). Fields follow the spec:
// title, summary, image (scene key or image path), alt, ctaLabel, url (relative to
// site root), status, sourceUrl, startAt/endAt (ISO or null = always), order.
window.ULAW_HERO_SLIDES = [
  {
    order: 1, eyebrow: "Khoa Quản trị · 7 ngành đào tạo",
    title: "Quản trị, pháp lý và công nghệ trong một hành trình học",
    summary: "Bảy ngành đại học kết hợp năng lực quản trị, hiểu biết pháp lý và công nghệ. Tìm ngành phù hợp với định hướng của bạn.",
    image: "hero-programs", alt: "Ảnh minh họa: toà giảng đường cùng biểu tượng Kinh doanh, Pháp lý và Công nghệ",
    ctaLabel: "Xem 7 ngành đào tạo", url: "dao-tao/index.html",
    status: "illustrative", sourceUrl: null, startAt: null, endAt: null,
  },
  {
    order: 2, eyebrow: "Trải nghiệm học tập · Học liệu",
    title: "Học liệu tập trung, dễ tìm theo ngành và học phần",
    summary: "Danh mục chương trình đào tạo, đề cương và tài liệu học phần được sắp xếp theo ngành, khóa và học kỳ.",
    image: "hero-learning", alt: "Ảnh minh họa: sinh viên học tập bên máy tính và kệ sách",
    ctaLabel: "Mở thư viện Học liệu", url: "hoc-lieu/index.html",
    status: "illustrative", sourceUrl: null, startAt: null, endAt: null,
  },
  {
    order: 3, eyebrow: "Tuyển sinh",
    title: "Thông tin tuyển sinh sẽ được công bố theo đề án chính thức",
    summary: "Phương thức, học phí và học bổng được công bố tại trang tư vấn tuyển sinh chính thức của Trường.",
    image: "hero-admissions", alt: "Ảnh minh họa: mũ tốt nghiệp, lịch và các bậc thang hướng lên",
    ctaLabel: "Tư vấn tuyển sinh", url: window.ULAW_ADMISSIONS_URL,
    status: "pending", sourceUrl: null, startAt: null, endAt: null,
  },
];

// ---------- Sinh viên sub-pages (sinh-vien/*.html) ----------
// Fill these to replace the template frames; leave empty until verified.
// cat: "hoc-tap" | "hoc-bong" | "thuc-tap" | "cuoc-song"
// ULAW_STUDENT_POSTS item: {cat, type, title, date, deadline, org, excerpt, href, image, pinned, status, sourceUrl, updatedAt}
//   pinned:true keeps a notice on top ("Ghim"); notices dated within 14 days show "Mới".
//   type (by cat) e.g. hoc-tap: "Thông báo học vụ" | "Lịch thi" | "Khóa luận" | "NCKH";
//   hoc-bong: "Khuyến khích" | "Doanh nghiệp" | "Quốc tế"; thuc-tap: "Thực tập" | "Tuyển dụng" | "Career Talk";
//   cuoc-song: "Hoạt động" | "Cuộc thi" | "Hội thảo". href: page, PDF or external URL; image: scene key or path.
// Three ILLUSTRATIVE notices that demo the notice-board flags (Ghim / Mới / Hạn); dates are relative
// to today so "Mới" stays visible. Hidden automatically when ULAW_PUBLISH_MODE = "production".
window.ULAW_STUDENT_POSTS = (function(){
  function day(offset){ var d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
  return [
    {cat:"hoc-tap", type:"Thông báo học vụ", pinned:true, date:day(-20), org:"Phòng Đào tạo",
     title:"[Minh họa] Quy định đăng ký học phần — thông báo quan trọng được ghim",
     excerpt:"Ví dụ nhãn GHIM: thông báo quan trọng luôn nằm đầu danh sách, bất kể ngày đăng.",
     status:"illustrative", sourceUrl:null, updatedAt:null},
    {cat:"hoc-tap", type:"Lịch thi", date:day(-3), org:"Khoa Quản trị",
     title:"[Minh họa] Lịch thi giữa kỳ vừa được đăng",
     excerpt:"Ví dụ nhãn MỚI: tự hiện với thông báo đăng trong 14 ngày gần nhất.",
     status:"illustrative", sourceUrl:null, updatedAt:null},
    {cat:"hoc-tap", type:"Khóa luận", date:day(-30), deadline:day(12), org:"Khoa Quản trị",
     title:"[Minh họa] Đăng ký đề tài khóa luận tốt nghiệp",
     excerpt:"Ví dụ nhãn HẠN: hiển thị hạn chót để sinh viên không bỏ lỡ.",
     status:"illustrative", sourceUrl:null, updatedAt:null}
  ];
})();
// ULAW_STUDENT_PHOTOS item: {cat, image, caption, status} — fills the photo frames of that page in order.
window.ULAW_STUDENT_PHOTOS = [];
// ULAW_STUDENT_CLUBS item: {name, field, desc, logo, href, status} — Câu lạc bộ grid on cuoc-song.html.
window.ULAW_STUDENT_CLUBS = [];

// ---------- Đối tác (doanh-nghiep/index.html) ----------
// ULAW_PARTNERS item: {name, logo, href, status, sourceUrl, updatedAt}
//   Only the logo is shown; name is its alt text (and shown instead if no logo yet).
// Only add partners with an official agreement and permission to use the logo.
window.ULAW_PARTNERS = [];
// ULAW_JOBS item: {title, company, logo, type:"Toàn thời gian"|"Bán thời gian", location, deadline, date, href, status, sourceUrl, updatedAt}
//   date = posting date; the 2 newest jobs (and the 2 newest internships) get a "New" tag.
window.ULAW_JOBS = [];
// ULAW_INTERNSHIPS item (Tuyển thực tập sinh, doanh-nghiep/index.html#thuc-tap):
//   {title, company, logo, image, featured, date, slots, duration, location, deadline, href, status, sourceUrl, updatedAt}
//   image = recruitment photo/poster (landscape 3:2); featured:true pins it to the 3 big pictures
//   (otherwise the 3 newest by `date`). Every item also appears in the "Doanh nghiệp mới cập nhật" list.
window.ULAW_INTERNSHIPS = [];

// ---------- Alumni success stories (alumni/index.html#cau-chuyen, mosaic) ----------
// Publish only with the alumnus's consent and content verified by the Faculty.
// Item: {name, cohort:"Khóa 2018", program, role, org, headline, excerpt, topic, image, href, featured, status, sourceUrl, updatedAt}
//   featured:true → one of the 2 large tiles (else the first stories); topic feeds the "Lọc theo chủ đề" filter.
window.ULAW_ALUMNI_STORIES = [];
// Photos for the "Mạng lưới Alumni" network visual: each fills one person node (circle-cropped).
// Item: {image, name, cohort, status} — use only photos with the person's consent. Story images are used too.
window.ULAW_ALUMNI_PHOTOS = [];

// ---------- Home "Cập nhật mới" ticker ----------
// Item: {tag:"Thông báo"|"Sự kiện"|…, text, href, date, status}. Leave empty to auto-fill from the newest
// notices, news, jobs and internships; the ticker hides itself when there is nothing to show.
window.ULAW_TICKER = [];

// Search index — URLs are relative to the site root (no leading slash); site.js
// prefixes them with the page's data-root so links work on file:// and sub-paths.
// Restricted (student-only) Học liệu items are never indexed.
window.ULAW_SEARCH_INDEX = (function(){
  var idx = [];
  window.ULAW_published(window.ULAW_PROGRAMS).forEach(function(p){
    idx.push({kind:"programs", kindLabel:"Ngành học", title:p.name, desc:p.short, url:"dao-tao/"+p.slug+".html"});
  });
  idx.push({kind:"programs", kindLabel:"Sau đại học", title:"Thạc sĩ Quản trị kinh doanh", desc:"Chương trình đào tạo sau đại học — thông tin đang cập nhật.", url:"dao-tao/thac-si-quan-tri-kinh-doanh.html"});
  [
    ["Giới thiệu Khoa Quản trị", "Sứ mạng, lịch sử, cơ cấu tổ chức và liên hệ.", "gioi-thieu/index.html"],
    ["Giảng viên & đội ngũ", "Ban Chủ nhiệm, bộ môn, giảng viên — hồ sơ đang cập nhật.", "doi-ngu/index.html"],
    ["Nghiên cứu", "Lĩnh vực nghiên cứu, công bố, đề tài, hội thảo, case study.", "nghien-cuu/index.html"],
    ["Sinh viên", "Học tập, học bổng, thực tập, tuyển dụng, cuộc sống sinh viên.", "sinh-vien/index.html"],
    ["Học tập", "Thông báo học vụ, lịch học, lịch thi, khóa luận tốt nghiệp, nghiên cứu khoa học sinh viên.", "sinh-vien/hoc-tap.html"],
    ["Học bổng", "Học bổng khuyến khích, học bổng doanh nghiệp, học bổng trao đổi và quy trình nộp hồ sơ.", "sinh-vien/hoc-bong.html"],
    ["Thực tập & Tuyển dụng", "Cơ hội thực tập, tuyển dụng, Career Talk và định hướng nghề nghiệp.", "sinh-vien/thuc-tap-tuyen-dung.html"],
    ["Cuộc sống sinh viên", "Hoạt động sinh viên, câu lạc bộ, cuộc thi, hội thảo và hình ảnh.", "sinh-vien/cuoc-song.html"],
    ["Tư vấn tuyển sinh đại học (ULAW)", "Trang tư vấn tuyển sinh chính thức của Trường Đại học Luật TP. Hồ Chí Minh.", window.ULAW_ADMISSIONS_URL],
    ["Tuyển sinh sau đại học (ULAW)", "Thông tin tuyển sinh thạc sĩ trên cổng tuyển sinh chính thức của Trường.", window.ULAW_ADMISSIONS_POSTGRAD_URL],
    ["Đối tác & Doanh nghiệp", "Hợp tác đào tạo, thực tập, tuyển dụng, nghiên cứu.", "doanh-nghiep/index.html"],
    ["Học liệu", "Chương trình đào tạo, đề cương, tài liệu học phần.", "hoc-lieu/index.html"],
    ["Lịch sự kiện", "Lịch sự kiện của Khoa — xem theo tháng trên trang Tin tức & Sự kiện.", "tin-tuc/index.html#su-kien"],
    ["Alumni — Mạng lưới cựu sinh viên", "Mạng lưới Alumni và câu chuyện thành công của cựu sinh viên Khoa Quản trị.", "alumni/index.html"],
    ["Biểu mẫu", "Biểu mẫu hành chính cho sinh viên.", "bieu-mau/index.html"],
  ].forEach(function(r){ idx.push({kind:"pages", kindLabel:"Trang", title:r[0], desc:r[1], url:r[2]}); });
  window.ULAW_published(window.ULAW_NEWS).forEach(function(n){
    idx.push({kind:"news", kindLabel:"Tin tức", title:n.title, desc:n.excerpt, url:n.url});
  });
  window.ULAW_published(window.ULAW_RESOURCES).forEach(function(r){
    if(r.access !== "public") return;
    idx.push({kind:"resources", kindLabel:"Học liệu", title:r.title, desc:r.programName + " · Công khai", url:"hoc-lieu/index.html?q=" + encodeURIComponent(r.title)});
  });
  window.ULAW_published(window.ULAW_FORMS).forEach(function(f){
    var g = (window.ULAW_FORM_GROUPS.filter(function(x){ return x.key === f.group; })[0] || {label:f.group});
    idx.push({kind:"documents", kindLabel:"Biểu mẫu", title:f.name, desc:g.label + " · Tệp đang cập nhật", url:"bieu-mau/index.html#" + f.group});
  });
  return idx;
})();
