# PROMPT XÂY DỰNG VÀ HIỆU CHỈNH WEBSITE KHOA QUẢN TRỊ ULAW

Sao chép từ dòng **PROMPT BẮT ĐẦU** đến **PROMPT KẾT THÚC** và gửi cho Claude cùng hai prompt nguồn, ba ảnh tham chiếu, và thư mục mã nguồn `ulaw-site` hoặc tệp ZIP của project. Đường dẫn `file:///Users/trucviho/Downloads/ulaw-site/index.html/` là địa chỉ trên máy cá nhân; nếu Claude không có quyền đọc máy đó, hãy đính kèm project. Đường dẫn trỏ vào tệp thường là `.../index.html` (không có dấu `/` cuối).

## PROMPT BẮT ĐẦU

Bạn là Senior UX/UI Designer, Front-end Engineer, Accessibility Specialist và Executive Marketing cho website đại học. Hãy **chỉnh sửa project website Khoa Quản trị ULAW hiện có và bàn giao sản phẩm chạy được**, không chỉ trả lời bằng ý tưởng hoặc ảnh mockup. Trước tiên đọc cấu trúc project, kiểm tra các route, component, dữ liệu và công nghệ hiện hữu. Giữ những phần đang hoạt động tốt; cải tổ khi cần để đạt các yêu cầu sau. Nếu project chưa được đính kèm, hãy yêu cầu thư mục/ZIP; không giả vờ đã sửa tệp `file://` trên máy người dùng.

### 1. Thứ tự ưu tiên và phạm vi

Yêu cầu trong prompt này là bản hợp nhất cuối cùng và **thay thế các chỉ dẫn mâu thuẫn** trong hai prompt nguồn. Ưu tiên: (1) yêu cầu chỉnh sửa mới của người dùng; (2) nội dung và quyền truy cập Học liệu từ prompt bổ sung; (3) cấu trúc trang và tính xác thực từ Final Prompt. Dựng website nhiều trang có nội dung hữu ích, điều hướng hoạt động thật, giao diện sắc nét trên desktop và mobile. Ngôn ngữ chính là tiếng Việt. Không suy diễn dữ liệu chính thức, tên người, thành tích, học phí hoặc số liệu tuyển sinh.

Định vị: **BUSINESS × LAW × TECHNOLOGY**. H1 trang chủ: **“Tinh thông Quản trị – Am tường pháp lý”**. Nội dung trình bày năng lực quản trị, hiểu biết pháp lý và công nghệ bằng ví dụ cụ thể, giọng điệu học thuật, hiện đại và gần gũi. Không sao chép tài sản, bố cục nguyên xi hoặc nhận diện của Văn Lang, RMIT, UEH hay trường khác.

### 2. Hệ màu và typography

