# English glossary and style (tools/i18n/en.json)

The English site under `en/` is generated from the Vietnamese pages by `tools/build_layout.py`.
Every Vietnamese text unit, attribute and script string is looked up in `en.json` ({Vietnamese: English}).
One Vietnamese string always gets one English string, everywhere, so filters keep matching.

## Style
- **UK English**: programme, organise, specialise, centre, enrol, licence (noun), -ise throughout.
- **Case**: sentence case for headings, buttons and labels ("View all programmes"). Proper names keep their capitals.
- **Punctuation**: typographic apostrophe ’ and quotes “ ” (never straight ' or "), en dash – for ranges, em dash — as in the source.
- **Plain characters, no HTML entities**: write `&`, not `&amp;`.
- **Keep numbers, dates, codes and emails** exactly as they are in the source.
- **Never invent facts**: translate what is there; placeholders such as “[Đang cập nhật]” become “[Being updated]”.
- **Length**: navigation labels must stay short, because the desktop header only just fits at 1280px.

## Markup in values
- `<1>…</1>`, `<2/>`: numbered slots for inline tags (links, bold, icons). Keep every slot exactly once; order may change.
- Script strings may contain real HTML (`<span class="…">…</span>`, `" alt="…`). Keep every tag, quote, `=` and `{name}` slot unchanged; translate only the words.
- **`|` lists** are translated item by item automatically; never put `|` in an English value, with one exception.
  - A **count unit** (the first argument of `ULAW_nOf`, e.g. `' tin'`) may be `"singular|plural"`: `listing|listings`.
- Leading/trailing spaces and arrows (→ ↗ ‹ › ▸) are handled automatically; don’t add them.
- `<br class="brand-br">` may be added where a line break is wanted (only the header wordmark uses it).

## Names
| Vietnamese | English |
|---|---|
| Khoa Quản trị | Faculty of Management (“the Faculty” when short) |
| Trường Đại học Luật TP. Hồ Chí Minh (ULAW) | Ho Chi Minh City University of Law (ULAW) (“the University”) |
| Trường Đại học Luật TP.HCM | HCMC University of Law |
| KHOA QUẢN TRỊ (wordmark) | FACULTY OF MANAGEMENT |
| Tư duy Quản trị – Bản lĩnh pháp lý (slogan) | Managerial Thinking – Legal Confidence |
| Ban Chủ nhiệm Khoa | Faculty Leadership |
| Trưởng khoa / Phó Trưởng khoa | Dean / Vice Dean |
| Bộ môn X / Trưởng bộ môn | Department of X / Head of Department |
| Phòng Tư vấn tuyển sinh | Admissions Office |
| Phòng Đào tạo Sau đại học (SĐH) | Postgraduate Training Office |

Programmes: Quản trị kinh doanh = Business Administration · Quản trị – Luật = Management and Law · Kinh doanh quốc tế = International Business · Tài chính – Ngân hàng = Finance and Banking · Kinh tế số = Digital Economy · Thương mại điện tử = E-Commerce · Công nghệ tài chính = Financial Technology · Thạc sĩ Quản trị kinh doanh = Master of Business Administration (MBA).

Tracks: Thường = Standard · Hội nhập quốc tế = International Integration.

Departments: Công nghệ quản lý = Management Technology · Kinh doanh = Business · Kinh tế đối ngoại = International Economic Relations · Quản trị tài chính kế toán = Financial Management and Accounting.

## Navigation (fixed)
Giới thiệu = About · Đào tạo = Programmes · Nghiên cứu = Research · Đội ngũ = People · Sinh viên = Students · Đối tác = Partners · Alumni = Alumni · Tin tức & Sự kiện = News & Events · Tư vấn tuyển sinh = Admissions advice · Biểu mẫu = Forms · Liên hệ = Contact · Học liệu = Learning resources · E-Learning = E-Learning.

## Terms
| Vietnamese | English |
|---|---|
| ngành, ngành học, ngành đào tạo | programme (“Ngành X” → “the X programme”) |
| chương trình đào tạo (CTĐT) | curriculum |
| đề cương (chi tiết học phần) | syllabus |
| học phần / tín chỉ (TC) | module / credits (cr) |
| khóa (Khóa 45) / học kỳ | cohort (Cohort 45) / semester |
| đại học / sau đại học / thạc sĩ | undergraduate / postgraduate / Master’s |
| sinh viên / học viên / cựu sinh viên | students / (postgraduate) students / alumni |
| giảng viên / giảng viên thỉnh giảng / chuyên gia | lecturer / visiting lecturer / expert |
| tuyển sinh / tư vấn tuyển sinh | admissions / admissions advice |
| học bổng / học bổng khuyến khích | scholarship / merit scholarship |
| học liệu / Thư viện Học liệu | learning resources / Learning Resources Library |
| biểu mẫu | forms |
| nghiên cứu khoa học (NCKH) | research; NCKH sinh viên = student research |
| công bố / đề tài / hội thảo | publications / research projects / conference (hội thảo khoa học) or seminar |
| khóa luận tốt nghiệp | graduation thesis |
| thực tập / thực tập sinh / tuyển dụng | internship / intern / recruitment, jobs |
| đối tác / doanh nghiệp | partners / businesses, companies, industry |
| câu lạc bộ / hoạt động sinh viên | clubs / student activities |
| thông báo / thông báo học vụ / lịch thi | notices / academic notices / exam schedule |
| lịch trực khoa | Faculty duty roster |
| đăng nhập (một lần, SSO) | sign in (single sign-on, SSO) |

## Status labels
| Vietnamese | English |
|---|---|
| Nội dung minh họa / [Minh họa] | Illustrative content / [Illustrative] |
| Ảnh minh họa | Illustration |
| Đang cập nhật | Being updated |
| Thông tin đang cập nhật | Information coming soon |
| Đã xác thực | Verified |
| Biểu mẫu minh họa, chưa gửi dữ liệu | Demo form – no data is sent |
| (mở trang mới) | (opens in a new tab) |
| Mới / Ghim / Hạn | New / Pinned / Deadline |
| Xem chi tiết / Xem tất cả / Xem thêm | View details / View all / See more |

Keep as they are: Alumni, E-Learning, ULAW, FAQ, Case study / Case Studies, [Demo], Career Talk, Workshop, Seminar, Mentoring.