- **Lấy hai tông xanh trong ảnh tham chiếu mới làm cặp màu nhận diện chính:** xanh dương `#2D55A8` (dải “Đại học chính quy”) và xanh lam sâu `#2B6595` (dải “Đào tạo & bồi dưỡng”). Đây là mã **lấy mẫu gần đúng từ ảnh**, không khẳng định là mã thương hiệu chính thức ULAW. Dùng xanh dương cho headline, liên kết chính, menu active và một số nền section; dùng xanh lam sâu cho khối thông tin, footer, viền nhấn và biến thể hover. Tạo sắc đậm tương ứng cho chữ nhỏ trên nền sáng để đạt WCAG AA.
- **Thanh tiện ích trên cùng** giữ nền `#1C56AE` theo yêu cầu chỉnh sửa trước (cùng họ xanh dương với `#2D55A8`), chữ trắng, đường phân tách tinh tế. Không đổi thanh này sang navy cũ. Header chính nền trắng; chữ `#182230`; nền phụ `#F5F8FC`; viền `#D9E2EC`.
- Các màu còn lại của ảnh là **accent theo ngữ cảnh, không cạnh tranh với hai màu xanh chủ đạo**: xanh ngọc `#459787` và `#449798` cho nhãn/chủ đề thứ cấp; tím `#97589A` và cam `#F19E4B` chỉ xuất hiện rất hạn chế ở card phân loại chương trình hoặc điểm nhấn đồ họa. Không dùng chữ trắng nhỏ trên nền cam/tím/xanh ngọc nếu chưa đạt tương phản; ưu tiên chữ `#182230` trên cam hoặc biến thể nền tối hơn. Đỏ `#C71F32` dành riêng cho CTA tuyển sinh/nhãn khẩn, tránh cùng lúc tô tất cả màu lên một màn hình. Phân bổ thị giác gợi ý: nền trắng và sáng khoảng 70%, cặp xanh chính khoảng 25%, tổng accent khoảng 5%; không áp tỷ lệ cứng.
- Tạo design tokens dùng chung (primary, primary-deep, utility-blue, teal, purple, orange, CTA, surfaces, text, borders và trạng thái hover/focus/current). Loại các mã navy `#070758`, `#0B2E6F` và xanh tương tác `#1756A9` khỏi vai trò **màu chủ đạo** trong hai prompt nguồn. Chỉ xem bảng màu mới là hướng thiết kế prototype cho đến khi đối chiếu brand guideline ULAW.
- Dùng Inter hoặc Plus Jakarta Sans, fallback sans-serif. Menu desktop 16–18px, semibold; vùng nhấn tối thiểu 44px; tránh menu quá chật bằng khoảng cách cân đối, nhãn ngắn, và breakpoint hợp lý. Body 16–18px, line-height 1.5–1.65; H1 52–64px desktop và 34–40px mobile. Giao diện sáng, trong, tương phản tốt, ảnh sắc nét và có chủ đích; không lạm dụng gradient hay hiệu ứng.
- Desktop container 1200–1280px. Mobile không tràn ngang, không thu nhỏ chữ để ép toàn bộ menu vào một hàng.

### 3. Hai tầng điều hướng và trạng thái chọn

**Tầng 1 – thanh màu xanh `#1C56AE`:** tên Trường Đại học Luật TP. Hồ Chí Minh ở trái; bên phải gồm **Giảng viên · Đối tác · Biểu mẫu · Cổng sinh viên/Học liệu · Liên hệ** và lựa chọn ngôn ngữ chỉ khi có bản dịch/giải pháp thực sự vận hành. Đây là utility navigation, không lặp ba mục Giảng viên, Đối tác, Biểu mẫu ở tầng dưới. Nếu chiều rộng hẹp, đặt các mục tiện ích trong menu mobile có nhãn rõ; giữ lối vào Học liệu dễ tìm. Tab được chọn dùng sắc xanh lam sâu hoặc nền trắng/chữ xanh với chỉ dấu rõ, không chỉ đổi màu chữ.

**Tầng 2 – header trắng:** wordmark/logo được cung cấp ở trái; menu chính **Giới thiệu · Đào tạo · Nghiên cứu · Sinh viên · Tuyển sinh · Tin tức & Sự kiện**; bên phải có tìm kiếm và CTA **Tư vấn tuyển sinh**. Không có Giảng viên, Đối tác, Biểu mẫu ở tầng này. Tuyển dụng đặt trong nhóm Đối tác hoặc Sinh viên theo đối tượng, không tạo thêm tab chật chội. Nếu chưa có logo chính thức, dùng wordmark chữ; không tạo logo giả.

Tab đang mở hoặc route đang xem phải có trạng thái rõ bằng **màu nền/chữ tương phản, chỉ dấu gạch dưới hoặc viền, và `aria-current="page"` cho liên kết hiện hành**. Phân biệt trạng thái hover, focus, active và current; không dùng màu đơn độc. Khi mở mega menu, tab cha giữ trạng thái được chọn. Click lại tab, click bên ngoài hoặc Esc thì đóng; hỗ trợ bàn phím, focus hợp lý, không mất vị trí cuộn. Header sticky dạng gọn khi cuộn. Trên mobile dùng hamburger; chỉ nhóm cấp một được mở/thu gọn, mọi link con trong nhóm mở phải hiện cùng lúc, không có lớp dropdown thứ hai. Breadcrumb trên trang cấp hai.

Mega menu có tiêu đề, link “Xem tất cả”, nhóm liên kết trình bày nhiều cột dễ quét. Đào tạo hiển thị bảy ngành, riêng **Quản trị – Luật** có hai lựa chọn **Chính quy** và **Chất lượng cao/CLC** với trang hoặc mục chi tiết tương ứng sau khi nguồn chính thức xác nhận. Không đồng nhất CLC với nhãn “Tích hợp” trong bản prompt cũ. Tuyển sinh có ngành học, phương thức, đề án, học phí, học bổng, hỗ trợ tài chính, FAQ và tư vấn khi có dữ liệu đã xác thực. Sinh viên hiển thị cùng lúc Học tập, Học bổng, Thực tập, Cuộc sống sinh viên và lối vào Học liệu. Link không có đích thật phải ghi “Thông tin đang cập nhật”, không dùng `href="#"`.

### 4. Hero và banner động trang chủ

Thay khối hero hiện tại có card minh họa nhỏ ở bên phải bằng **banner ảnh lớn tràn chiều rộng vùng nội dung**, có sức hút thị giác như nhịp trình bày trong ảnh tham chiếu Văn Lang, nhưng sử dụng bố cục, màu và nội dung riêng của ULAW. H1 và hai CTA “Khám phá ngành học” → `/dao-tao`, “Tư vấn tuyển sinh” → `/tuyen-sinh#tu-van` phải nhìn rõ ngay khi vào trang. Không lặp H1 trong từng slide. Trên desktop dùng ảnh rộng 16:9 hoặc 3:2 với lớp phủ tinh tế sau chữ; mobile dùng crop/ảnh riêng nếu có, giữ người và chữ trong vùng an toàn, nội dung trước hoặc phủ ảnh có tương phản tốt.

Carousel có **tối đa ba slide được xuất bản tại một thời điểm** (chỉ một slide hiển thị trong viewport). Slide gồm ảnh/ảnh đại diện, eyebrow, tiêu đề ngắn, mô tả tối đa hai câu, một CTA và URL thật. Đề xuất nhóm thông tin: (1) định vị Khoa và bảy ngành; (2) trải nghiệm học tập/Học liệu; (3) tuyển sinh hoặc sự kiện nổi bật đã xác thực. Nội dung là dữ liệu độc lập gồm `title`, `summary`, `image`, `alt`, `ctaLabel`, `url`, `status`, `sourceUrl`, `startAt`, `endAt`, `order`; người quản trị thay được qua nguồn dữ liệu/CMS khi đã kết nối. Prototype chưa có CMS thì cấu trúc dữ liệu có thể sửa rõ ràng, **không tuyên bố đã có giao diện quản trị**.

Tự chuyển sau khoảng 5–6 giây khi trang đang được xem, có nút trước/sau, chấm vị trí có nhãn, nút tạm dừng/tiếp tục dễ thấy. Tạm dừng khi hover, focus bên trong, hoặc tab trình duyệt bị ẩn; không tự phát video có tiếng. Với `prefers-reduced-motion`, tắt tự chuyển và chuyển cảnh mạnh. Hỗ trợ bàn phím, aria labels và trạng thái thông báo hợp lý. Đặt kích thước ảnh trước khi tải; dùng ảnh thật được phép sử dụng hoặc ảnh minh họa có nhãn, tuyệt đối không đưa ảnh Văn Lang, xếp hạng Văn Lang hay logo trường khác lên site ULAW. Không tạo số liệu thành tích chưa được xác nhận.

### 5. Trang chủ và SECTION 9 Tin tức & Sự kiện

Giữ một thứ tự đọc mạch lạc: **Hero/banner → Lối vào nhanh → Ngành đào tạo → Business/Law/Technology → Trải nghiệm học tập → Học liệu → Đội ngũ → Nghiên cứu → Đối tác → Tin tức & Sự kiện → CTA tuyển sinh → Footer**. Những khối không có dữ liệu xác thực được trình bày bằng trạng thái “Thông tin đang cập nhật” có thiết kế hoàn chỉnh, không dựng số liệu/tên người giả. Có thể gộp Stories vào Tin tức để tránh lặp. Không bắt buộc giữ 12 section cũ nếu làm trang quá dài; ưu tiên chất lượng và hành trình người dùng.

**SECTION 9 – TIN TỨC & SỰ KIỆN** (tên section trong bản bàn giao này): headline **“TIN TỨC & SỰ KIỆN”**. Desktop chia **hai nửa 50/50** với khoảng cách cột rõ:

- **Trái: Tin tức nổi bật** – một card ảnh lớn tỷ lệ 3:2, dưới ảnh có nhãn danh mục, ngày được xác thực, tiêu đề trong khung trắng rõ nét như ảnh card tham chiếu; thêm tối đa 2 tin nhỏ nếu dữ liệu đủ. Toàn bộ card hoặc liên kết “Đọc tin” dẫn tới bài thật. Có link “Xem tất cả tin tức”. Không lấy ảnh, tiêu đề, ngày của Văn Lang làm dữ liệu ULAW.
- **Phải: Lịch sự kiện** – danh sách 3–4 sự kiện sắp tới, mỗi dòng có ô ngày nổi bật (ngày/tháng), tên, giờ, địa điểm hoặc hình thức, trạng thái đăng ký khi có URL thật. Sắp theo thời gian; sự kiện hết hạn không nằm trong mục sắp tới. Có link “Xem lịch sự kiện”. Nếu không có dữ liệu xác thực, hiển thị trạng thái trống đẹp và hữu ích, không tự bịa lịch.
- Mobile: xếp Tin tức trước, Lịch sự kiện sau; card một cột, ảnh không bị méo, tiêu đề không bị cắt tùy tiện, vùng nhấn dễ chạm. Khối tin và khối lịch có heading riêng, không dùng carousel lồng nhau.

Trang chủ vẫn cần lối vào nhanh cho học sinh/phụ huynh, sinh viên, giảng viên, đối tác và người cần liên hệ; card có đường dẫn thật. Bảy ngành đại học theo brief: Quản trị kinh doanh; Quản trị – Luật (Chính quy, CLC sau xác thực); Kinh doanh quốc tế; Tài chính – Ngân hàng; Kinh tế số; Thương mại điện tử; Công nghệ tài chính. Sau đại học, chương trình khác, học tập suốt đời chỉ xuất hiện khi có dữ liệu đã xác thực.

### 6. Các trang và Học liệu

Tối thiểu hoạt động: `/`, `/gioi-thieu`, `/dao-tao` và 7 trang ngành, `/doi-ngu` và chi tiết khi có hồ sơ, `/nghien-cuu`, `/sinh-vien`, `/doanh-nghiep`, `/tuyen-sinh`, `/tin-tuc` và trang bài viết, `/su-kien` nếu có dữ liệu, `/bieu-mau`, `/search`, `/hoc-lieu` với các nhóm CTĐT, đề cương, tài liệu học phần. Route lạ có trang 404 hữu ích. Có thể dùng kiến trúc hiện hữu; nếu project trống dùng React + TypeScript, routing và component/data độc lập. Nếu website đang được mở trực tiếp qua `file://`, bảo đảm bản bàn giao có cách chạy rõ ràng; các deep links phải hoạt động trên môi trường triển khai hoặc có giải pháp fallback phù hợp.

Học liệu là thư viện riêng: tìm kiếm và lọc theo loại, ngành, khóa, học kỳ, học phần, phiên bản; mỗi mục có nguồn, ngày cập nhật và nhãn Công khai/Dành cho sinh viên. Danh mục công khai được xem không cần đăng nhập. Tài liệu hạn chế chỉ cấp qua **SSO/OIDC chính thức của ULAW và kiểm tra quyền tại máy chủ** khi hạ tầng sẵn có. Không tạo form thu mật khẩu email của sinh viên, không để tệp hạn chế trong public assets hay lộ URL công khai. Nếu chưa có SSO/backend, chỉ làm luồng minh họa có nhãn rõ, không giả lập bảo mật hoặc nói đã đăng nhập thành công. Biểu mẫu hành chính tách khỏi Học liệu. Search không lập chỉ mục nội dung hạn chế.

Trang ngành dùng chung template nhưng nội dung từng ngành khác nhau. Chỉ hiển thị học phí, chỉ tiêu, phương thức, mã ngành, chuẩn đầu ra, giảng viên, đối tác và con số khi có nguồn chính thức. Form tư vấn chưa nối backend phải nói rõ “Biểu mẫu minh họa, chưa gửi dữ liệu”; có nhãn input, kiểm tra lỗi và đồng ý xử lý dữ liệu.

### 7. Ngôn ngữ, hình ảnh và dữ liệu

Tiếng Việt là bản gốc. Nếu triển khai nút VI/EN, ưu tiên bản dịch tiếng Anh biên tập cho nội dung quan trọng. Nếu tích hợp dịch máy bên thứ ba, chỉ làm khi phương thức triển khai được phép và hoạt động ổn định; gắn nhãn “Bản dịch tự động”, giữ nguyên tên riêng, mã ngành, số liệu, URL và dữ liệu người dùng nhập. Không hứa rằng Google Translate chắc chắn dịch đầy đủ mọi thành phần hoặc hoạt động trong môi trường `file://`; khi chưa tích hợp thật, ẩn nút EN hoặc ghi trạng thái chưa có bản dịch.

Ảnh dùng nguồn chính thức ULAW khi được phép, có alt text và quyền sử dụng; nếu chưa có, dùng ảnh minh họa được cấp phép với nhãn rõ. Không lấy logo, ảnh người, campus, xếp hạng, thông tin sự kiện từ ảnh Văn Lang. Dữ liệu nội dung có `status: verified | illustrative | pending`, `sourceUrl`, `updatedAt`; production chỉ xuất bản `verified`. Không dùng lorem ipsum, số “XX+” như thành tích thật, hoặc link chết.

### 8. Yêu cầu kỹ thuật và nghiệm thu

Component tái sử dụng: Header, UtilityNav, MegaMenu, MobileMenu, HeroCarousel, ProgramCard, NewsCard, EventList, FacultyCard, LearningResourceCard, Search, Breadcrumb, Footer, EmptyState. Tách dữ liệu khỏi view, đặt CSS tokens, metadata từng route. Ảnh responsive có `srcset` khi phù hợp, lazy load ảnh dưới nếp gấp, **không lazy load ảnh hero đầu tiên**, đặt width/height hoặc aspect ratio, tối ưu định dạng/dung lượng. HTML semantic, một H1/trang, focus rõ, Esc đóng menu, tương phản WCAG AA, vùng nhấn dễ chạm, giảm chuyển động. Không che nội dung bằng sticky header.

Kiểm tra thực tế ở 1440, 1024, 768 và 390px: không tràn ngang, tab rõ trạng thái current/open, top bar đúng `#1C56AE`, cặp xanh `#2D55A8` và `#2B6595` chi phối giao diện, accent được dùng tiết chế và đạt tương phản, ba mục Giảng viên/Đối tác/Biểu mẫu chỉ ở tầng trên, mega menu đầy đủ, carousel chuyển/tạm dừng/điều khiển được, SECTION 9 đúng hai cột trên desktop và một cột trên mobile, mọi URL nội bộ hoạt động. Kiểm tra build/lint nếu project hỗ trợ. Không tuyên bố đã kiểm thử thứ chưa chạy.

**Bàn giao:** (1) mã nguồn đã chỉnh trong project hiện tại; (2) hướng dẫn chạy hoặc mở bản build; (3) danh sách route/tương tác đã kiểm tra; (4) phần nào chỉ là minh họa, phần nào cần ULAW cung cấp: logo và brand guideline, ảnh được phép dùng, chương trình CLC, dữ liệu tuyển sinh, tin/sự kiện, hồ sơ đội ngũ, liên kết biểu mẫu, quyền Học liệu và SSO. Đưa ảnh chụp desktop/mobile của trang chủ và Học liệu nếu môi trường cho phép. Không dừng lại ở kế hoạch.

## PROMPT KẾT THÚC
