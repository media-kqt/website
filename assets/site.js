// =========================================================
// ULAW site — shared behaviour and data-driven views.
// Loaded at the end of <body>; data comes from assets/data.js and the
// illustrations from assets/scenes.js (both loaded in <head>).
// =========================================================

(function(){
  "use strict";

  var body = document.body;
  // Asset root (assets/…, downloadable files) and page root (…/x.html). They are equal on the Vietnamese
  // pages; the English copies under en/ sit one level deeper but share assets/ with the Vietnamese site.
  var ROOT = body.getAttribute('data-root') || '';
  var PAGE_ROOT = body.hasAttribute('data-page-root') ? body.getAttribute('data-page-root') : ROOT;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- language ----------
  // The Vietnamese pages are the source. tools/build_layout.py generates the English site under en/ and
  // assets/site.en.js / data.en.js, replacing every Vietnamese string literal from tools/i18n/en.json.
  // Code between i18n:off and i18n:on is copied as is: it holds what differs by logic, not by wording.
  var EN = document.documentElement.lang === 'en';
  var nOf = window.ULAW_nOf, fill = window.ULAW_fill;
  /* i18n:off */
  function fmtDate(d){
    return new Date(d).toLocaleDateString(EN ? 'en-GB' : 'vi-VN', EN ? {day:'numeric', month:'short', year:'numeric'} : undefined);
  }
  function fmtNum(n){ return Number(n).toLocaleString(EN ? 'en-GB' : 'vi-VN'); }  // 12500 → 12.500 / 12,500
  var MONTHS = EN ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    : ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
  var MONTH_NAMES = EN ? ['January','February','March','April','May','June','July','August','September','October','November','December']
    : ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  var WEEK_SHORT = EN ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['T2','T3','T4','T5','T6','T7','CN'];
  var WEEK_DAYS = EN ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] : ['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  /* i18n:on */

  // ---------- helpers ----------
  // A page link (path empty or ending in .html or /, before any ?query or #hash) resolves against
  // PAGE_ROOT, anything else against ROOT. tools/i18n_build.py applies the same rule to the pages.
  function isPage(path){ var p = String(path).split(/[?#]/)[0]; return p === '' || /(\.html|\/)$/.test(p); }
  function url(path){
    if(!path) return '';
    if(/^(https?:|mailto:|tel:|#|\/)/.test(path)) return path;
    return (isPage(path) ? PAGE_ROOT : ROOT) + path;
  }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function published(list){ return window.ULAW_published ? window.ULAW_published(list) : (list || []).slice(); }
  function norm(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function statusBadge(status){
    if(status === 'illustrative') return '<span class="badge badge-illustrative">Nội dung minh họa</span>';
    if(status === 'pending') return '<span class="badge badge-pending">Đang cập nhật</span>';
    if(status === 'verified') return '<span class="badge badge-verified">Đã xác thực</span>';
    return '';
  }
  // Scene key (scenes.js) → inline illustration with a visible label;
  // anything that looks like a path → <img> with intrinsic size.
  function media(image, alt, opts){
    opts = opts || {};
    if(image && /\.(jpe?g|png|webp|avif|svg)$/i.test(image)){
      return '<img src="' + esc(url(image)) + '" alt="' + esc(alt) + '" width="' + (opts.w || 1200) + '" height="' + (opts.h || 800) + '"' +
        (opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
    }
    var svg = '';
    if(image && window.ULAW_HERO_SCENES && window.ULAW_HERO_SCENES[image]) svg = window.ULAW_heroSvg(image);
    else if(image && window.ULAW_SCENES && window.ULAW_SCENES[image]) svg = window.ULAW_SCENES[image];
    return '<span role="img" aria-label="' + esc(alt) + '">' + svg + '</span>' +
      (opts.noLabel ? '' : '<span class="illus-label" aria-hidden="true">Ảnh minh họa</span>');
  }
  function emptyState(o){
    var actions = (o.actions || []).map(function(a){
      return '<a class="btn ' + (a.cls || 'btn-secondary') + '" href="' + esc(url(a.href)) + '"' + ext(a.href) + '>' + esc(a.label) + '</a>';
    }).join('');
    return '<div class="empty-state">' +
      '<div class="es-icon" aria-hidden="true">' + (o.icon || 'ⓘ') + '</div>' +
      '<h3>' + esc(o.title) + '</h3><p>' + esc(o.text) + '</p>' +
      (actions ? '<div class="hero-ctas">' + actions + '</div>' : '') + '</div>';
  }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function upcoming(list, limit){
    var now = Date.now();
    return published(list)
      .filter(function(e){ return e.startAt && new Date(e.endAt || e.startAt).getTime() >= now; })
      .sort(function(a, b){ return new Date(a.startAt) - new Date(b.startAt); })
      .slice(0, limit || 4);
  }
  function eventRow(e){
    var d = new Date(e.startAt);
    var reg = e.registerUrl
      ? ' · <a href="' + esc(url(e.registerUrl)) + '">Đăng ký tham dự</a>'
      : '';
    var title = e.url ? '<a href="' + esc(url(e.url)) + '">' + esc(e.title) + '</a>' : esc(e.title);
    return '<li class="event-row">' +
      '<div class="event-date" aria-hidden="true"><span class="d">' + pad(d.getDate()) + '</span><span class="m">' + MONTHS[d.getMonth()] + '</span></div>' +
      '<div><h4>' + title + '</h4>' +
      '<p class="event-info"><span class="visually-hidden">' + 'Ngày ' + fmtDate(d) + ', </span>' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' · ' + esc(e.place || e.mode || 'Địa điểm đang cập nhật') + reg + '</p></div></li>';
  }
  function newsDate(n){ return n.date ? fmtDate(n.date) : 'Ngày: chưa xác thực'; }

  // External links (http/https) open in a new tab.
  function ext(href){ return /^https?:/.test(href || '') ? ' target="_blank" rel="noopener"' : ''; }
  var ADMISSIONS = window.ULAW_ADMISSIONS_URL || 'https://tuyensinh.hcmulaw.edu.vn/';

  window.ULAW_url = url;
  window.ULAW_esc = esc;

  // Per-programme illustration + colour tone (variants of the ULAW palette, kept soft).
  var PROGRAM_LOOK = {
    'quan-tri-kinh-doanh': {scene:'study_group__navy', tone:'#2D55A8'},
    'quan-tri-luat':       {scene:'hero-programs', tone:'#1C5E97'},
    'kinh-doanh-quoc-te':  {scene:'handshake_business__purple', tone:'#9B57A0'},
    'tai-chinh-ngan-hang': {scene:'research_books__green', tone:'#169C83'},
    'kinh-te-so':          {scene:'teamwork_meeting__green', tone:'#0E9A9A'},
    'thuong-mai-dien-tu':  {scene:'graduation_career__red', tone:'#E08A2E'},
    'cong-nghe-tai-chinh': {scene:'hero-learning', tone:'#4D6CC0'}
  };

  // ---------- program detail pages (dao-tao/<slug>.html) ----------
  // Runs first so the sub-nav scroll-spy below can bind to the rendered links.
  (function(){
    var root = document.getElementById('prog-root');
    if(!root) return;
    // "Phương pháp học & trải nghiệm thực tiễn": photo collage with mixed frame shapes.
    // Photos come from p.learningPhotos ([{image, alt}] — image path or scene key); illustrations until then.
    function learningCollage(p){
      var slots = [
        {cls:'lc-arch',    label:'Giảng dạy trên lớp',        tone:'#2D55A8', scene:'study_group__navy'},
        {cls:'lc-polaroid',label:'Case study',                 tone:'#E08A2E', scene:'research_books__purple'},
        {cls:'lc-circle',  label:'Dự án ứng dụng',             tone:'#169C83', scene:'laptop_tech__green'},
        {cls:'lc-tall',    label:'Trải nghiệm doanh nghiệp',   tone:'#9B57A0', scene:'handshake_business__purple'}
      ];
      var photos = p.learningPhotos || [];
      var frames = slots.map(function(sl, i){
        var ph = photos[i] || {};
        return '<figure class="lc-frame ' + sl.cls + '" style="--tone:' + sl.tone + '">' +
          '<div class="lc-img">' + media(ph.image || sl.scene, ph.alt || ('Ảnh minh họa: ' + sl.label.toLowerCase()), {w:800, h:800}) + '</div>' +
          '<figcaption><span class="lc-num">0' + (i + 1) + '</span>' + esc(sl.label) + '</figcaption></figure>';
      }).join('');
      var methods = slots.map(function(sl){ return '<li style="--tone:' + sl.tone + '">' + esc(sl.label) + '</li>'; }).join('');
      return '<section class="section lc-sec" id="trai-nghiem"><span class="lc-word" aria-hidden="true">Learn by doing</span><div class="container lc-layout">' +
        '<div class="lc-copy"><span class="eyebrow">Phương pháp học</span>' +
          '<h2>Học từ lớp học đến <span>thực tiễn</span></h2>' +
          '<p>Kết hợp giảng dạy trên lớp, case study, dự án ứng dụng và trải nghiệm cùng doanh nghiệp. Hình thức cụ thể của từng khóa được cập nhật theo kế hoạch đào tạo chính thức.</p>' +
          '<ul class="lc-methods">' + methods + '</ul>' +
          '<a class="link-arrow" href="' + esc(url('doanh-nghiep/index.html')) + '">Xem hoạt động kết nối doanh nghiệp →</a></div>' +
        '<div class="lc-collage">' + frames + '<span class="lc-tape lc-tape-1" aria-hidden="true"></span><span class="lc-tape lc-tape-2" aria-hidden="true"></span>' +
          '<span class="lc-spark" aria-hidden="true">✦</span></div>' +
      '</div></section>';
    }

    // Four knowledge blocks with credits (tín chỉ) + a part-to-whole bar + law-credit highlight.
    function creditStructure(p){
      var cr = p.credits || {}, cur = p.curriculum || [];
      var blocks = [
        {key:'coSo', label:'Khối kiến thức cơ sở', tone:'#2D55A8', desc:(cur[0] || {}).desc || 'Kiến thức nền tảng về quản trị, kinh tế và pháp luật.'},
        {key:'chuyenNganh', label:'Khối kiến thức chuyên ngành', tone:'#9B57A0', desc:[(cur[1] || {}).desc, (cur[2] || {}).desc].filter(Boolean).join(' ') || 'Học phần chuyên sâu của ngành.'},
        {key:'thucTap', label:'Thực tập', tone:'#169C83', desc:'Trải nghiệm thực tế tại doanh nghiệp, tổ chức theo kế hoạch đào tạo.'},
        {key:'khoaLuan', label:'Khóa luận tốt nghiệp', tone:'#E08A2E', desc:'Công trình tổng hợp kiến thức, hoặc học phần thay thế theo quy định.'}
      ];
      var known = blocks.every(function(b){ return typeof cr[b.key] === 'number'; });
      var total = known ? blocks.reduce(function(t, b){ return t + cr[b.key]; }, 0) : null;
      var bar = '<div class="cs-bar' + (known ? '' : ' is-pending') + '" role="img" aria-label="' +
          (known ? 'Cơ cấu tín chỉ: ' + blocks.map(function(b){ return b.label + ' ' + cr[b.key] + ' tín chỉ'; }).join(', ') : 'Cơ cấu tín chỉ: đang cập nhật') + '">' +
        blocks.map(function(b){
          var w = known ? (cr[b.key] / total * 100) : 25;
          return '<span class="cs-seg" style="--tone:' + b.tone + ';width:' + w + '%" title="' + esc(b.label) + (known ? ': ' + cr[b.key] + ' TC' : '') + '">' +
            (known && w >= 9 ? '<b>' + cr[b.key] + '</b>' : '') + '</span>';
        }).join('') + '</div>';
      var legend = '<ul class="cs-legend">' + blocks.map(function(b){
        return '<li><span class="cs-swatch" style="--tone:' + b.tone + '"></span>' + esc(b.label) + '</li>'; }).join('') + '</ul>';
      var law = typeof cr.luat === 'number'
        ? '<div class="cs-law"><span class="cs-law-ico" aria-hidden="true">⚖</span><div><strong>' + cr.luat + ' tín chỉ</strong> kiến thức pháp lý' +
            (total ? ' <span>(' + Math.round(cr.luat / total * 100) + '% chương trình)</span>' : '') + '<small>Dấu ấn riêng của một ngành học trong trường luật.</small></div></div>'
        : '<div class="cs-law"><span class="cs-law-ico" aria-hidden="true">⚖</span><div><strong>— tín chỉ</strong> kiến thức pháp lý <span class="badge badge-pending">Đang cập nhật</span>' +
            '<small>Số tín chỉ các học phần pháp luật trong chương trình sẽ hiển thị khi có CTĐT chính thức.</small></div></div>';
      var cards = '<div class="cs-blocks">' + blocks.map(function(b, i){
        var c = cr[b.key];
        return '<article class="cs-block" style="--tone:' + b.tone + '"><span class="cs-step">0' + (i + 1) + '</span>' +
          '<div class="cs-credit"><strong>' + (typeof c === 'number' ? c : '—') + '</strong><span>tín chỉ</span></div>' +
          '<h3>' + esc(b.label) + '</h3><p>' + esc(b.desc) + '</p>' +
          (typeof c === 'number' ? '' : '<span class="badge badge-pending">Đang cập nhật</span>') + '</article>';
      }).join('') + '</div>';
      return '<div class="cs-summary"><div class="cs-total"><strong>' + (total || '—') + '</strong><span>tổng tín chỉ</span></div>' +
        '<div class="cs-bar-wrap">' + bar + legend + '</div></div>' + law + cards;
    }

    var slug = root.getAttribute('data-slug');
    var p = published(window.ULAW_PROGRAMS).filter(function(x){ return x.slug === slug; })[0];
    if(!p){
      root.innerHTML = '<section class="section"><div class="container">' + emptyState({title:'Không tìm thấy ngành học',
        text:'Ngành này chưa có dữ liệu được xuất bản.', actions:[{label:'Xem tất cả ngành', href:'dao-tao/index.html'}]}) + '</div></section>';
      return;
    }
    var tags = document.querySelector('[data-prog-tags]');
    if(tags) tags.innerHTML = p.keywords.map(function(k){ return '<span class="tag">' + esc(k) + '</span>'; }).join('');
    var visual = document.querySelector('[data-prog-visual]');
    if(visual && window.ULAW_groupScene){
      var gs = window.ULAW_groupScene(p.group);
      visual.innerHTML = media(gs.scene + '__' + gs.bg, fill('Ảnh minh họa cho ngành {name}', {name: p.name}));
    }

    var pendingCard = function(title){
      return '<div class="card"><h3>' + title + '</h3>' + statusBadge('pending') +
        '<p>Chỉ hiển thị khi có nguồn chính thức từ cổng tuyển sinh của Trường.</p></div>';
    };
    var tracksHtml = '';
    if(p.tracks && p.tracks.length){
      tracksHtml = '<section class="section" id="he-dao-tao"><div class="container max-w-wide">' +
        '<h2>Hệ đào tạo</h2><p>' + fill('Ngành {name} có hai lựa chọn. Thông tin chi tiết từng hệ được công bố theo nguồn chính thức.', {name: esc(p.name)}) + '</p>' +
        '<div class="track-cards">' + p.tracks.map(function(t){
          return '<article class="track-card' + (t.status === 'pending' ? ' is-pending' : '') + '" id="' + esc(t.key) + '">' +
            '<h3>' + esc(t.label) + '</h3>' + statusBadge(t.status) +
            '<p style="margin-top:10px">' + esc(t.summary) + '</p>' +
            '<p class="event-info">Mã ngành, chỉ tiêu, học phí và chương trình chi tiết: Thông tin đang cập nhật.</p></article>';
        }).join('') + '</div></div></section>';
    }
    var faqHtml = (window.ULAW_FAQ_GENERIC || []).map(function(item){
      return '<details class="faq-item"><summary>' + esc(item.q) + '<span class="car" aria-hidden="true"></span></summary><div class="faq-a">' + esc(item.a) + '</div></details>';
    }).join('');

    root.innerHTML =
      '<nav class="subnav subnav-prog" aria-label="Mục lục trang" style="--tone:' + ((PROGRAM_LOOK[p.slug] || {}).tone || '#2D55A8') + '"><div class="container">' +
        '<span class="subnav-name"><span class="subnav-dot" aria-hidden="true"></span>' + esc(p.name) + '</span>' +
        '<a href="#tong-quan">Tổng quan</a>' + (tracksHtml ? '<a href="#he-dao-tao">Hệ đào tạo</a>' : '') +
        '<a href="#chuong-trinh">Chương trình học</a>' +
        '<a href="#trai-nghiem">Trải nghiệm</a><a href="#nghe-nghiep">Nghề nghiệp</a><a href="#faq">FAQ</a>' +
      '</div></nav>' +
      '<section class="section" id="tong-quan"><div class="container max-w-wide">' +
        '<h2>Tổng quan</h2><p>' + esc(p.short) + ' Chương trình được thiết kế trên nền tảng chung quản trị – pháp lý – công nghệ của Khoa Quản trị, giúp người học vừa vững chuyên môn ngành vừa có tư duy pháp lý và năng lực công nghệ.</p>' +
        '<div class="grid grid-2" style="margin-top:16px">' + pendingCard('Mã ngành · Chỉ tiêu · Học phí') + pendingCard('Bằng cấp · Thời lượng') + '</div>' +
      '</div></section>' +
      tracksHtml +
      '<section class="section section-soft" id="chuong-trinh"><div class="container max-w-wide">' +
        '<h2>Cấu trúc học tập</h2><p>Chương trình gồm bốn khối; số tín chỉ theo chương trình đào tạo chính thức — xem tại <a class="link-arrow" href="' + esc(url('hoc-lieu/index.html#ctdt')) + '">Học liệu</a>.</p>' +
        creditStructure(p) +
      '</div></section>' +
      learningCollage(p) +
      '<section class="section section-soft" id="nghe-nghiep"><div class="container max-w-wide">' +
        '<h2>Hướng nghề nghiệp</h2><p>Các hướng dưới đây mô tả khả năng phát triển, không phải cam kết việc làm.</p>' +
        '<ul class="tags">' + p.careers.map(function(c){ return '<li class="tag">' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '</div></section>' +
      '<section class="section" id="faq"><div class="container max-w"><h2>Câu hỏi thường gặp</h2>' + faqHtml + '</div></section>' +
      '<section class="section section-deep text-center"><div class="container"><h2>' + fill('Quan tâm ngành {name}?', {name: esc(p.name)}) + '</h2>' +
        '<div class="hero-ctas" style="justify-content:center"><a class="btn btn-cta" href="' + esc(ADMISSIONS) + '" target="_blank" rel="noopener">Tư vấn tuyển sinh<span class="visually-hidden"> (mở trang mới)</span></a></div></div></section>';

    // Deep links such as #tich-hop point at content that only exists after render.
    if(window.location.hash){
      var target = document.getElementById(window.location.hash.slice(1));
      if(target) target.scrollIntoView();
    }
  })();

  // ---------- focus trap for modal panels ----------
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  function trapTab(container, e){
    if(e.key !== 'Tab') return;
    var items = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function(el){ return el.offsetParent !== null; });
    if(!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  // ---------- VI/EN switch ----------
  // Two plain links to the same page in the other language (hrefs written by tools/build_layout.py);
  // CSS on html[lang] shows the current language. Carry ?query and #hash over, e.g. bo-mon.html?id=….
  if(location.search || location.hash){
    document.querySelectorAll('[data-lang-switch] a[data-lang]').forEach(function(a){
      var href = a.getAttribute('href');
      if(href && !/[?#]/.test(href)) a.setAttribute('href', href + location.search + location.hash);
    });
  }

  // ---------- sticky header compact state ----------
  var header = document.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('is-compact', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---------- mega menu: click toggles, click outside / Esc / focus leaving closes ----------
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item.has-mega'));
  function setMega(item, open){
    item.classList.toggle('is-open', open);
    var trigger = item.querySelector('.nav-link');
    if(trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAllMega(except){ navItems.forEach(function(item){ if(item !== except) setMega(item, false); }); }
  navItems.forEach(function(item){
    var trigger = item.querySelector('.nav-link');
    if(!trigger) return;
    trigger.addEventListener('click', function(){
      var open = !item.classList.contains('is-open');
      closeAllMega(item);
      setMega(item, open);
    });
    trigger.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        closeAllMega(item);
        setMega(item, true);
        var first = item.querySelector('.mega a');
        if(first) first.focus();
      }
    });
    item.addEventListener('focusout', function(e){
      if(e.relatedTarget && !item.contains(e.relatedTarget)) setMega(item, false);
    });
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('.nav-item')) closeAllMega(); });

  // ---------- mobile menu (modal dialog) ----------
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');
  var mobileClose = document.querySelector('.mobile-menu-close');
  function openMobileMenu(){
    if(!mobileMenu) return;
    mobileMenu.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if(hamburger) hamburger.setAttribute('aria-expanded', 'true');
    if(mobileClose) mobileClose.focus();
  }
  function closeMobileMenu(restoreFocus){
    if(!mobileMenu || mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    document.documentElement.style.overflow = '';
    if(hamburger){
      hamburger.setAttribute('aria-expanded', 'false');
      if(restoreFocus !== false) hamburger.focus();
    }
  }
  if(hamburger) hamburger.addEventListener('click', openMobileMenu);
  if(mobileClose) mobileClose.addEventListener('click', function(){ closeMobileMenu(); });
  if(mobileMenu){
    mobileMenu.addEventListener('keydown', function(e){ trapTab(mobileMenu, e); });
    // In-page anchors inside the menu should close it so the target is visible.
    mobileMenu.addEventListener('click', function(e){ if(e.target.closest('a')) closeMobileMenu(false); });
  }
  window.addEventListener('resize', function(){ if(window.innerWidth >= 1280) closeMobileMenu(false); });

  // ---------- search dialog ----------
  var searchOverlay = document.querySelector('.search-overlay');
  var searchOpener = null;
  function openSearch(opener){
    if(!searchOverlay) return;
    searchOpener = opener || null;
    searchOverlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    var input = searchOverlay.querySelector('input[type=search]');
    if(input) input.focus();
  }
  function closeSearch(){
    if(!searchOverlay || searchOverlay.hidden) return;
    searchOverlay.hidden = true;
    document.documentElement.style.overflow = '';
    if(searchOpener) searchOpener.focus();
  }
  document.querySelectorAll('[data-search-open]').forEach(function(t){
    t.addEventListener('click', function(e){ e.preventDefault(); openSearch(t); });
  });
  if(searchOverlay){
    var sc = searchOverlay.querySelector('.search-close');
    if(sc) sc.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', function(e){ if(e.target === searchOverlay) closeSearch(); });
    searchOverlay.addEventListener('keydown', function(e){ trapTab(searchOverlay, e); });
  }

  // ---------- small dropdowns ([data-dropdown]: toggle + menu), e.g. the admissions CTA ----------
  // Delegated, so dropdowns rendered later (program pages, empty states) work too.
  // Non-header menus are positioned against the viewport so clipping parents can't hide them.
  function openDropdowns(){ return Array.prototype.slice.call(document.querySelectorAll('[data-dropdown].is-open')); }
  function setDropdown(dd, open){
    var t = dd.querySelector('[data-dropdown-toggle]'), m = dd.querySelector('[data-dropdown-menu]');
    if(!t || !m) return;
    m.hidden = !open;
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    dd.classList.toggle('is-open', open);
    if(open && dd.hasAttribute('data-dropdown-float')){
      var r = t.getBoundingClientRect(), w = m.offsetWidth;
      m.style.position = 'fixed';
      m.style.left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12)) + 'px';
      var below = r.bottom + 8, h = m.offsetHeight;
      m.style.top = (below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 8) : below) + 'px';
      m.style.right = 'auto';
    }
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-dropdown-toggle]');
    var dd = t ? t.closest('[data-dropdown]') : null;
    openDropdowns().forEach(function(o){ if(o !== dd && !o.contains(e.target)) setDropdown(o, false); });
    if(!dd) return;
    var open = !dd.classList.contains('is-open');
    closeAllMega();
    setDropdown(dd, open);
    if(open && e.detail === 0){ var first = dd.querySelector('[data-dropdown-menu] a, [data-dropdown-menu] button'); if(first) first.focus(); }
  });
  document.addEventListener('focusout', function(e){
    openDropdowns().forEach(function(dd){ if(dd.contains(e.target) && e.relatedTarget && !dd.contains(e.relatedTarget)) setDropdown(dd, false); });
  });
  window.addEventListener('scroll', function(){
    openDropdowns().forEach(function(dd){ if(dd.hasAttribute('data-dropdown-float')) setDropdown(dd, false); });
  }, {passive:true});
  window.addEventListener('resize', function(){ openDropdowns().forEach(function(dd){ setDropdown(dd, false); }); });

  // Every "Tư vấn tuyển sinh" CTA offers both admissions sites (đại học / sau đại học).
  var ADMISSIONS_PG = window.ULAW_ADMISSIONS_POSTGRAD_URL || 'https://ts.hcmulaw.edu.vn/sau-dai-hoc';
  var ddCount = 0;
  function admissionsDropdown(label, btnClass){
    var id = 'adm-menu-' + (++ddCount);
    var nt = '<span class="visually-hidden"> (mở trang mới)</span>';
    return '<span class="adm-dropdown" data-dropdown data-dropdown-float>' +
      '<button type="button" class="' + esc(btnClass) + '" aria-expanded="false" aria-controls="' + id + '" data-dropdown-toggle>' + esc(label) +
        '<span class="nav-caret" aria-hidden="true"></span></button>' +
      '<ul class="cta-menu" id="' + id + '" data-dropdown-menu hidden>' +
        '<li><a href="' + esc(ADMISSIONS) + '" target="_blank" rel="noopener"><strong>Tuyển sinh đại học</strong><span>Phòng Tư vấn tuyển sinh ULAW ↗</span>' + nt + '</a></li>' +
        '<li><a href="' + esc(ADMISSIONS_PG) + '" target="_blank" rel="noopener"><strong>Tuyển sinh sau đại học</strong><span>Thạc sĩ · Cổng tuyển sinh ULAW ↗</span>' + nt + '</a></li>' +
      '</ul></span>';
  }
  function upgradeAdmissionsCtas(root){
    Array.prototype.forEach.call((root || document).querySelectorAll('a.btn-cta[href="' + ADMISSIONS + '"]'), function(a){
      if(a.closest('.mobile-menu, [data-dropdown]')) return;
      var label = (a.firstChild && a.firstChild.nodeType === 3 ? a.firstChild.nodeValue : a.textContent).replace(/[↗]/g, '').trim() || 'Tư vấn tuyển sinh';
      var wrap = document.createElement('span');
      wrap.innerHTML = admissionsDropdown(label, a.className);
      a.parentNode.replaceChild(wrap.firstChild, a);
    });
  }

  // ---------- Escape closes the innermost open layer ----------
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(searchOverlay && !searchOverlay.hidden){ closeSearch(); return; }
    if(mobileMenu && !mobileMenu.hidden){ closeMobileMenu(); return; }
    var dd = openDropdowns()[0];
    if(dd){ setDropdown(dd, false); dd.querySelector('[data-dropdown-toggle]').focus(); return; }
    var open = navItems.filter(function(i){ return i.classList.contains('is-open'); })[0];
    if(open){ setMega(open, false); var t = open.querySelector('.nav-link'); if(t) t.focus(); }
  });

  // ---------- client-side search (overlay + /search page) ----------
  function searchIndex(query, kind){
    var q = norm(query.trim());
    return (window.ULAW_SEARCH_INDEX || []).filter(function(item){
      if(kind !== 'all' && item.kind !== kind) return false;
      if(!q) return true;
      return norm(item.title).indexOf(q) > -1 || norm(item.desc).indexOf(q) > -1;
    });
  }
  function resultsHtml(items){
    return items.map(function(item){
      return '<a class="search-result" href="' + esc(url(item.url)) + '"' + ext(item.url) + '>' +
        '<span class="kind">' + esc(item.kindLabel) + '</span>' +
        '<h3>' + esc(item.title) + '</h3><p>' + esc(item.desc) + '</p></a>';
    }).join('');
  }
  function bindChips(chips, attr, onChange){
    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', 'true');
        onChange(chip.getAttribute(attr));
      });
    });
  }

  (function(){
    if(!searchOverlay) return;
    var input = searchOverlay.querySelector('input[type=search]');
    var results = searchOverlay.querySelector('.search-results');
    var kind = 'all';
    function render(){
      var q = input.value;
      if(!q.trim() && kind === 'all'){
        results.innerHTML = '<p class="search-empty">' + 'Nhập từ khóa để tìm ngành học, tin tức, học liệu hoặc biểu mẫu.' + '</p>';
        return;
      }
      var items = searchIndex(q, kind);
      results.innerHTML = items.length ? resultsHtml(items)
        : '<p class="search-empty">' + 'Không tìm thấy kết quả phù hợp. Thử một từ khóa khác (có dấu hoặc không dấu đều được).' + '</p>';
    }
    input.addEventListener('input', render);
    bindChips(Array.prototype.slice.call(searchOverlay.querySelectorAll('.tab-chip')), 'data-kind', function(k){ kind = k; render(); });
    render();
  })();

  (function(){
    var input = document.querySelector('[data-page-search-input]');
    var results = document.querySelector('[data-page-search-results]');
    if(!input || !results) return;
    var kind = 'all';
    function render(){
      var q = input.value;
      if(!q.trim()){
        results.innerHTML = '<p class="search-empty">' + 'Nhập từ khóa để bắt đầu tìm kiếm.' + '</p>';
        return;
      }
      var items = searchIndex(q, kind);
      results.innerHTML = items.length
        ? '<p class="result-count">' + fill(nOf('{n} kết quả cho “{q}”', items.length), {q: esc(q)}) + '</p>' + resultsHtml(items)
        : emptyState({title:'Không có kết quả', icon:'⌕',
            text:fill('Không tìm thấy nội dung khớp với “{q}”. Thử kiểm tra chính tả hoặc dùng từ khóa khác.', {q: q}),
            actions:[{label:'Xem ngành đào tạo', href:'dao-tao/index.html'}, {label:'Mở Học liệu', href:'hoc-lieu/index.html'}]});
    }
    input.value = new URLSearchParams(window.location.search).get('q') || '';
    input.addEventListener('input', render);
    var form = input.closest('form');
    if(form) form.addEventListener('submit', function(e){ e.preventDefault(); render(); });
    bindChips(Array.prototype.slice.call(document.querySelectorAll('[data-page-search-tab]')), 'data-page-search-tab', function(k){ kind = k; render(); });
    render();
  })();

  // ---------- home: key-figure counters (count up when scrolled into view) ----------
  (function(){
    var grid = document.getElementById('stats');
    if(!grid) return;
    var fmt = fmtNum;
    var stats = window.ULAW_STATS || [];
    if(window.ULAW_PUBLISH_MODE === 'production') stats = stats.filter(function(x){ return x.status === 'verified'; });
    grid.innerHTML = stats.map(function(st){
      var known = typeof st.value === 'number';
      return '<li class="stat-card' + (known ? '' : ' is-pending') + '" style="--tone:' + esc(st.tone || '#2D55A8') + '">' +
        (known
          ? '<span class="stat-num" data-count="' + st.value + '" data-suffix="' + esc(st.suffix || '') + '" aria-hidden="true">0</span><span class="visually-hidden">' + fmt(st.value) + esc(st.suffix || '') + ' </span>'
          : '<span class="stat-num stat-pending" aria-hidden="true">?</span>') +
        '<span class="stat-label">' + esc(st.label) + '</span>' +
        (st.note ? '<span class="stat-note">' + esc(st.note) + '</span>' : '') +
        (known ? '' : '<span class="stat-badge">Đang cập nhật</span>') +
      '</li>';
    }).join('');
    var nums = Array.prototype.slice.call(grid.querySelectorAll('[data-count]'));
    function show(el, n){ el.textContent = fmt(n) + (el.getAttribute('data-suffix') || ''); }
    function finish(el){ show(el, +el.getAttribute('data-count')); }
    function run(el){
      var target = +el.getAttribute('data-count'), dur = target > 100 ? 2000 : 1400, start = null;
      function tick(t){
        if(start === null) start = t;
        var p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        show(el, Math.round(target * eased));
        if(p < 1) window.requestAnimationFrame(tick); else finish(el);
      }
      window.requestAnimationFrame(tick);
    }
    if(reduceMotion || !('IntersectionObserver' in window)){ nums.forEach(finish); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
    }, {threshold: .5});
    nums.forEach(function(n){ io.observe(n); });
  })();

  // ---------- home: faculty mosaic — portrait tiles spell "QT" ----------
  (function(){
    var el = document.getElementById('faculty-mosaic');
    if(!el) return;
    // 5x7 pixel letters with one blank column on each side and two between.
    var Q = ['.###.','#...#','#...#','#...#','#.#.#','#..#.','.##.#'];
    var T = ['#####','..#..','..#..','..#..','..#..','..#..','..#..'];
    var tones = ['#2D55A8','#169C83','#9B57A0','#E08A2E','#1C5E97','#0E9A9A'];
    var html = '', n = 0;
    for(var r = 0; r < 7; r++){
      var row = '.' + Q[r] + '..' + T[r] + '.';
      for(var c = 0; c < row.length; c++){
        if(row[c] === '#'){
          html += '<span class="fm-tile is-face" style="--tone:' + tones[(r * 3 + c) % tones.length] + ';--d:' + (n * 45) + 'ms"></span>';
          n++;
        } else {
          html += '<span class="fm-tile"></span>';
        }
      }
    }
    el.innerHTML = html;
    if(reduceMotion || !('IntersectionObserver' in window)){ el.classList.add('is-in'); return; }
    var io = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){ el.classList.add('is-in'); io.disconnect(); }
    }, {threshold: .3});
    io.observe(el);
  })();

  // ---------- /nghien-cuu: publications spotlight + quarterly chart + list, projects, conferences ----------
  (function(){
    var spot = document.getElementById('pub-spotlight');
    if(!spot) return;
    var pubs = published(window.ULAW_PUBLICATIONS).slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); });
    function quarter(d){ d = new Date(d); return d.getFullYear() + '-Q' + (Math.floor(d.getMonth() / 3) + 1); }

    // Spotlight: featured (or newest) publication with image
    var f = pubs.filter(function(p){ return p.featured; })[0] || pubs[0];
    spot.innerHTML = f
      ? '<article class="pub-spot"><div class="pub-spot-media">' + media(f.image || 'research_books__purple', 'Ảnh minh họa cho công bố ' + f.title, {w:800, h:500}) + '</div>' +
        '<div class="pub-spot-body"><span class="pub-badge">★ Công bố mới</span><span class="pub-type">' + esc(f.type || '') + '</span>' +
        '<h3>' + esc(f.title) + '</h3><p class="pub-meta">' + esc(f.authors || '') + (f.venue ? ' · <em>' + esc(f.venue) + '</em>' : '') + '</p>' +
        (f.url ? '<a class="link-arrow" href="' + esc(url(f.url)) + '"' + ext(f.url) + '>Xem công bố →</a>' : '') + '</div></article>'
      : '<article class="pub-spot is-empty"><div class="pub-spot-media">' + media('research_books__purple', 'Ảnh minh họa khu vực vinh danh công bố', {w:800, h:500}) + '</div>' +
        '<div class="pub-spot-body"><span class="pub-badge">★ Công bố mới</span><h3>Công bố nổi bật sẽ được vinh danh tại đây</h3>' +
        '<p>Tên công trình, tác giả, tạp chí/hội thảo và hình ảnh sẽ hiển thị khi Khoa cung cấp công bố đã xác thực.</p>' +
        '<span class="badge badge-pending">Đang cập nhật</span></div></article>';

    // Quarterly chart: last 8 quarters, single series → one hue, no legend; hover tooltip per bar.
    var chart = document.getElementById('pub-chart'), total = document.getElementById('pub-total');
    if(!pubs.length){
      total.textContent = '';
      chart.innerHTML = '<div class="pub-chart-empty"><div class="pub-chart-ghost" aria-hidden="true">' +
        [34,52,40,68,46,74,58,82].map(function(h){ return '<span style="height:' + h + '%"></span>'; }).join('') +
        '</div><p><strong>Chưa có dữ liệu công bố xác thực.</strong><br>Biểu đồ số công bố theo quý sẽ tự tạo từ danh sách công bố.</p></div>';
    } else {
      var now = new Date(), qs = [];
      for(var k = 7; k >= 0; k--){ var d = new Date(now.getFullYear(), now.getMonth() - k * 3, 1); var key = quarter(d); if(qs.indexOf(key) < 0) qs.push(key); }
      var counts = qs.map(function(q){ return pubs.filter(function(p){ return quarter(p.date) === q; }).length; });
      var max = Math.max.apply(null, counts.concat([1]));
      total.textContent = nOf('{n} công bố', pubs.length);
      chart.innerHTML = '<div class="pub-bars" role="img" aria-label="Số công bố theo quý: ' + qs.map(function(q, i){ return q.replace('-', ' ') + ' ' + counts[i]; }).join(', ') + '">' +
        qs.map(function(q, i){
          return '<div class="pub-bar-col" tabindex="0"><span class="pub-bar-tip">' + nOf('{n} công bố', counts[i]) + ' · ' + q.replace('-', ' ') + '</span>' +
            '<span class="pub-bar" style="height:' + (counts[i] / max * 100) + '%"></span><span class="pub-bar-label">' + q.split('-')[1] + '<small>' + q.slice(2, 4) + '</small></span></div>';
        }).join('') + '</div>';
    }

    // List
    var list = document.getElementById('pub-list');
    list.innerHTML = pubs.length
      ? '<ol class="pub-list">' + pubs.map(function(p){
          return '<li><span class="pub-q">' + quarter(p.date).replace('-', ' ') + '</span><div><strong>' + esc(p.title) + '</strong>' +
            '<span class="pub-meta">' + esc(p.authors || '') + (p.venue ? ' · ' + esc(p.venue) : '') + (p.type ? ' · ' + esc(p.type) : '') + '</span></div>' +
            (p.url ? '<a class="link-arrow" href="' + esc(url(p.url)) + '"' + ext(p.url) + '>Xem →</a>' : '') + '</li>';
        }).join('') + '</ol>'
      : '<div class="pub-list-empty"><span>Tên công trình</span><span>Tác giả</span><span>Tạp chí / Hội thảo</span><span>Quý</span>' +
        '<p>Danh sách công bố đang được cập nhật.</p></div>';

    // Projects: name + type
    var pl = document.getElementById('proj-list');
    var projs = published(window.ULAW_PROJECTS);
    pl.innerHTML = projs.length
      ? '<div class="proj-grid">' + projs.map(function(p){
          return '<article class="proj-card"><span class="proj-type">' + esc(p.type || 'Loại đề tài: đang cập nhật') + '</span><h3>' + esc(p.name) + '</h3>' +
            '<p class="pub-meta">' + [p.lead, p.period, p.state].filter(Boolean).map(esc).join(' · ') + '</p></article>';
        }).join('') + '</div>'
      : '<div class="proj-grid is-empty">' + ['Cấp Trường', 'Cấp Bộ', 'Hợp tác doanh nghiệp'].map(function(t){
          return '<article class="proj-card"><span class="proj-type">' + t + '</span><h3>Tên đề tài / project</h3><p class="pub-meta">Chủ nhiệm · Thời gian · Tình trạng</p><span class="badge badge-pending">Đang cập nhật</span></article>';
        }).join('') + '</div><p class="event-info" style="margin-top:12px">Khung trình bày mẫu — loại đề tài hiển thị ở nhãn trên cùng mỗi thẻ; danh sách thật sẽ thay thế khi có dữ liệu.</p>';

    // Conferences: info (past/undated) vs upcoming
    var confs = published(window.ULAW_CONFERENCES), nowT = Date.now();
    var up = confs.filter(function(c){ return c.startAt && new Date(c.endAt || c.startAt).getTime() >= nowT; })
                  .sort(function(a, b){ return new Date(a.startAt) - new Date(b.startAt); });
    var info = confs.filter(function(c){ return up.indexOf(c) < 0; });
    var infoEl = document.getElementById('conf-info'), upEl = document.getElementById('conf-upcoming');
    var tones = ['#2D55A8', '#9B57A0', '#169C83', '#E08A2E'];
    // Past conferences: newest first, listed as rows (date · title/place/summary · link)
    info.sort(function(a, b){ return new Date(b.startAt || 0) - new Date(a.startAt || 0); });
    infoEl.innerHTML = info.length
      ? '<ol class="cf2-past">' + info.map(function(c, i){
          var d = c.startAt ? new Date(c.startAt) : null;
          return '<li style="--tone:' + tones[i % tones.length] + '"><div class="cf2-past-date">' +
              (d ? '<b>' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '</b><span>' + d.getFullYear() + '</span>' : '<b>--</b><span>Chưa rõ</span>') + '</div>' +
            '<div class="cf2-past-body"><h4>' + esc(c.title) + '</h4>' + (c.place ? '<p class="pub-meta">' + esc(c.place) + '</p>' : '') + (c.summary ? '<p>' + esc(c.summary) + '</p>' : '') + '</div>' +
            (c.url ? '<a class="link-arrow" href="' + esc(url(c.url)) + '"' + ext(c.url) + '>Kỷ yếu &amp; chi tiết →</a>' : '<span></span>') + '</li>';
        }).join('') + '</ol>'
      : '<ol class="cf2-past is-empty" aria-hidden="true">' + tones.slice(0, 3).map(function(t){
          return '<li style="--tone:' + t + '"><div class="cf2-past-date"><b>--/--</b><span>Năm</span></div><div class="cf2-past-body"><h4>Tên hội thảo</h4><p class="pub-meta">Địa điểm · Chủ đề</p></div><span></span></li>';
        }).join('') + '</ol><p class="event-info">Danh sách các hội thảo đã diễn ra sẽ cập nhật khi có nguồn chính thức.</p>';

    // "Hội thảo tiếp theo" card with a live countdown
    var next = up[0];
    if(next){
      var d = new Date(next.startAt);
      upEl.innerHTML = '<article class="cf2-next"><span class="cf2-next-tag"><i></i>Hội thảo tiếp theo</span>' +
        '<div class="cf2-next-date"><b>' + pad(d.getDate()) + '</b><span>' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '</span></div>' +
        '<h3>' + esc(next.title) + '</h3><p class="pub-meta">' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' · ' + esc(next.place || next.mode || 'Địa điểm đang cập nhật') + '</p>' +
        '<div class="cf2-count" data-countdown="' + esc(next.startAt) + '"><div><b data-cd="d">--</b><span>ngày</span></div><div><b data-cd="h">--</b><span>giờ</span></div><div><b data-cd="m">--</b><span>phút</span></div></div>' +
        (next.registerUrl ? '<a class="btn btn-primary" href="' + esc(url(next.registerUrl)) + '"' + ext(next.registerUrl) + '>Đăng ký tham dự</a>' : '') +
        (up.length > 1 ? '<ul class="cf2-more">' + up.slice(1, 4).map(function(c){ var x = new Date(c.startAt); return '<li><b>' + pad(x.getDate()) + '/' + pad(x.getMonth() + 1) + '</b>' + esc(c.title) + '</li>'; }).join('') + '</ul>' : '') +
        '</article>';
      var cd = upEl.querySelector('[data-countdown]');
      var tickCd = function(){
        var ms = Math.max(0, new Date(cd.getAttribute('data-countdown')).getTime() - Date.now());
        cd.querySelector('[data-cd="d"]').textContent = Math.floor(ms / 864e5);
        cd.querySelector('[data-cd="h"]').textContent = pad(Math.floor(ms / 36e5) % 24);
        cd.querySelector('[data-cd="m"]').textContent = pad(Math.floor(ms / 6e4) % 60);
      };
      tickCd(); window.setInterval(tickCd, 30000);
    } else {
      upEl.innerHTML = '<article class="cf2-next is-empty"><span class="cf2-next-tag"><i></i>Hội thảo tiếp theo</span>' +
        '<div class="cf2-next-date"><b>--</b><span>Thời gian đang cập nhật</span></div>' +
        '<h3>Hội thảo sắp tới sẽ được công bố tại đây</h3><p class="pub-meta">Kèm đếm ngược, địa điểm và liên kết đăng ký tham dự.</p>' +
        '<div class="cf2-count"><div><b>--</b><span>ngày</span></div><div><b>--</b><span>giờ</span></div><div><b>--</b><span>phút</span></div></div>' +
        '<a class="link-arrow" href="' + esc(url('tin-tuc/index.html#su-kien')) + '">Xem lịch sự kiện →</a></article>';
    }
  })();

  // ---------- /nghien-cuu: Case Studies as case folders ----------
  (function(){
    var grid = document.getElementById('cases-grid');
    if(!grid) return;
    var LENS = {business:['Business','#5B8DEF'], law:['Law','#C58BE0'], tech:['Technology','#3FC2A8']};
    var cases = published(window.ULAW_CASES), sample = !cases.length;
    if(sample) cases = [
      {lens:'business', title:'Tình huống quản trị', question:'Doanh nghiệp nên mở rộng thị trường hay tái cấu trúc vận hành?', tags:['Chiến lược','Vận hành']},
      {lens:'law', title:'Tình huống pháp lý kinh doanh', question:'Điều khoản hợp đồng nào bảo vệ doanh nghiệp khi đối tác vi phạm?', tags:['Hợp đồng','Tuân thủ']},
      {lens:'tech', title:'Tình huống chuyển đổi số', question:'Triển khai nền tảng số thế nào khi phải bảo vệ dữ liệu khách hàng?', tags:['Dữ liệu','Nền tảng số']}
    ];
    grid.innerHTML = cases.map(function(c, i){
      var L = LENS[c.lens] || LENS.business;
      var tags = (c.tags || []).map(function(t){ return '<span>' + esc(t) + '</span>'; }).join('');
      var inner = '<span class="case-tab">' + esc(L[0]) + '</span>' +
        '<div class="case-paper"><div class="case-top"><span class="case-no">CASE ' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          (sample ? '<span class="case-stamp">Mẫu trình bày</span>' : '') + '</div>' +
          '<h3>' + esc(c.title) + '</h3>' +
          (c.org ? '<p class="case-org">' + esc(c.org) + '</p>' : '') +
          '<p class="case-q"><span aria-hidden="true">?</span>' + esc(c.question || '') + '</p>' +
          (tags ? '<div class="case-tags">' + tags + '</div>' : '') +
          (sample ? '<span class="case-more">Case study đang được xây dựng</span>' : '<span class="case-more">Đọc case →</span>') +
        '</div>';
      return c.url
        ? '<a class="case-card" style="--lens:' + L[1] + '" href="' + esc(url(c.url)) + '"' + ext(c.url) + '>' + inner + '</a>'
        : '<article class="case-card' + (sample ? ' is-sample' : '') + '" style="--lens:' + L[1] + '">' + inner + '</article>';
    }).join('');
  })();

  // ---------- /doi-ngu: Ban Chủ nhiệm — photo · info · intro ----------
  (function(){
    var grid = document.getElementById('leader-grid');
    if(!grid) return;
    var tones = ['#2D55A8', '#9B57A0', '#169C83'];
    var P = '<span class="pending">Đang cập nhật</span>';
    grid.innerHTML = (window.ULAW_LEADERSHIP || []).map(function(m, i){
      var photo = m.photo
        ? '<img src="' + esc(url(m.photo)) + '" alt="Chân dung ' + esc(m.name || m.role) + '" width="600" height="750" loading="lazy">'
        : '<div class="leader-ph" aria-hidden="true"><svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/></svg><small>Ảnh chân dung</small></div>';
      function row(k, v){ return '<div><dt>' + k + '</dt><dd>' + (v ? esc(v) : P) + '</dd></div>'; }
      return '<article class="leader-card' + (i === 0 ? ' is-head' : '') + '" style="--tone:' + tones[i % tones.length] + '">' +
        '<div class="leader-photo">' + photo + '<span class="leader-role">' + esc(m.role) + '</span></div>' +
        '<div class="leader-info"><h3>' + (m.name ? esc(m.name) : 'Họ và tên') + '</h3>' +
          '<dl>' + row('Học hàm, học vị', m.degree) + row('Lĩnh vực', m.field) + row('Email', m.email) + '</dl></div>' +
        '<div class="leader-intro"><span class="leader-q" aria-hidden="true">“</span>' +
          (m.intro ? '<p>' + esc(m.intro) + '</p>' : '<p class="is-pending">Đoạn giới thiệu ngắn về quá trình công tác, hướng nghiên cứu và vai trò trong Khoa sẽ được cập nhật.</p>') + '</div>' +
      '</article>';
    }).join('');
  })();

  // ---------- /doi-ngu/bo-mon.html?id=… : department head + lecturer list ----------
  (function(){
    var titleEl = document.getElementById('dept-title');
    if(!titleEl || !document.getElementById('dept-lecturers')) return;
    var depts = window.ULAW_DEPARTMENTS || [];
    var id = new URLSearchParams(window.location.search).get('id');
    var d = depts.filter(function(x){ return x.id === id; })[0] || depts[0];
    if(!d) return;
    document.title = d.name + ' — Khoa Quản trị ULAW';  // EN suffix: see the title pass in the VI/EN block
    titleEl.textContent = d.name;
    document.getElementById('dept-crumb').textContent = d.name;
    document.getElementById('dept-hero').style.setProperty('--tone', d.tone);
    document.getElementById('dept-intro').textContent = d.intro || 'Giới thiệu bộ môn, lĩnh vực giảng dạy và nghiên cứu sẽ được cập nhật theo thông tin chính thức của Khoa.';
    document.getElementById('dept-switch').innerHTML = depts.map(function(x){
      return '<a href="bo-mon.html?id=' + esc(x.id) + '" style="--tone:' + esc(x.tone) + '"' + (x === d ? ' aria-current="page"' : '') + '>' + esc(x.short || x.name) + '</a>';
    }).join('');

    var P = '<span class="pending">Đang cập nhật</span>';
    function avatar(m, big){
      return m.photo
        ? '<img src="' + esc(url(m.photo)) + '" alt="Chân dung ' + esc(m.name || 'giảng viên') + '" width="' + (big ? 480 : 320) + '" height="' + (big ? 600 : 400) + '" loading="lazy">'
        : '<div class="lec-ph" aria-hidden="true"><svg viewBox="0 0 24 24" width="' + (big ? 64 : 44) + '" height="' + (big ? 64 : 44) + '" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/></svg></div>';
    }
    function cvLink(m){
      return m.cv ? '<a class="btn btn-secondary lec-cv" href="' + esc(url(m.cv)) + '"' + ext(m.cv) + '>Xem CV →</a>' : '<span class="lec-cv is-pending">CV đang cập nhật</span>';
    }
    var h = d.head || {};
    document.getElementById('dept-head').innerHTML =
      '<article class="dept-head-card" style="--tone:' + esc(d.tone) + '"><div class="dept-head-photo">' + avatar(h, true) + '</div>' +
      '<div class="dept-head-info"><span class="dept-head-role">Trưởng bộ môn</span><h3>' + (h.name ? esc(h.name) : 'Họ và tên') + '</h3>' +
        '<dl><div><dt>Học hàm, học vị</dt><dd>' + (h.degree ? esc(h.degree) : P) + '</dd></div><div><dt>Email</dt><dd>' + (h.email ? esc(h.email) : P) + '</dd></div></dl>' +
        cvLink(h) + '</div></article>';

    var lecs = d.lecturers || [];
    document.getElementById('dept-count').textContent = lecs.length ? nOf('{n} giảng viên', lecs.length) : '';
    document.getElementById('dept-lecturers').innerHTML = lecs.length
      ? '<ul class="lec-grid">' + lecs.map(function(m){
          return '<li class="lec-card" style="--tone:' + esc(d.tone) + '"><div class="lec-photo">' + avatar(m) + '</div><div class="lec-body"><h3>' + esc(m.name) + '</h3>' +
            (m.degree ? '<p>' + esc(m.degree) + '</p>' : '') + cvLink(m) + '</div></li>';
        }).join('') + '</ul>'
      : '<ul class="lec-grid is-empty" aria-hidden="true">' + [1,2,3,4].map(function(){
          return '<li class="lec-card" style="--tone:' + esc(d.tone) + '"><div class="lec-photo">' + avatar({}) + '</div><div class="lec-body"><h3>Họ và tên giảng viên</h3><p>Học hàm, học vị</p><span class="lec-cv is-pending">CV đang cập nhật</span></div></li>';
        }).join('') + '</ul><p class="event-info">Danh sách giảng viên bộ môn sẽ hiển thị khi có hồ sơ xác thực và sự đồng ý công bố.</p>';
  })();

  // ---------- /doi-ngu: lecturer leisure-moments gallery (template frames) ----------
  (function(){
    var el = document.getElementById('faculty-moments');
    if(!el) return;
    var I = {
      sport:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
      trip:'<path d="M3 20l6-11 4 6 3-4 5 9z"/><circle cx="17" cy="6" r="2"/>',
      music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
      team:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c.6-3.5 3-5 6-5s5.4 1.5 6 5M10 20c.6-3.5 3-5 6-5s5.4 1.5 6 5"/>',
      coffee:'<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3"/>',
      trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>'
    };
    var slots = [
      {cls:'m-a', icon:'sport',  tone:'#2D55A8', label:'Giải thể thao giảng viên'},
      {cls:'m-b', icon:'trip',   tone:'#169C83', label:'Dã ngoại cuối năm'},
      {cls:'m-c', icon:'music',  tone:'#9B57A0', label:'Văn nghệ chào tân sinh viên'},
      {cls:'m-d', icon:'team',   tone:'#E08A2E', label:'Team building'},
      {cls:'m-e', icon:'coffee', tone:'#1C5E97', label:'Cà phê chia sẻ'},
      {cls:'m-f', icon:'trophy', tone:'#0E9A9A', label:'Hội thao Khoa'}
    ];
    var photos = window.ULAW_FACULTY_MOMENTS || [];
    el.innerHTML = slots.map(function(sl, i){
      var ph = photos[i];
      var cap = ph && ph.caption ? ph.caption : sl.label;
      return '<figure class="moment ' + sl.cls + (ph ? '' : ' is-template') + '" style="--tone:' + sl.tone + '">' +
        (ph ? '<img src="' + esc(url(ph.image)) + '" alt="' + esc(cap) + '" width="800" height="600" loading="lazy">'
            : '<div class="moment-ph" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + I[sl.icon] + '</svg><small>Ảnh sẽ cập nhật</small></div>') +
        '<figcaption>' + esc(cap) + '</figcaption></figure>';
    }).join('');
  })();

  // ---------- /doi-ngu: guest experts — static grid of cards (photo + info) ----------
  (function(){
    var box = document.getElementById('experts-marquee');
    if(!box) return;
    var list = window.ULAW_GUEST_EXPERTS || [], sample = !list.length;
    if(sample) list = [1,2,3,4].map(function(){ return {}; });
    var tones = ['#2D55A8', '#9B57A0', '#E08A2E', '#169C83', '#1C5E97', '#0E9A9A'];
    function card(m, i){
      var photo = m.photo
        ? '<img src="' + esc(url(m.photo)) + '" alt="Chân dung ' + esc(m.name || 'chuyên gia') + '" width="160" height="160" loading="lazy">'
        : '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/></svg>';
      return '<li class="ex-card" style="--tone:' + tones[i % tones.length] + '"><div class="ex-photo">' + photo + '</div><div class="ex-info">' +
        '<span class="ex-title">' + (m.title ? esc(m.title) : 'Học hàm · học vị') + '</span>' +
        '<strong class="ex-name">' + (m.name ? esc(m.name) : 'Họ và tên') + '</strong>' +
        '<span class="ex-pos">' + (m.position ? esc(m.position) : 'Chức vụ') + '</span>' +
        '<span class="ex-org">' + (m.org ? esc(m.org) : 'Đơn vị công tác') + '</span></div></li>';
    }
    var items = list.map(card).join('');
    box.innerHTML = '<ul class="ex-track ex-grid' + (sample ? ' is-sample' : '') + '">' + items + '</ul>';
    var note = document.getElementById('experts-note');
    if(note) note.textContent = sample ? 'Khung mẫu — danh sách chuyên gia, giảng viên thỉnh giảng sẽ hiển thị khi có hồ sơ xác thực và sự đồng ý công bố.' : nOf('{n} chuyên gia & giảng viên thỉnh giảng', list.length);
  })();

  // ---------- Thạc sĩ QTKD class photos ([data-ths-photos], optional data-limit) ----------
  document.querySelectorAll('[data-ths-photos]').forEach(function(el){
    var limit = +el.getAttribute('data-limit') || 6;
    var photos = (window.ULAW_THS_PHOTOS || []).slice(0, limit);
    var n = Math.max(photos.length, limit), html = '';
    for(var i = 0; i < n; i++){
      var ph = photos[i];
      html += ph
        ? '<figure class="ths-photo"><img src="' + esc(url(ph.image)) + '" alt="' + esc(ph.caption || 'Lớp học thạc sĩ') + '" width="600" height="450" loading="lazy">' +
            (ph.caption ? '<figcaption>' + esc(ph.caption) + '</figcaption>' : '') + '</figure>'
        : '<figure class="ths-photo is-template" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg><small>Ảnh lớp học</small></figure>';
    }
    el.innerHTML = html;
  });

  // ---------- ThS QTKD page: notice board + news/events posts ----------
  (function(){
    var board = document.getElementById('ths-notices');
    if(board){
      var ns = published(window.ULAW_THS_NOTICES).slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); });
      var fresh = Date.now() - 14 * 864e5;
      board.innerHTML = ns.length
        ? '<ol class="notice-list">' + ns.slice(0, 6).map(function(n){
            var d = new Date(n.date), isNew = d.getTime() >= fresh;
            var inner = '<span class="notice-date"><b>' + pad(d.getDate()) + '</b>' + MONTHS[d.getMonth()] + '</span>' +
              '<span class="notice-txt">' + (n.tag ? '<small>' + esc(n.tag) + '</small>' : '') + '<strong>' + esc(n.title) + '</strong></span>' +
              (isNew ? '<span class="notice-new">Mới</span>' : '') + (n.url ? '<span class="notice-arrow" aria-hidden="true">→</span>' : '');
            return '<li>' + (n.url ? '<a href="' + esc(url(n.url)) + '"' + ext(n.url) + '>' + inner + '</a>' : '<div>' + inner + '</div>') + '</li>';
          }).join('') + '</ol>'
        : '<ol class="notice-list is-empty" aria-hidden="true">' + ['Tuyển sinh','Học vụ','Lịch thi'].map(function(t){
            return '<li><div><span class="notice-date"><b>--</b>Th--</span><span class="notice-txt"><small>' + t + '</small><strong>Tiêu đề thông báo</strong></span></div></li>';
          }).join('') + '</ol><p class="notice-empty">Chưa có thông báo đăng tại đây — xem thông báo mới nhất trên website Phòng Đào tạo Sau đại học.</p>';
    }
    var grid = document.getElementById('ths-posts');
    if(!grid) return;
    var posts = published(window.ULAW_THS_POSTS).slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); });
    function render(kind){
      var list = posts.filter(function(p){ return kind === 'all' || p.type === kind; });
      grid.innerHTML = list.length
        ? list.map(function(p, i){
            var d = p.date ? new Date(p.date) : null;
            var img = p.image ? media(p.image, p.title, {w:800, h:533, noLabel:!/__|^hero-/.test(p.image)}) : media('study_group__navy', 'Ảnh minh họa', {w:800, h:533});
            var body = '<div class="post-media">' + img + '<span class="post-type is-' + esc(p.type || 'news') + '">' + (p.type === 'event' ? 'Sự kiện' : 'Tin tức') + '</span></div>' +
              '<div class="post-body">' + (d ? '<span class="post-date">' + fmtDate(d) + '</span>' : '') +
              '<h3>' + esc(p.title) + '</h3>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') + (p.url ? '<span class="link-arrow">Đọc tiếp →</span>' : '') + '</div>';
            return p.url ? '<a class="post-card' + (i === 0 && kind === 'all' ? ' is-feature' : '') + '" href="' + esc(url(p.url)) + '"' + ext(p.url) + '>' + body + '</a>'
                         : '<article class="post-card' + (i === 0 && kind === 'all' ? ' is-feature' : '') + '">' + body + '</article>';
          }).join('')
        : [1,2,3].map(function(i){
            return '<article class="post-card is-template' + (i === 1 ? ' is-feature' : '') + '" aria-hidden="true"><div class="post-media"><span class="post-ph"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>Ảnh bài viết</span>' +
              '<span class="post-type is-' + (i === 2 ? 'event' : 'news') + '">' + (i === 2 ? 'Sự kiện' : 'Tin tức') + '</span></div><div class="post-body"><span class="post-date">Ngày đăng</span><h3>Tiêu đề bài viết</h3><p>Tóm tắt ngắn về hoạt động của chương trình thạc sĩ.</p></div></article>';
          }).join('') + '<p class="event-info ths-posts-note">Chưa có bài viết — tin, ảnh và sự kiện của chương trình sẽ hiển thị tại đây khi được đăng.</p>';
    }
    bindChips(Array.prototype.slice.call(document.querySelectorAll('[data-ths-filter]')), 'data-ths-filter', render);
    render('all');
  })();

  // ---------- rotating keyword in the home search heading (plain swap, no fade, with reduced motion) ----------
  document.querySelectorAll('[data-rotator]').forEach(function(el){
    var words = el.getAttribute('data-rotator').split('|'), i = 0;
    var word = el.querySelector('.sh-word');
    if(words.length < 2 || !word) return;
    window.setInterval(function(){
      if(document.hidden) return;
      if(reduceMotion){ i = (i + 1) % words.length; word.textContent = words[i]; return; }
      word.classList.add('is-out');
      window.setTimeout(function(){
        i = (i + 1) % words.length;
        word.textContent = words[i];
        word.classList.remove('is-out');
      }, 320);
    }, 2600);
  });

  // ---------- home long search bar: live suggestions, Enter goes to /search ----------
  (function(){
    var form = document.querySelector('[data-home-search]');
    if(!form) return;
    var input = form.querySelector('input[type=search]');
    var box = form.querySelector('.home-search-suggest');
    function close(){ box.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    input.addEventListener('input', function(){
      var q = input.value.trim();
      if(q.length < 2){ close(); return; }
      var items = searchIndex(q, 'all').slice(0, 6);
      box.innerHTML = (items.length ? items.map(function(item){
          return '<a href="' + esc(url(item.url)) + '"' + ext(item.url) + '><span class="kind">' + esc(item.kindLabel) + '</span>' + esc(item.title) + '</a>';
        }).join('') : '<p class="search-empty" style="padding:12px;margin:0">' + 'Không có gợi ý phù hợp — nhấn Enter để tìm đầy đủ.' + '</p>') +
        '<a class="all" href="' + esc(url('search/index.html?q=' + encodeURIComponent(q))) + '">' + 'Xem tất cả kết quả cho “' + esc(q) + '” →</a>';
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown' && !box.hidden){ var f = box.querySelector('a'); if(f){ e.preventDefault(); f.focus(); } }
      if(e.key === 'Escape'){ close(); }
    });
    form.addEventListener('focusout', function(e){ if(e.relatedTarget && !form.contains(e.relatedTarget)) close(); });
    document.addEventListener('click', function(e){ if(!form.contains(e.target)) close(); });
  })();

  // ---------- illustrative forms: validate, never send ----------
  document.querySelectorAll('[data-demo-form]').forEach(function(form){
    form.setAttribute('novalidate', '');
    var success = form.querySelector('.form-success');
    function errorEl(field){
      var id = field.id + '-error';
      var el = document.getElementById(id);
      if(!el){
        el = document.createElement('span');
        el.id = id;
        el.className = 'field-error';
        var host = field.closest('fieldset') || field.closest('.field') || field.parentNode;
        host.appendChild(el);
        var described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        described.push(id);
        field.setAttribute('aria-describedby', described.join(' '));
      }
      return el;
    }
    function validate(field){
      var msg = '';
      var label = (form.querySelector('label[for="' + field.id + '"]') || {}).textContent || 'trường này';
      label = label.replace('*', '').trim();
      if(field.type === 'radio'){
        var group = form.querySelectorAll('input[type=radio][name="' + field.name + '"]');
        var legend = field.closest('fieldset') && field.closest('fieldset').querySelector('legend');
        if(field.required && !Array.prototype.some.call(group, function(r){ return r.checked; })){
          msg = field.getAttribute('data-msg') ||
            ('Vui lòng chọn ' + (legend ? legend.textContent.replace('*', '').trim().toLowerCase() : 'một mục') + '.');
        }
      } else if(field.type === 'checkbox'){
        if(field.required && !field.checked) msg = field.getAttribute('data-msg') || 'Vui lòng xác nhận để tiếp tục.';
      } else if(field.required && !field.value.trim()){
        msg = 'Vui lòng nhập ' + label.toLowerCase() + '.';
        if(field.tagName === 'SELECT') msg = 'Vui lòng chọn ' + label.toLowerCase() + '.';
      } else if(field.value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)){
        msg = 'Email chưa đúng định dạng (ví dụ: ten@email.com).';
      } else if(field.value && field.type === 'tel' && !/^[0-9+\s.-]{8,15}$/.test(field.value)){
        msg = 'Số điện thoại chưa đúng định dạng (8–15 chữ số).';
      }
      var el = errorEl(field);
      el.textContent = msg;
      if(msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
      return !msg;
    }
    // Optional progress bar ([data-form-progress]): share of required fields that are valid-looking.
    var bar = form.querySelector('[data-form-progress]');
    function progress(){
      if(!bar) return;
      var req = [], seen = {};
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function(f){
        if(f.type === 'radio'){ if(seen[f.name]) return; seen[f.name] = 1; }
        req.push(f);
      });
      var done = req.filter(function(f){
        if(f.type === 'radio') return !!form.querySelector('input[name="' + f.name + '"]:checked');
        if(f.type === 'checkbox') return f.checked;
        if(f.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
        return !!f.value.trim();
      }).length;
      var pct = req.length ? Math.round(done / req.length * 100) : 0;
      bar.style.setProperty('--p', pct + '%');
      var out = bar.querySelector('[data-form-progress-label]');
      if(out) out.textContent = fill('{done}/{total} mục bắt buộc', {done: done, total: req.length});
    }
    form.addEventListener('input', progress);
    form.addEventListener('change', progress);
    progress();
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[id], select[id], textarea[id]'))
      .filter(function(f, i, all){
        if(f.type === 'radio') return f.required && all.filter(function(o){ return o.name === f.name; })[0] === f;
        return f.required || f.type === 'email' || f.type === 'tel';
      });
    fields.forEach(function(f){
      if(f.type === 'radio'){
        form.querySelectorAll('input[name="' + f.name + '"]').forEach(function(r){ r.addEventListener('change', function(){ validate(f); }); });
        return;
      }
      f.addEventListener('blur', function(){ if(f.value || f.getAttribute('aria-invalid')) validate(f); });
      f.addEventListener('change', function(){ if(f.getAttribute('aria-invalid')) validate(f); });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function(f){ if(!validate(f) && !firstBad) firstBad = f; });
      if(firstBad){ if(success) success.hidden = true; firstBad.focus(); return; }
      if(success){
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
  });

  // ---------- program filter (dao-tao index) ----------
  (function(){
    var btns = Array.prototype.slice.call(document.querySelectorAll('[data-prog-filter]'));
    if(!btns.length) return;
    btns.forEach(function(b){ b.setAttribute('aria-pressed', b.classList.contains('is-active') ? 'true' : 'false'); });
    bindChips(btns, 'data-prog-filter', function(val){
      document.querySelectorAll('[data-prog-group]').forEach(function(card){
        var wrap = card.closest('[data-prog-wrap]') || card;
        wrap.hidden = !(val === 'all' || card.getAttribute('data-prog-group') === val);
      });
    });
  })();

  // ---------- research filters ----------
  (function(){
    var selects = document.querySelectorAll('[data-research-filter]');
    var items = document.querySelectorAll('[data-research-item]');
    var empty = document.querySelector('[data-research-empty]');
    var count = document.querySelector('[data-research-count]');
    if(!selects.length) return;
    function apply(){
      var active = {};
      selects.forEach(function(sel){ active[sel.getAttribute('data-research-filter')] = sel.value; });
      var visible = 0;
      items.forEach(function(item){
        var ok = Object.keys(active).every(function(key){
          return !active[key] || active[key] === 'all' || item.getAttribute('data-' + key) === active[key];
        });
        item.hidden = !ok;
        if(ok) visible++;
      });
      if(empty) empty.hidden = visible !== 0;
      if(count) count.textContent = nOf('{n} mục phù hợp', visible);
    }
    selects.forEach(function(sel){ sel.addEventListener('change', apply); });
    apply();
  })();

  // ---------- anchor sub-nav active state (program pages) ----------
  (function(){
    var links = Array.prototype.slice.call(document.querySelectorAll('.subnav a'));
    if(!links.length) return;
    var sections = links.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); });
    function update(){
      var pos = window.scrollY + 160, idx = 0;
      sections.forEach(function(sec, i){ if(sec && sec.offsetTop <= pos) idx = i; });
      links.forEach(function(a, i){
        a.classList.toggle('is-active', i === idx);
        if(i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', update, {passive:true});
    update();
  })();

  // ---------- home: "Cập nhật mới" ticker ([data-ticker]) ----------
  // Items from ULAW_TICKER; if empty, the newest notices, news, jobs and internships. Hidden when nothing to show.
  (function(){
    var box = document.querySelector('[data-ticker]');
    if(!box) return;
    var items = published(window.ULAW_TICKER).map(function(t){ return {tag:t.tag || 'Thông báo', text:t.text, href:t.href, date:t.date}; });
    if(!items.length){
      var pool = [];
      published(window.ULAW_STUDENT_POSTS).forEach(function(p){ pool.push({tag:p.type || 'Sinh viên', text:p.title, href:p.href || 'sinh-vien/hoc-tap.html#thong-bao', date:p.date}); });
      published(window.ULAW_NEWS).forEach(function(n){ pool.push({tag:'Tin tức', text:n.title, href:n.url, date:n.date}); });
      published(window.ULAW_JOBS).forEach(function(j){ pool.push({tag:'Tuyển dụng', text:j.title + (j.company ? ' — ' + j.company : ''), href:j.href || 'doanh-nghiep/index.html#tuyen-dung', date:j.date}); });
      published(window.ULAW_INTERNSHIPS).forEach(function(j){ pool.push({tag:'Thực tập', text:j.title + (j.company ? ' — ' + j.company : ''), href:j.href || 'doanh-nghiep/index.html#thuc-tap', date:j.date}); });
      items = pool.sort(function(a, b){ return String(b.date || '').localeCompare(String(a.date || '')); }).slice(0, 8);
    }
    if(!items.length) return;
    var html = items.map(function(t){
      var inner = '<span class="nt-tag">' + esc(t.tag) + '</span><span class="nt-text">' + esc(t.text) + '</span>';
      return '<li>' + (t.href ? '<a href="' + esc(url(t.href)) + '"' + ext(t.href) + '>' + inner + '</a>' : '<span>' + inner + '</span>') + '</li>';
    }).join('');
    var track = box.querySelector('.nt-track');
    track.innerHTML = html + html.replace(/<li>/g, '<li aria-hidden="true">').replace(/<a /g, '<a tabindex="-1" ');
    track.style.setProperty('--nt-dur', Math.max(24, items.length * 7) + 's');
    box.hidden = false;
    var btn = box.querySelector('.nt-pause');
    btn.addEventListener('click', function(){
      var p = box.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', p ? 'true' : 'false');
      btn.setAttribute('aria-label', p ? 'Tiếp tục dải tin' : 'Tạm dừng dải tin');
      btn.firstElementChild.textContent = p ? '▶' : '❚❚';
    });
  })();

  // ---------- home: Thông tin nổi bật slider (max 5, above the hero banner) ----------
  (function(){
    var box = document.querySelector('[data-highlights]');
    if(!box) return;
    var now = Date.now();
    var items = published(window.ULAW_HIGHLIGHTS)
      .filter(function(s){ return s.title && (/\.(jpe?g|png|webp|avif)$/i.test(s.image || '') || (s.status === 'illustrative' && window.ULAW_HL_SCENES && window.ULAW_HL_SCENES[s.image])) && (!s.startAt || new Date(s.startAt).getTime() <= now) && (!s.endAt || new Date(s.endAt).getTime() >= now); })
      .sort(function(a, b){ return (a.order || 0) - (b.order || 0); })
      .slice(0, 5);
    if(!items.length) return;
    document.getElementById('highlights').hidden = false;
    // Autoplay always starts (the full-screen slider sits under the cursor, so no hover-pause);
    // it stops only via the pause button, keyboard focus inside it, or a hidden tab.
    var n = items.length, cur = 0, timer = null, INTERVAL = 5500;
    var st = {user: false, focus: false, hidden: document.hidden};
    box.innerHTML = '<div class="hl-track">' + items.map(function(s, i){
        return '<article class="hl-slide' + (i ? '' : ' is-active') + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + n + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
          '<div class="hl-media">' + (window.ULAW_HL_SCENES && window.ULAW_HL_SCENES[s.image] ? '<span role="img" aria-label="' + esc(s.alt || s.title) + '">' + window.ULAW_HL_SCENES[s.image] + '</span>' : media(s.image, s.alt || s.title, {eager: !i, w:1920, h:1080, noLabel:true})) + '</div>' +
          '<div class="hl-cap"><p class="hl-meta"><span class="hl-cat">' + esc(s.category || 'Nổi bật') + '</span>' + (s.date ? '<span>' + esc(fmtDate(s.date)) + '</span>' : '') + statusBadge(s.status) + '</p>' +
          '<p class="hl-title">' + (s.url ? '<a href="' + esc(url(s.url)) + '"' + ext(s.url) + (i ? ' tabindex="-1"' : '') + '>' + esc(s.title) + '</a>' : esc(s.title)) + '</p>' +
          (s.url ? '<span class="hl-more" aria-hidden="true">' + esc(s.ctaLabel || 'Xem chi tiết') + ' →</span>' : '') + '</div></article>';
      }).join('') + '</div>' +
      (n > 1 ? '<button type="button" class="hl-arrow hl-prev" aria-label="Ảnh trước">‹</button><button type="button" class="hl-arrow hl-next" aria-label="Ảnh sau">›</button>' +
        '<div class="hl-bar"><div class="hl-dots">' + items.map(function(s, i){ return '<button type="button" aria-label="Ảnh ' + (i + 1) + ': ' + esc(s.title) + '"' + (i ? '' : ' aria-current="true"') + '><i></i></button>'; }).join('') + '</div>' +
        '<button type="button" class="hl-pause"></button><span class="hl-count" aria-live="polite"></span></div>' : '');
    if(n < 2) return;
    var slides = box.querySelectorAll('.hl-slide'), dots = box.querySelectorAll('.hl-dots button'), pause = box.querySelector('.hl-pause'), count = box.querySelector('.hl-count');
    function show(i){
      cur = (i + n) % n;
      for(var k = 0; k < n; k++){
        var on = k === cur, a = slides[k].querySelector('a');
        slides[k].classList.toggle('is-active', on);
        if(on) slides[k].removeAttribute('aria-hidden'); else slides[k].setAttribute('aria-hidden', 'true');
        if(a){ if(on) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); }
        if(on) dots[k].setAttribute('aria-current', 'true'); else dots[k].removeAttribute('aria-current');
      }
      count.textContent = (cur + 1) + ' / ' + n;
      box.classList.remove('is-timing'); void box.offsetWidth; if(running()) box.classList.add('is-timing');
    }
    function running(){ return !st.user && !st.focus && !st.hidden; }
    function schedule(){
      window.clearTimeout(timer); timer = null;
      box.classList.toggle('is-timing', running());
      if(running()) timer = window.setTimeout(function(){ show(cur + 1); schedule(); }, INTERVAL);
      count.setAttribute('aria-live', st.user ? 'polite' : 'off');
    }
    function renderPause(){
      pause.setAttribute('aria-pressed', st.user ? 'true' : 'false');
      pause.setAttribute('aria-label', st.user ? 'Tiếp tục tự động chuyển ảnh' : 'Tạm dừng tự động chuyển ảnh');
      pause.innerHTML = '<span aria-hidden="true">' + (st.user ? '▶' : '❚❚') + '</span>';
    }
    function go(i){ show(i); schedule(); }
    box.querySelector('.hl-prev').addEventListener('click', function(){ go(cur - 1); });
    box.querySelector('.hl-next').addEventListener('click', function(){ go(cur + 1); });
    Array.prototype.forEach.call(dots, function(d, i){ d.addEventListener('click', function(){ go(i); }); });
    pause.addEventListener('click', function(){ st.user = !st.user; renderPause(); schedule(); });
    box.addEventListener('focusin', function(e){ var t = e.target; st.focus = !!(t.matches && t.matches(':focus-visible')); schedule(); });
    box.addEventListener('focusout', function(e){ if(!box.contains(e.relatedTarget)){ st.focus = false; schedule(); } });
    box.addEventListener('keydown', function(e){ if(e.key === 'ArrowLeft') go(cur - 1); else if(e.key === 'ArrowRight') go(cur + 1); });
    document.addEventListener('visibilitychange', function(){ st.hidden = document.hidden; schedule(); });
    var x0 = null;  // swipe on touch screens
    box.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive:true});
    box.addEventListener('touchend', function(e){ if(x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if(Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
    renderPause(); show(0); schedule();
  })();
  // Phones: size the highlights slider so slider + hero banner fill exactly the first screen (no blank strip).
  (function(){
    var sec = document.getElementById('highlights'), track = sec && sec.querySelector('.hl-track'), hero = document.querySelector('.home-hero');
    if(!track || !hero || sec.hidden) return;
    function fit(){
      if(window.innerWidth >= 600){ track.style.height = ''; return; }
      track.style.height = '';
      var w = track.offsetWidth, top = sec.getBoundingClientRect().top + window.scrollY;
      // Use the tallest reported viewport (in-app browsers / Safari can report a short one) and go ~20px
      // deeper so the banner's bottom edge always sits at or just below the screen edge (user request).
      var vh = Math.max(window.innerHeight, window.visualViewport ? window.visualViewport.height : 0, document.documentElement.clientHeight);
      var h = vh - top - hero.offsetHeight + 20;
      track.style.height = Math.round(Math.max(w * 0.75, Math.min(w * 1.4, h))) + 'px';
    }
    var lastW = window.innerWidth;
    // Measure after the rest of site.js has run (the admissions CTA is upgraded to a dropdown later,
    // which changes the hero height), and again once web fonts and images have loaded.
    window.setTimeout(fit, 0);
    window.addEventListener('load', fit);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    // iOS fires resize when its toolbars collapse on scroll: refit only when the width changes.
    window.addEventListener('resize', function(){ if(window.innerWidth !== lastW){ lastW = window.innerWidth; fit(); } });
    window.addEventListener('orientationchange', fit);
  })();

  // ---------- home hero carousel ----------
  (function(){
    var banner = document.getElementById('hero-banner');
    if(!banner) return;
    var track = document.getElementById('hb-track');
    var captions = document.getElementById('hb-captions');
    var dotsWrap = document.getElementById('hb-dots');
    var prevBtn = banner.querySelector('.hb-prev');
    var nextBtn = banner.querySelector('.hb-next');
    var pauseBtn = document.getElementById('hb-pause');
    var controls = banner.querySelector('.hb-controls');
    var now = Date.now();
    var slides = published(window.ULAW_HERO_SLIDES)
      .filter(function(s){
        return (!s.startAt || new Date(s.startAt).getTime() <= now) && (!s.endAt || new Date(s.endAt).getTime() >= now);
      })
      .sort(function(a, b){ return (a.order || 0) - (b.order || 0); })
      .slice(0, 3);
    if(!slides.length){ banner.classList.add('no-slides'); if(controls) controls.hidden = true; return; }
    if(!captions){  // static hero (no slide panel): show the first slide image only
      track.innerHTML = '<div class="hb-slide is-active"><div class="hb-media">' + media(slides[0].image, slides[0].alt, {eager:true, w:1600, h:900}) + '</div></div>';
      return;
    }

    track.innerHTML = slides.map(function(s, i){
      return '<div class="hb-slide' + (i === 0 ? ' is-active' : '') + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
        '<div class="hb-media">' + media(s.image, s.alt, {eager: i === 0, w:1600, h:900}) + '</div></div>';
    }).join('');
    captions.innerHTML = slides.map(function(s, i){
      return '<div class="hb-caption' + (i === 0 ? ' is-active' : '') + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + slides.length + '"' + (i ? ' hidden' : '') + '>' +
        '<span class="hb-eyebrow">' + esc(s.eyebrow) + '</span>' +
        '<p class="hb-title">' + esc(s.title) + statusBadge(s.status) + '</p>' +
        '<p class="hb-summary">' + esc(s.summary) + '</p>' +
        '<a class="link-arrow" href="' + esc(url(s.url)) + '"' + ext(s.url) + '>' + esc(s.ctaLabel) + ' →</a></div>';
    }).join('');

    if(slides.length < 2){ if(controls) controls.hidden = true; return; }

    dotsWrap.innerHTML = slides.map(function(s, i){
      return '<button type="button" aria-label="Chuyển đến slide ' + (i + 1) + ': ' + esc(s.title) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>';
    }).join('');

    var slideEls = track.querySelectorAll('.hb-slide');
    var capEls = captions.querySelectorAll('.hb-caption');
    var dotEls = dotsWrap.querySelectorAll('button');
    var current = 0, timer = null;
    var INTERVAL = 5500;
    var state = {user: reduceMotion, hover: false, focus: false, hidden: document.hidden};

    function show(i){
      current = (i + slides.length) % slides.length;
      for(var k = 0; k < slides.length; k++){
        var on = k === current;
        slideEls[k].classList.toggle('is-active', on);
        if(on) slideEls[k].removeAttribute('aria-hidden'); else slideEls[k].setAttribute('aria-hidden', 'true');
        capEls[k].classList.toggle('is-active', on);
        capEls[k].hidden = !on;
        if(on) dotEls[k].setAttribute('aria-current', 'true'); else dotEls[k].removeAttribute('aria-current');
      }
    }
    function running(){ return !state.user && !state.hover && !state.focus && !state.hidden; }
    function schedule(){
      window.clearTimeout(timer);
      timer = null;
      if(running()) timer = window.setTimeout(function(){ show(current + 1); schedule(); }, INTERVAL);
      // Announce slide changes only when the carousel is not rotating by itself.
      captions.setAttribute('aria-live', state.user ? 'polite' : 'off');
    }
    function renderPause(){
      pauseBtn.setAttribute('aria-pressed', state.user ? 'true' : 'false');
      pauseBtn.innerHTML = state.user
        ? '<span aria-hidden="true">▶</span> ' + 'Tiếp tục'
        : '<span aria-hidden="true">❚❚</span> ' + 'Tạm dừng';
      pauseBtn.setAttribute('aria-label', state.user ? 'Tiếp tục tự động chuyển slide' : 'Tạm dừng tự động chuyển slide');
    }

    prevBtn.addEventListener('click', function(){ show(current - 1); schedule(); });
    nextBtn.addEventListener('click', function(){ show(current + 1); schedule(); });
    Array.prototype.forEach.call(dotEls, function(el, i){ el.addEventListener('click', function(){ show(i); schedule(); }); });
    pauseBtn.addEventListener('click', function(){ state.user = !state.user; renderPause(); schedule(); });
    banner.addEventListener('mouseenter', function(){ state.hover = true; schedule(); });
    banner.addEventListener('mouseleave', function(){ state.hover = false; schedule(); });
    banner.addEventListener('focusin', function(){ state.focus = true; schedule(); });
    banner.addEventListener('focusout', function(e){ if(!banner.contains(e.relatedTarget)){ state.focus = false; schedule(); } });
    document.addEventListener('visibilitychange', function(){ state.hidden = document.hidden; schedule(); });
    controls.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ show(current - 1); schedule(); }
      else if(e.key === 'ArrowRight'){ show(current + 1); schedule(); }
    });

    renderPause();
    schedule();
  })();

  // ---------- program cards ([data-program-cards]: full, [data-program-list]: compact) ----------
  function programCard(p){
    var tracks = (p.tracks || []).map(function(t){
      return '<a href="' + esc(url('dao-tao/' + p.slug + '.html#' + t.key)) + '">' + esc(t.label) +
        (t.status === 'pending' ? ' <span class="mini-badge">Đang cập nhật</span>' : '') + '</a>';
    }).join('');
    var look = PROGRAM_LOOK[p.slug] || {scene: window.ULAW_groupScene ? (function(g){ return g.scene + '__' + g.bg; })(window.ULAW_groupScene(p.group)) : '', tone:'#2D55A8'};
    return '<article class="card program-card has-tone" data-prog-group="' + esc(p.group) + '" style="--tone:' + look.tone + '">' +
      '<div class="pc-media">' + media(look.scene, fill('Ảnh minh họa ngành {name}', {name: p.name}), {w:800, h:450}) + '</div>' +
      '<span class="card-kicker">' + esc(p.groupLabel) + '</span>' +
      '<h3><a href="' + esc(url('dao-tao/' + p.slug + '.html')) + '">' + esc(p.name) + '</a></h3>' +
      '<p>' + esc(p.short) + '</p>' +
      (tracks ? '<div class="track-links" role="group" aria-label="' + fill('Hệ đào tạo ngành {name}', {name: esc(p.name)}) + '">' + tracks + '</div>' : '') +
      '<a class="card-link" href="' + esc(url('dao-tao/' + p.slug + '.html')) + '" aria-label="' + fill('Xem chi tiết ngành {name}', {name: esc(p.name)}) + '">Xem chi tiết →</a>' +
    '</article>';
  }
  document.querySelectorAll('[data-program-cards]').forEach(function(el){
    el.innerHTML = published(window.ULAW_PROGRAMS).map(programCard).join('');
  });
  document.querySelectorAll('[data-program-list]').forEach(function(el){
    el.innerHTML = published(window.ULAW_PROGRAMS).map(function(p){
      return '<a class="card program-card" data-prog-group="' + esc(p.group) + '" href="' + esc(url('dao-tao/' + p.slug + '.html')) + '">' +
        '<span class="card-kicker">' + esc(p.groupLabel) + '</span><h3 style="font-size:1.0625rem">' + esc(p.name) + '</h3>' +
        '<span class="card-link">Xem ngành →</span></a>';
    }).join('');
  });

  // ---------- Sinh viên sub-pages: posts, photo frames, clubs (data: ULAW_STUDENT_*) ----------
  // [data-sv-posts="cat|all"] data-types="A|B" (chips + template labels) data-limit
  // [data-sv-photos="cat"] data-slots="caption|…" — one frame per slot, filled in order
  // [data-sv-clubs] data-slots="field|…" — template cards until clubs are added
  var PH_ICON = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>';
  var viDate = fmtDate;
  function svPost(p){
    var tag = p.href ? 'a' : 'article';
    var meta = [p.date ? viDate(p.date) : '', p.org || ''].filter(Boolean).join(' · ');
    return '<' + tag + ' class="post-card sv-post"' + (p.href ? ' href="' + esc(url(p.href)) + '"' + ext(p.href) : '') + '>' +
      '<div class="post-media">' + (p.type ? '<span class="post-type">' + esc(p.type) + '</span>' : '') + media(p.image || 'study_group__navy', p.title, {w:600, h:400}) + '</div>' +
      '<div class="post-body">' + (meta ? '<span class="post-date">' + esc(meta) + '</span>' : '') +
      '<h3>' + esc(p.title) + '</h3>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') +
      '<div class="sv-post-foot">' + (p.deadline ? '<span class="sv-deadline">Hạn: ' + esc(viDate(p.deadline)) + '</span>' : '') + statusBadge(p.status) + '</div></div></' + tag + '>';
  }
  document.querySelectorAll('[data-sv-posts]').forEach(function(el){
    var cat = el.getAttribute('data-sv-posts');
    var types = (el.getAttribute('data-types') || '').split('|').filter(Boolean);
    var limit = +el.getAttribute('data-limit') || 0;
    var all = published(window.ULAW_STUDENT_POSTS).filter(function(p){ return cat === 'all' || p.cat === cat; })
      .sort(function(a, b){ return String(b.date || '').localeCompare(String(a.date || '')); });
    var chips = '';
    if(all.length && types.length > 1 && cat !== 'all'){
      chips = '<div class="sv-chips" role="group" aria-label="Lọc theo loại">' + ['Tất cả'].concat(types).map(function(t, i){
        return '<button type="button" class="tab-chip' + (i ? '' : ' is-active') + '" aria-pressed="' + (i ? 'false' : 'true') + '" data-type="' + esc(i ? t : 'all') + '">' + esc(t) + '</button>';
      }).join('') + '</div>';
    }
    el.innerHTML = chips + '<div class="sv-posts"></div>';
    var grid = el.querySelector('.sv-posts');
    function render(type){
      var list = all.filter(function(p){ return type === 'all' || p.type === type; });
      if(limit) list = list.slice(0, limit);
      if(list.length){ grid.innerHTML = list.map(svPost).join(''); return; }
      var labels = types.length ? types : ['Thông báo', 'Thông báo', 'Thông báo'];
      grid.innerHTML = labels.slice(0, 3).map(function(t){
        return '<div class="post-card is-template" aria-hidden="true"><div class="post-media"><span class="post-type">' + esc(t) + '</span><div class="post-ph">' + PH_ICON + 'Ảnh / thông tin sẽ cập nhật</div></div>' +
          '<div class="post-body"><span class="post-date">Ngày đăng · Đơn vị</span><h3>Tiêu đề thông báo</h3><p>Nội dung tóm tắt sẽ hiển thị khi Khoa công bố thông tin chính thức.</p></div></div>';
      }).join('') + '<p class="sv-note">Thông tin đang cập nhật — các thẻ trên là khung mẫu.</p>';
    }
    render('all');
    bindChips(Array.prototype.slice.call(el.querySelectorAll('.tab-chip')), 'data-type', render);
  });
  // [data-sv-notices="cat|all"] data-types="A|B" data-limit — notice board rows (date tile, tag, title, Mới/Ghim, deadline)
  var SV_CAT = {'hoc-tap':['Học tập','sinh-vien/hoc-tap.html'], 'hoc-bong':['Học bổng','sinh-vien/hoc-bong.html'],
    'thuc-tap':['Thực tập','sinh-vien/thuc-tap-tuyen-dung.html'], 'cuoc-song':['Hoạt động','sinh-vien/cuoc-song.html']};
  document.querySelectorAll('[data-sv-notices]').forEach(function(el){
    var cat = el.getAttribute('data-sv-notices');
    var types = (el.getAttribute('data-types') || '').split('|').filter(Boolean);
    var limit = +el.getAttribute('data-limit') || 0;
    var only = el.getAttribute('data-only');
    var all = published(window.ULAW_STUDENT_POSTS).filter(function(p){ return (cat === 'all' || p.cat === cat) && (!only || p.type === only); })
      .sort(function(a, b){ return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date || '').localeCompare(String(a.date || '')); });
    var key = cat === 'all' ? 'data-cat' : 'data-type';
    var chipList = cat === 'all' ? Object.keys(SV_CAT).map(function(c){ return [c, SV_CAT[c][0]]; }) : types.map(function(t){ return [t, t]; });
    if(only) chipList = [];
    var chips = chipList.length > 1 ? '<div class="sv-chips" role="group" aria-label="Lọc thông báo">' + [['all', 'Tất cả']].concat(chipList).map(function(c, i){
      return '<button type="button" class="tab-chip' + (i ? '' : ' is-active') + '" aria-pressed="' + (i ? 'false' : 'true') + '" ' + key + '="' + esc(c[0]) + '">' + esc(c[1]) + '</button>';
    }).join('') + '</div>' : '';
    el.innerHTML = chips + '<ul class="nb-list"></ul>';
    var ul = el.querySelector('.nb-list'), now = Date.now();
    function row(p){
      var d = p.date ? new Date(p.date) : null;
      var fresh = d && (now - d.getTime()) < 14 * 864e5 && d.getTime() <= now;
      var tag = cat === 'all' ? (SV_CAT[p.cat] || [p.type || ''])[0] : (p.type || '');
      var inner = '<span class="nb-date">' + (d ? '<b>' + pad(d.getDate()) + '</b>' + MONTHS[d.getMonth()] + '/' + String(d.getFullYear()).slice(2) : '<b>–</b>') + '</span>' +
        '<span class="nb-txt"><small class="nb-tag nb-' + esc(p.cat || '') + '">' + esc(tag) + '</small><strong>' + esc(p.title) + '</strong>' +
        (p.excerpt || p.org ? '<span>' + esc([p.org, p.excerpt].filter(Boolean).join(' — ')) + '</span>' : '') + '</span>' +
        '<span class="nb-side">' + (p.pinned ? '<span class="nb-flag is-pin">Ghim</span>' : fresh ? '<span class="nb-flag">Mới</span>' : '') +
        (p.deadline ? '<span class="sv-deadline">Hạn ' + esc(viDate(p.deadline)) + '</span>' : '') + statusBadge(p.status) + '</span>';
      return '<li>' + (p.href ? '<a class="nb-row" href="' + esc(url(p.href)) + '"' + ext(p.href) + '>' + inner + '<span class="nb-arrow" aria-hidden="true">→</span></a>' : '<div class="nb-row">' + inner + '</div>') + '</li>';
    }
    function render(v){
      var l = all.filter(function(p){ return v === 'all' || (cat === 'all' ? p.cat === v : p.type === v); });
      if(limit) l = l.slice(0, limit);
      if(l.length){ ul.innerHTML = l.map(row).join(''); ul.classList.remove('is-empty'); return; }
      ul.classList.add('is-empty');
      ul.innerHTML = [0, 1, 2, 3].map(function(i){
        var tag = cat === 'all' ? chipList[i % chipList.length][1] : (types[i % (types.length || 1)] || 'Thông báo');
        return '<li aria-hidden="true"><div class="nb-row"><span class="nb-date"><b>––</b>Ngày</span><span class="nb-txt"><small class="nb-tag">' + esc(tag) + '</small><strong>Tiêu đề thông báo</strong><span>Nội dung tóm tắt sẽ hiển thị khi có thông báo chính thức.</span></span></div></li>';
      }).join('') + '<li class="sv-note">' + (all.length ? 'Chưa có thông báo thuộc mục này.' : 'Thông tin đang cập nhật — các dòng trên là khung mẫu.') + '</li>';
    }
    render('all');
    bindChips(Array.prototype.slice.call(el.querySelectorAll('.tab-chip')), key, render);
  });
  document.querySelectorAll('[data-sv-photos]').forEach(function(el){
    var cat = el.getAttribute('data-sv-photos');
    var slots = (el.getAttribute('data-slots') || 'Hình ảnh').split('|');
    var photos = published(window.ULAW_STUDENT_PHOTOS).filter(function(p){ return p.cat === cat; });
    var n = Math.max(slots.length, photos.length), html = '';
    for(var i = 0; i < n; i++){
      var ph = photos[i], cap = ph && ph.caption ? ph.caption : (slots[i] || '');
      html += '<figure class="sv-photo' + (ph ? '' : ' is-template') + '">' +
        (ph ? media(ph.image, cap, {w:900, h:600, noLabel:true}) : '<div class="sv-photo-ph" aria-hidden="true">' + PH_ICON + '<small>Ảnh sẽ cập nhật</small></div>') +
        (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure>';
    }
    el.innerHTML = html;
  });
  document.querySelectorAll('[data-sv-clubs]').forEach(function(el){
    var clubs = published(window.ULAW_STUDENT_CLUBS), sample = !clubs.length;
    if(sample) clubs = (el.getAttribute('data-slots') || 'Học thuật|Kỹ năng|Văn nghệ|Thể thao').split('|').map(function(f){ return {field:f}; });
    el.innerHTML = clubs.map(function(c){
      var logo = c.logo ? '<img src="' + esc(url(c.logo)) + '" alt="Logo ' + esc(c.name) + '" width="96" height="96" loading="lazy">' : '<span aria-hidden="true">' + esc((c.name || c.field || '?').charAt(0)) + '</span>';
      var inner = '<div class="club-logo">' + logo + '</div><span class="club-field">' + esc(c.field || '') + '</span>' +
        '<h3>' + (c.name ? esc(c.name) : 'Tên câu lạc bộ') + '</h3><p>' + (c.desc ? esc(c.desc) : 'Giới thiệu, lĩnh vực hoạt động và cách tham gia — đang cập nhật.') + '</p>' + (sample ? '' : statusBadge(c.status));
      return c.href ? '<a class="club-card" href="' + esc(url(c.href)) + '"' + ext(c.href) + '>' + inner + '</a>'
                    : '<article class="club-card' + (sample ? ' is-template' : '') + '">' + inner + '</article>';
    }).join('');
  });

  // ---------- /doanh-nghiep: sliding partner strip ([data-partners] data-slots) ----------
  // Items are rendered twice so the CSS slide loops seamlessly; the copy is aria-hidden.
  document.querySelectorAll('[data-partners]').forEach(function(el){
    var list = published(window.ULAW_PARTNERS), n = Math.max(+el.getAttribute('data-slots') || 6, list.length);
    // Logo only; the partner name stays as alt text / accessible name.
    function card(p){
      var logo = p && p.logo ? '<img src="' + esc(url(p.logo)) + '" alt="' + esc(p.name || 'Logo đối tác') + '" width="240" height="120" loading="lazy">'
        : p ? '<span class="logo-name">' + esc(p.name) + '</span>'
        : '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14l3-3 3 3 2-2 2 2"/></svg><small>Logo đối tác</small>';
      if(p && p.href) return '<a class="logo-card" href="' + esc(url(p.href)) + '"' + ext(p.href) + ' title="' + esc(p.name || '') + '">' + logo + '</a>';
      return '<div class="logo-card' + (p ? '' : ' is-template') + '"' + (p ? ' title="' + esc(p.name || '') + '"' : '') + '>' + logo + '</div>';
    }
    var items = '';
    for(var i = 0; i < n; i++) items += '<li>' + card(list[i]) + '</li>';
    var clone = items.replace(/<li>/g, '<li data-clone aria-hidden="true">').replace(/<a /g, '<a tabindex="-1" ');
    el.innerHTML = '<ul class="logo-track">' + items + clone + '</ul>';
    var btn = document.querySelector('[data-partners-toggle]');
    if(btn) btn.addEventListener('click', function(){
      var paused = el.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.textContent = paused ? 'Tiếp tục trượt' : 'Tạm dừng';
    });
  });

  // The two most recently posted items (by `date`) get a "New" tag.
  function newestTwo(list){
    return list.filter(function(i){ return i.date; }).slice().sort(function(a, b){ return String(b.date).localeCompare(String(a.date)); }).slice(0, 2);
  }
  // ---------- /doanh-nghiep: internships — 3 featured image cards + "mới cập nhật" list ([data-internships]) ----------
  // Featured = items with featured:true (else the 3 newest); the side list shows all, newest first.
  document.querySelectorAll('[data-internships]').forEach(function(el){
    var feat = el.querySelector('.in-feature'), side = el.querySelector('.in-updates');
    var list = published(window.ULAW_INTERNSHIPS).sort(function(a, b){ return String(b.date || '').localeCompare(String(a.date || '')); });
    var top = list.filter(function(i){ return i.featured; });
    if(top.length < 3) top = top.concat(list.filter(function(i){ return !i.featured; })).slice(0, 3);
    else top = top.slice(0, 3);
    function logoOf(it){ return it.logo ? '<img src="' + esc(url(it.logo)) + '" alt="" width="112" height="112" loading="lazy">' : esc((it.company || '?').charAt(0)); }
    function wrap(it, cls, inner){
      return it.href ? '<a class="' + cls + '" href="' + esc(url(it.href)) + '"' + ext(it.href) + '>' + inner + '</a>' : '<div class="' + cls + '">' + inner + '</div>';
    }
    var PH = '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>';
    var html = '';
    for(var i = 0; i < 3; i++){
      var it = top[i];
      if(!it){
        html += '<div class="in-shot is-template" aria-hidden="true"><div class="in-img">' + PH + '<small>Ảnh tuyển dụng của doanh nghiệp</small></div>' +
          '<div class="in-cap"><span class="job-logo">?</span><span><small>Tên doanh nghiệp</small><strong>Vị trí thực tập</strong></span></div></div>';
        continue;
      }
      var img = it.image ? media(it.image, 'Ảnh tuyển thực tập: ' + (it.company || ''), {w:900, h:600, noLabel:true}) : '<div class="in-img-ph">' + PH + '</div>';
      html += wrap(it, 'in-shot', '<div class="in-img">' + img + (it.deadline ? '<span class="in-dl">Hạn ' + esc(viDate(it.deadline)) + '</span>' : '') + '</div>' +
        '<div class="in-cap"><span class="job-logo">' + logoOf(it) + '</span><span><small>' + esc(it.company || '') + '</small><strong>' + esc(it.title || '') + '</strong>' +
        '<em>' + esc([it.slots != null ? it.slots + ' vị trí' : '', it.duration, it.location].filter(Boolean).join(' · ')) + '</em></span>' + statusBadge(it.status) + '</div>');
    }
    feat.innerHTML = html;
    var newest = newestTwo(list);
    side.innerHTML = list.length ? list.map(function(it){
      var d = it.date ? viDate(it.date) : '';
      return '<li>' + wrap(it, 'in-upd', '<span class="job-logo">' + logoOf(it) + '</span><span class="in-upd-txt"><strong>' + esc(it.company || '') + (newest.indexOf(it) > -1 ? ' <span class="new-tag">New</span>' : '') + '</strong><span>' + esc(it.title || '') + '</span>' +
        '<small>' + esc([d ? 'Cập nhật ' + d : '', it.deadline ? 'Hạn ' + viDate(it.deadline) : ''].filter(Boolean).join(' · ')) + '</small></span>') + '</li>';
    }).join('') : [1, 2, 3, 4, 5].map(function(n){
      return '<li aria-hidden="true"><div class="in-upd is-template"><span class="job-logo">?</span><span class="in-upd-txt"><strong>Tên doanh nghiệp' + (n < 3 ? ' <span class="new-tag">New</span>' : '') + '</strong><span>Vị trí thực tập</span><small>Ngày cập nhật · Hạn nộp</small></span></div></li>';
    }).join('') + '<li class="sv-note">Thông tin đang cập nhật.</li>';
    var count = el.querySelector('[data-in-count]');
    if(count) count.textContent = nOf('{n} tin', list.length);
  });

  // ---------- /doanh-nghiep: job board ([data-jobs], chips filter by type) ----------
  document.querySelectorAll('[data-jobs]').forEach(function(el){
    var jobs = published(window.ULAW_JOBS).sort(function(a, b){ return String(a.deadline || '9').localeCompare(String(b.deadline || '9')); });
    var newest = newestTwo(jobs);
    var list = el.querySelector('.job-list');
    function row(j){
      var logo = j.logo ? '<img src="' + esc(url(j.logo)) + '" alt="" width="112" height="112" loading="lazy">' : esc((j.company || '?').charAt(0));
      var inner = '<span class="job-logo">' + logo + '</span><div class="job-main"><h3>' + esc(j.title) + (newest.indexOf(j) > -1 ? ' <span class="new-tag">New</span>' : '') + '</h3><span>' + esc([j.company, j.location].filter(Boolean).join(' · ')) + '</span></div>' +
        '<div class="job-tags"><span class="job-type' + (j.type === 'Thực tập' ? ' is-intern' : '') + '">' + esc(j.type || 'Tuyển dụng') + '</span>' + statusBadge(j.status) + '</div>' +
        '<span class="job-dl">' + (j.deadline ? 'Hạn: ' + esc(viDate(j.deadline)) : '') + '</span>';
      return '<li>' + (j.href ? '<a class="job-row" href="' + esc(url(j.href)) + '"' + ext(j.href) + '>' + inner + '</a>' : '<div class="job-row">' + inner + '</div>') + '</li>';
    }
    function render(type){
      var l = jobs.filter(function(j){ return type === 'all' || j.type === type; });
      if(l.length){ list.innerHTML = l.map(row).join(''); return; }
      list.innerHTML = [1, 2, 3].map(function(n){
        return '<li aria-hidden="true"><div class="job-row is-template"><span class="job-logo">?</span><div class="job-main"><h3>Vị trí tuyển dụng' + (n < 3 ? ' <span class="new-tag">New</span>' : '') + '</h3><span>Tên doanh nghiệp · Địa điểm</span></div>' +
          '<div class="job-tags"><span class="job-type">Hình thức</span></div><span class="job-dl">Hạn nộp</span></div></li>';
      }).join('') + '<li class="sv-note">' + (jobs.length ? 'Chưa có tin thuộc loại này.' : 'Thông tin đang cập nhật — tin tuyển dụng từ doanh nghiệp đối tác sẽ hiển thị tại đây.') + '</li>';
    }
    render('all');
    bindChips(Array.prototype.slice.call(el.querySelectorAll('.tab-chip')), 'data-type', render);
  });

  // ---------- /alumni: generative community network ([data-alumni-network]) ----------
  // Decorative SVG on a dark stage: the Faculty at the centre, three cohort rings of alumni,
  // links to neighbours and to the centre (static). Nodes are large enough to show photos.
  // Real photos (ULAW_ALUMNI_PHOTOS, then story images) fill person nodes, circle-cropped, when available.
  (function(){
    var el = document.querySelector('[data-alumni-network]');
    if(!el) return;
    var W = 560, H = 560, cx = W / 2, cy = H / 2, seed = 7;
    function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var photos = published(window.ULAW_ALUMNI_PHOTOS).concat(published(window.ULAW_ALUMNI_STORIES).filter(function(a){ return a.image && /\.(jpe?g|png|webp|avif)$/i.test(a.image); }))
      .filter(function(p){ return p.image; });
    var rings = [{r:118, n:7, c:'#E8742A'}, {r:188, n:11, c:'#169C83'}, {r:254, n:15, c:'#2D55A8'}];
    var nodes = [], links = '', people = '', pulses = '', defs = '';
    rings.forEach(function(g, ri){
      for(var i = 0; i < g.n; i++){
        var a = (i / g.n) * Math.PI * 2 + ri * 0.45 + (rnd() - .5) * .12, rr = g.r + (rnd() - .5) * 14;
        nodes.push({x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, c: g.c, ring: ri, s: 20 - ri * 2 + rnd() * 3});
      }
    });
    // spread photos over the nodes (every k-th node), largest-looking slots first
    var order = nodes.map(function(n, i){ return i; }), step = photos.length ? Math.max(1, Math.floor(nodes.length / photos.length)) : 0;
    var photoAt = {};
    photos.slice(0, nodes.length).forEach(function(p, k){ photoAt[(k * step + 3) % nodes.length] = p; });
    function line(a, b, cls){ return '<line class="' + cls + '" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>'; }
    nodes.forEach(function(n, i){
      var d = nodes.map(function(m, j){ return {j:j, d: i === j ? 1e9 : Math.hypot(m.x - n.x, m.y - n.y)}; }).sort(function(a, b){ return a.d - b.d; });
      [d[0], d[1]].forEach(function(o){ if(o.j > i) links += line(n, nodes[o.j], 'nl'); });
      if(n.ring === 0 || rnd() < .12) links += line(n, {x:cx, y:cy}, 'nl nl-hub');
      var s = n.s, ph = photoAt[i], g = '<g class="nn' + (ph ? ' has-photo' : '') + '" style="--d:' + (rnd() * 4).toFixed(2) + 's" transform="translate(' + n.x.toFixed(1) + ' ' + n.y.toFixed(1) + ')">';
      if(ph){
        var R = s + 6;
        defs += '<clipPath id="nc' + i + '"><circle r="' + R.toFixed(1) + '"/></clipPath>';
        g += (ph.name ? '<title>' + esc(ph.name + (ph.cohort ? ' · ' + ph.cohort : '')) + '</title>' : '') +
          '<circle r="' + (R + 3).toFixed(1) + '" fill="' + n.c + '"/>' +
          '<image href="' + esc(url(ph.image)) + '" x="' + (-R).toFixed(1) + '" y="' + (-R).toFixed(1) + '" width="' + (2 * R).toFixed(1) + '" height="' + (2 * R).toFixed(1) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#nc' + i + ')"/>';
      } else {
        g += '<circle r="' + (s + 6).toFixed(1) + '" fill="#fff" stroke="' + n.c + '" stroke-width="2.5"/>' +
          '<circle cy="' + (-s * .28).toFixed(1) + '" r="' + (s * .36).toFixed(1) + '" fill="' + n.c + '"/>' +
          '<path d="M' + (-s * .62).toFixed(1) + ' ' + (s * .62).toFixed(1) + 'a' + (s * .62).toFixed(1) + ' ' + (s * .5).toFixed(1) + ' 0 0 1 ' + (s * 1.24).toFixed(1) + ' 0" fill="' + n.c + '"/>';
      }
      people += g + '</g>';
    });
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="ng" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F28C38" stop-opacity=".55"/><stop offset="1" stop-color="#F28C38" stop-opacity="0"/></radialGradient>' + defs + '</defs>' +
      rings.map(function(g){ return '<circle class="nring" cx="' + cx + '" cy="' + cy + '" r="' + g.r + '"/>'; }).join('') +
      '<circle cx="' + cx + '" cy="' + cy + '" r="150" fill="url(#ng)"/>' + links + pulses + people +
      '<g class="nhub"><circle cx="' + cx + '" cy="' + cy + '" r="50" fill="#fff" stroke="#E8742A" stroke-width="4"/>' +
      '<image href="' + esc(url('assets/images/logo-ulaw.png')) + '" x="' + (cx - 34) + '" y="' + (cy - 34) + '" width="68" height="68"/></g></svg>';
  })();

  // ---------- /alumni: success-story mosaic ([data-alumni-mosaic]) ----------
  // 4-column mosaic: control tile (topic filter + shuffle), 2 large feature tiles, 7 small tiles.
  // Empty ULAW_ALUMNI_STORIES → designed template tiles (no invented names or achievements).
  (function(){
    var el = document.querySelector('[data-alumni-mosaic]');
    if(!el) return;
    var all = published(window.ULAW_ALUMNI_STORIES), sample = !all.length;
    var TONES = ['#2D55A8', '#C46A12', '#169C83', '#7A3E7F', '#1C5E97', '#0E7C7C', '#5E7A2E', '#B03A48'];
    var SCENES = ['graduation_career__purple', 'handshake_business__red', 'laptop_tech__green', 'teamwork_meeting__green', 'research_books__purple', 'campus_building__navy', 'study_group__navy', 'graduation_career__red'];
    var topics = [];
    all.forEach(function(a){ if(a.topic && topics.indexOf(a.topic) < 0) topics.push(a.topic); });
    function tile(a, i, big){
      var tone = TONES[i % TONES.length];
      var bg = a && a.image ? media(a.image, '', {w: big ? 1200 : 700, h: big ? 1200 : 700, noLabel:true})
        : '<span class="am-scene" aria-hidden="true">' + media(SCENES[i % SCENES.length], '', {noLabel:true}) + '</span>';
      var meta = a ? [a.cohort, a.program].filter(Boolean).join(' · ') : 'Khóa · Ngành';
      var title = a ? esc(a.name) : (big ? 'Câu chuyện nổi bật' : 'Tên cựu sinh viên');
      var inner = '<div class="am-bg">' + bg + '</div><div class="am-body">' +
        (big ? '<span class="am-kicker">' + esc(a && a.topic ? a.topic : 'Câu chuyện nổi bật') + '</span>' : '') +
        '<h3 class="am-title">' + title + '</h3>' +
        (big ? '<p class="am-text">' + esc(a ? (a.headline || a.excerpt || '') : 'Hành trình của cựu sinh viên Khoa Quản trị sẽ được đăng tại đây khi có sự đồng ý và đã được Khoa xác thực.') + '</p>' : '') +
        '<span class="am-meta">' + esc(a && a.role ? a.role + (a.org ? ' · ' + a.org : '') : meta) + '</span>' +
        (big ? '<span class="am-btn">' + (a ? 'Đọc câu chuyện' : 'Sắp ra mắt') + ' <span aria-hidden="true">▸</span></span>' : '<span class="am-link">' + (a ? 'Xem câu chuyện' : 'Đang cập nhật') + '</span>') +
        (a ? statusBadge(a.status) : '') + '</div>';
      var cls = 'am-tile' + (big ? ' is-big' : '') + (a ? '' : ' is-template');
      return a && a.href
        ? '<a class="' + cls + '" href="' + esc(url(a.href)) + '"' + ext(a.href) + ' style="--tone:' + tone + '">' + inner + '</a>'
        : '<article class="' + cls + '" style="--tone:' + tone + '"' + (a ? '' : ' aria-hidden="true"') + '>' + inner + '</article>';
    }
    function render(list){
      var feat = list.filter(function(a){ return a.featured; }), rest = list.filter(function(a){ return !a.featured; });
      var order = feat.concat(rest), big = [order[0], order[1]], small = order.slice(2, 9);
      if(sample){ big = [null, null]; small = [null, null, null, null, null, null, null]; }
      var ctl = '<div class="am-tile am-ctl"><p class="am-ctl-title">Khám phá câu chuyện</p><button type="button" class="am-shuffle"' + (list.length > 1 ? '' : ' disabled') + '>' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg> Xáo trộn</button>' +
        (sample ? '<small class="am-hint">Xáo trộn hoạt động khi có câu chuyện</small>' : '') + '</div>';
      var html = ctl, s = 0;
      html += small[s] !== undefined ? tile(small[s], 1) : ''; s++;
      html += big[0] !== undefined ? tile(big[0], 0, true) : '';
      html += small[s] !== undefined ? tile(small[s], 2) : ''; s++;
      html += small[s] !== undefined ? tile(small[s], 3) : ''; s++;
      html += big[1] !== undefined ? tile(big[1], 4, true) : '';
      for(; s < small.length; s++) html += small[s] !== undefined ? tile(small[s], s + 4) : '';
      el.innerHTML = html;
      var btn = el.querySelector('.am-shuffle');
      btn.addEventListener('click', function(){
        var l = filtered().slice();
        for(var i = l.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t; }
        render(l.map(function(a){ return Object.assign({}, a, {featured:false}); }));
        el.querySelector('.am-shuffle').focus();
      });
    }
    var current = 'all';
    function filtered(){ return all.filter(function(a){ return current === 'all' || a.topic === current; }); }
    render(all);
  })();

  // ---------- shared FAQ blocks ([data-faq]) ----------
  document.querySelectorAll('[data-faq]').forEach(function(el){
    el.innerHTML = published(window.ULAW_FAQ_GENERIC).map(function(item){
      return '<details class="faq-item"><summary>' + esc(item.q) + '<span class="car" aria-hidden="true"></span></summary><div class="faq-a">' + esc(item.a) + '</div></details>';
    }).join('');
  });

  // ---------- page illustrations ([data-scene="key"][data-alt]) ----------
  document.querySelectorAll('[data-scene]').forEach(function(el){
    el.innerHTML = media(el.getAttribute('data-scene'), el.getAttribute('data-alt') || 'Ảnh minh họa');
  });

  // News split view: left = 3 newest as image+text rows, right = every item newest → oldest.
  function byNewest(list){ return list.slice().sort(function(a, b){ return String(b.date || '').localeCompare(String(a.date || '')); }); }
  function newsSplit(el, items, byYear){
    var sorted = byNewest(items), top = sorted.slice(0, 3);
    var rows = top.map(function(n){
      return '<a class="ns-row" href="' + esc(url(n.url)) + '"><div class="ns-media">' + media(n.image, n.alt, {w:600, h:400, noLabel:true}) + '</div>' +
        '<div class="ns-body"><div class="news-meta"><span class="news-cat">' + esc(n.category) + '</span><span>' + esc(newsDate(n)) + '</span></div>' +
        '<h4>' + esc(n.title) + '</h4><p>' + esc(n.excerpt) + '</p>' + statusBadge(n.status) + '</div></a>';
    });
    for(var i = rows.length; i < 3; i++) rows.push('<div class="ns-row is-template" aria-hidden="true"><div class="ns-media ns-ph">Ảnh</div><div class="ns-body"><div class="news-meta"><span>Ngày đăng</span></div><h4>Tiêu đề tin tức</h4><p>Tin tức sẽ được đăng khi có nội dung chính thức.</p></div></div>');
    function item(n){
      var d = n.date ? new Date(n.date) : null;
      return '<li><a class="nl-item" href="' + esc(url(n.url)) + '"><span class="nl-date">' + (d ? '<b>' + pad(d.getDate()) + '</b>' + MONTHS[d.getMonth()] + '/' + String(d.getFullYear()).slice(2) : '<b>–</b>Chưa rõ') + '</span>' +
        '<span class="nl-txt"><small>' + esc(n.category) + '</small><strong>' + esc(n.title) + '</strong></span></a></li>';
    }
    var list = '';
    if(byYear){
      // one group per year, newest year first; undated items last
      var groups = {}, years = [];
      sorted.forEach(function(n){ var y = n.date ? String(new Date(n.date).getFullYear()) : 'Chưa xác định năm'; if(!groups[y]){ groups[y] = []; years.push(y); } groups[y].push(n); });
      list = years.map(function(y){
        return '<li class="nl-year"><span class="nl-year-label">' + esc(y) + '</span><span class="nl-year-count">' + nOf('{n} tin', groups[y].length) + '</span></li>' + groups[y].map(item).join('');
      }).join('');
    } else list = sorted.map(item).join('');
    el.innerHTML = '<div class="ns-feature">' + rows.join('') + '</div>' +
      '<aside class="ns-side" aria-label="Tất cả tin theo thời gian"><div class="ns-side-head"><h4>' + (byYear ? 'Tất cả tin theo năm' : 'Tin theo thời gian') + '</h4><span class="in-count">' + nOf('{n} tin', sorted.length) + '</span></div>' +
      (list ? '<ol class="nl-list">' + list + '</ol>' : '<p class="sv-note">Chưa có tin tức.</p>') +
      '<p class="nl-foot">Mới nhất ở trên cùng. Tin chưa xác thực ngày đăng xếp cuối.</p></aside>';
  }

  // ---------- home: SECTION 9 — news (3 picture cards) + events (month calendar + event info) ----------
  (function(){
    var newsEl = document.getElementById('home-news');
    if(newsEl) newsSplit(newsEl, published(window.ULAW_NEWS));
    document.querySelectorAll('#home-events, [data-event-cal]').forEach(eventCalendar);
  })();

  // Month calendar + event info panel. Used on the home page and on tin-tuc/index.html#su-kien.
  function eventCalendar(calEl){
    var events = published(window.ULAW_EVENTS).filter(function(e){ return e.startAt; })
      .sort(function(a, b){ return new Date(a.startAt) - new Date(b.startAt); });
    function key(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function daysOf(e){  // every calendar day an event covers
      var out = [], d = new Date(e.startAt), end = new Date(e.endAt || e.startAt);
      d.setHours(0, 0, 0, 0);
      while(d <= end && out.length < 62){ out.push(key(d)); d.setDate(d.getDate() + 1); }
      return out;
    }
    var byDay = {};
    events.forEach(function(e){ daysOf(e).forEach(function(k){ (byDay[k] = byDay[k] || []).push(e); }); });
    var today = new Date(), next = events.filter(function(e){ return new Date(e.endAt || e.startAt) >= today; })[0];
    var view = next ? new Date(next.startAt) : new Date(today);
    view.setDate(1);
    var selected = null;

    calEl.innerHTML = '<div class="cal" role="group" aria-labelledby="cal-title"><div class="cal-head"><button type="button" class="cal-nav" data-step="-1" aria-label="' + 'Tháng trước' + '">‹</button>' +
      '<h4 id="cal-title" aria-live="polite"></h4><button type="button" class="cal-nav" data-step="1" aria-label="' + 'Tháng sau' + '">›</button></div>' +
      '<table class="cal-grid"><thead><tr>' + WEEK_SHORT.map(function(d){ return '<th scope="col">' + d + '</th>'; }).join('') + '</tr></thead><tbody></tbody></table>' +
      '<p class="cal-legend"><span class="cal-dot" aria-hidden="true"></span> ' + 'Ngày có sự kiện' + ' <span class="cal-today-key" aria-hidden="true"></span> ' + 'Hôm nay' + '</p></div>' +
      '<div class="ev-panel"><div class="ev-panel-head"><h4 id="ev-panel-title"></h4><button type="button" class="ev-all" hidden>' + 'Cả tháng' + '</button></div><div class="ev-list" aria-live="polite"></div></div>';
    var title = calEl.querySelector('#cal-title'), body = calEl.querySelector('tbody');
    var pTitle = calEl.querySelector('#ev-panel-title'), pList = calEl.querySelector('.ev-list'), allBtn = calEl.querySelector('.ev-all');

    function info(e){
      var s = new Date(e.startAt), en = e.endAt ? new Date(e.endAt) : null;
      var time = pad(s.getHours()) + ':' + pad(s.getMinutes()) + (en && key(en) === key(s) ? '–' + pad(en.getHours()) + ':' + pad(en.getMinutes()) : '');
      var span = en && key(en) !== key(s) ? fmtDate(s) + ' – ' + fmtDate(en) : fmtDate(s);
      var t = e.url ? '<a href="' + esc(url(e.url)) + '">' + esc(e.title) + '</a>' : esc(e.title);
      return '<article class="ev-item"><div class="ev-date" aria-hidden="true"><b>' + pad(s.getDate()) + '</b>' + MONTHS[s.getMonth()] + '</div><div class="ev-body">' +
        (e.category ? '<span class="ev-cat">' + esc(e.category) + '</span>' : '') + '<h5>' + t + '</h5>' +
        '<ul class="ev-meta"><li><span>' + 'Ngày' + '</span>' + esc(span) + '</li><li><span>' + 'Giờ' + '</span>' + esc(time) + '</li><li><span>' + 'Địa điểm' + '</span>' + esc(e.place || e.mode || 'Đang cập nhật') + '</li></ul>' +
        (e.excerpt ? '<p>' + esc(e.excerpt) + '</p>' : '') +
        '<div class="ev-actions">' + (e.registerUrl ? '<a class="btn btn-primary" href="' + esc(url(e.registerUrl)) + '"' + ext(e.registerUrl) + '>' + 'Đăng ký tham dự' + '</a>' : '') + statusBadge(e.status) + '</div></div></article>';
    }
    function panel(){
      var list, label;
      if(selected){
        list = byDay[selected] || [];
        var p = selected.split('-');
        label = /* i18n:off */ EN ? 'Events on ' + (+p[2]) + ' ' + MONTH_NAMES[+p[1] - 1] : 'Sự kiện ngày ' + p[2] + '/' + p[1] /* i18n:on */;
      } else {
        var y = view.getFullYear(), m = view.getMonth();
        list = events.filter(function(e){ return daysOf(e).some(function(k){ var q = k.split('-'); return +q[0] === y && +q[1] === m + 1; }); });
        label = /* i18n:off */ EN ? 'Events in ' + MONTH_NAMES[m] + ' ' + y : 'Sự kiện ' + MONTH_NAMES[m].toLowerCase() + '/' + y /* i18n:on */;
      }
      pTitle.textContent = label;
      allBtn.hidden = !selected;
      pList.innerHTML = list.length ? list.map(info).join('')
        : '<div class="ev-empty"><strong>' + 'Chưa có sự kiện' + '</strong><p>' + (events.length ? 'Không có sự kiện trong khoảng thời gian này. Chọn tháng khác trên lịch.' : 'Lịch sự kiện sẽ được cập nhật khi Khoa công bố chính thức.') + '</p>' +
          '<a class="link-arrow" href="' + esc(url('tin-tuc/index.html')) + '">' + 'Xem tin tức →' + '</a></div>';
    }
    function render(){
      var y = view.getFullYear(), m = view.getMonth();
      title.textContent = MONTH_NAMES[m] + (EN ? ' ' : ' · ') + y;
      var first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), html = '<tr>', col = 0;
      for(var i = 0; i < first; i++, col++) html += '<td></td>';
      for(var d = 1; d <= days; d++){
        var k = y + '-' + pad(m + 1) + '-' + pad(d), has = byDay[k], isToday = k === key(today);
        var cls = 'cal-day' + (has ? ' has-ev' : '') + (isToday ? ' is-today' : '') + (k === selected ? ' is-sel' : '');
        html += '<td>' + (has
          ? '<button type="button" class="' + cls + '" data-day="' + k + '" aria-pressed="' + (k === selected) + '" aria-label="' + /* i18n:off */ (EN ? d + ' ' + MONTH_NAMES[m] + ', ' + has.length + (has.length === 1 ? ' event' : ' events') : d + ' ' + MONTH_NAMES[m].toLowerCase() + ', ' + has.length + ' sự kiện') /* i18n:on */ + '">' + d + '</button>'
          : '<span class="' + cls + '"' + (isToday ? ' aria-current="date"' : '') + '>' + d + '</span>') + '</td>';
        if(++col % 7 === 0 && d < days) html += '</tr><tr>';
      }
      while(col % 7){ html += '<td></td>'; col++; }
      body.innerHTML = html + '</tr>';
      panel();
    }
    calEl.addEventListener('click', function(e){
      var nav = e.target.closest('.cal-nav'), day = e.target.closest('[data-day]');
      if(nav){ view.setMonth(view.getMonth() + (+nav.getAttribute('data-step'))); selected = null; render(); }
      else if(day){ var k = day.getAttribute('data-day'); selected = selected === k ? null : k; render(); var b = body.querySelector('[data-day="' + k + '"]'); if(b) b.focus(); }
      else if(e.target.closest('.ev-all')){ selected = null; render(); }
    });
    render();
  }

  // ---------- tin-tuc#lich-truc: Lịch trực khoa (month grid + "hôm nay" spotlight + person filter) ----------
  (function(){
    var root = document.querySelector('[data-duty-cal]');
    if(!root) return;
    var SHIFTS = [{id:'sang', label:'Sáng', full:'Buổi sáng'}, {id:'chieu', label:'Chiều', full:'Buổi chiều'}];
    var MN = MONTH_NAMES, WD = WEEK_DAYS;
    var list = published(window.ULAW_DUTY).filter(function(d){ return d.date && d.shift; });
    var by = {};
    list.forEach(function(d){ (by[d.date] = by[d.date] || {})[d.shift] = d; });
    function key(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function initials(n){ var w = String(n || '').trim().split(/\s+/); return (w.length > 1 ? w[w.length - 2][0] : '') + (w[w.length - 1] || '?')[0]; }
    var today = new Date(), tKey = key(today), view = new Date(today.getFullYear(), today.getMonth(), 1);
    var selected = tKey, q = '';

    root.innerHTML =
      '<aside class="duty-spot" aria-live="polite"></aside>' +
      '<div class="duty-main">' +
        '<div class="duty-bar">' +
          '<div class="duty-month"><button type="button" class="cal-nav" data-step="-1" aria-label="' + 'Tháng trước' + '">‹</button>' +
          '<h3 class="duty-title" aria-live="polite"></h3>' +
          '<button type="button" class="cal-nav" data-step="1" aria-label="' + 'Tháng sau' + '">›</button>' +
          '<button type="button" class="duty-today">' + 'Hôm nay' + '</button></div>' +
          '<div class="field duty-find"><label for="duty-q">' + 'Tìm cán bộ trực' + '</label><input type="search" id="duty-q" placeholder="' + 'Nhập tên…' + '" autocomplete="off"></div>' +
        '</div>' +
        '<div class="duty-grid" role="group" aria-label="' + 'Lịch trực theo tháng' + '"></div>' +
        '<p class="duty-legend"><span class="dl dl-on"></span>' + 'Đã phân công' + ' <span class="dl dl-off"></span>' + 'Chưa phân công' + ' <span class="dl dl-now"></span>' + 'Hôm nay' + '' +
        (list.length ? '' : ' · <span class="badge badge-pending">' + 'Đang cập nhật' + '</span>') + '</p>' +
      '</div>';
    var spot = root.querySelector('.duty-spot'), grid = root.querySelector('.duty-grid'), title = root.querySelector('.duty-title'), input = root.querySelector('#duty-q');

    function match(d){ return q && d && norm(d.person).indexOf(q) > -1; }
    function slot(k, s){
      var d = (by[k] || {})[s.id];
      return '<span class="duty-slot ' + (d ? 'is-on' : 'is-off') + (match(d) ? ' is-hit' : '') + '"><b>' + s.label + '</b>' +
        (d ? '<i class="duty-ava" aria-hidden="true">' + esc(initials(d.person)) + '</i><em>' + esc(d.person) + '</em>' : '<em>' + 'Chưa phân công' + '</em>') + '</span>';
    }
    function renderSpot(){
      var p = selected.split('-'), date = new Date(+p[0], +p[1] - 1, +p[2]), isT = selected === tKey, row = by[selected] || {};
      var weekend = date.getDay() === 0 || date.getDay() === 6;
      var nowShift = isT ? (today.getHours() < 12 ? 'sang' : today.getHours() < 18 ? 'chieu' : '') : '';
      spot.innerHTML = '<p class="duty-kicker">' + (isT ? '<span class="duty-pulse" aria-hidden="true"></span>' + 'Hôm nay' : 'Ngày đã chọn') + '</p>' +
        '<p class="duty-date"><b>' + pad(date.getDate()) + '</b><span>' + WD[date.getDay()] + '<br>' + (EN ? MN[date.getMonth()] : MN[date.getMonth()].toLowerCase()) + ' ' + date.getFullYear() + '</span></p>' +
        (weekend && !row.sang && !row.chieu ? '<p class="duty-note">' + 'Cuối tuần — văn phòng Khoa không trực.' + '</p>' :
        SHIFTS.map(function(s){
          var d = row[s.id];
          return '<div class="duty-card' + (s.id === nowShift ? ' is-now' : '') + '"><p class="duty-shift">' + s.full + (d && d.time ? ' · ' + esc(d.time) : '') +
            (s.id === nowShift && d ? '<span class="duty-live">' + 'Đang trực' + '</span>' : '') + '</p>' +
            (d ? '<p class="duty-who"><i class="duty-ava" aria-hidden="true">' + esc(initials(d.person)) + '</i><span><strong>' + esc(d.person) + '</strong>' + (d.role ? '<small>' + esc(d.role) + '</small>' : '') + '</span></p>' +
                 '<ul class="duty-meta">' + (d.room ? '<li>' + 'Phòng ' + esc(d.room) + '</li>' : '') + (d.phone ? '<li><a href="tel:' + esc(d.phone.replace(/\s/g, '')) + '">' + esc(d.phone) + '</a></li>' : '') + (d.note ? '<li>' + esc(d.note) + '</li>' : '') + '</ul>' + statusBadge(d.status)
               : '<p class="duty-empty">' + 'Thông tin đang cập nhật' + '</p>') + '</div>';
        }).join(''));
    }
    function render(){
      var y = view.getFullYear(), m = view.getMonth();
      title.textContent = MN[m] + (EN ? ' ' : ' · ') + y;
      var first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var html = WEEK_SHORT.map(function(d, i){ return '<span class="duty-wd' + (i > 4 ? ' is-we' : '') + '" aria-hidden="true">' + d + '</span>'; }).join('');
      for(var i = 0; i < first; i++) html += '<span class="duty-pad" aria-hidden="true"></span>';
      for(var d = 1; d <= days; d++){
        var k = y + '-' + pad(m + 1) + '-' + pad(d), wd = new Date(y, m, d).getDay(), we = wd === 0 || wd === 6, row = by[k] || {};
        var hit = match(row.sang) || match(row.chieu), dim = q && !hit;
        html += '<button type="button" class="duty-day' + (we ? ' is-we' : '') + (k === tKey ? ' is-today' : '') + (k === selected ? ' is-sel' : '') + (hit ? ' is-hit' : '') + (dim ? ' is-dim' : '') + (k < tKey ? ' is-past' : '') +
          '" data-day="' + k + '" aria-pressed="' + (k === selected) + '"' + (k === tKey ? ' aria-current="date"' : '') + '>' +
          '<span class="visually-hidden">' + WD[wd] + ' </span><span class="duty-n">' + d + '</span><span class="visually-hidden"> ' + (EN ? MN[m] : MN[m].toLowerCase()) + ': </span>' + (we && !row.sang && !row.chieu ? '<span class="duty-off">' + 'Nghỉ' + '</span>' : SHIFTS.map(function(s){ return slot(k, s); }).join('')) + '</button>';
      }
      grid.innerHTML = html;
      renderSpot();
    }
    root.addEventListener('click', function(e){
      var nav = e.target.closest('.cal-nav'), day = e.target.closest('[data-day]');
      if(nav){ view.setMonth(view.getMonth() + (+nav.getAttribute('data-step'))); render(); }
      else if(e.target.closest('.duty-today')){ view = new Date(today.getFullYear(), today.getMonth(), 1); selected = tKey; render(); }
      else if(day){ selected = day.getAttribute('data-day'); render(); var b = grid.querySelector('[data-day="' + selected + '"]'); if(b) b.focus();
        if(window.matchMedia('(max-width:899px)').matches) spot.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'}); }
    });
    grid.addEventListener('keydown', function(e){  // arrow keys move between days
      var step = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7}[e.key];
      if(!step) return;
      var btns = Array.prototype.slice.call(grid.querySelectorAll('[data-day]')), i = btns.indexOf(document.activeElement), t = btns[i + step];
      if(i > -1 && t){ e.preventDefault(); t.focus(); }
    });
    input.addEventListener('input', function(){ q = norm(input.value.trim()); render(); });
    render();
  })();

  // ---------- /su-kien ----------
  (function(){
    var el = document.getElementById('events-list');
    if(!el) return;
    var events = upcoming(window.ULAW_EVENTS, 50);
    el.innerHTML = events.length
      ? '<ul class="event-list">' + events.map(eventRow).join('') + '</ul>'
      : emptyState({title:'Chưa có sự kiện sắp diễn ra', icon:'📅',
          text:'Khoa chưa công bố lịch sự kiện đã xác thực. Sự kiện sẽ xuất hiện tại đây theo thứ tự thời gian, kèm giờ, địa điểm và liên kết đăng ký khi có.',
          actions:[{label:'Xem tin tức', href:'tin-tuc/index.html'}]});
  })();

  // ---------- /tin-tuc listing: search + category filter over the split view ----------
  (function(){
    var box = document.getElementById('news-split');
    if(!box) return;
    var q = document.getElementById('news-search');
    var cat = document.getElementById('news-cat');
    var count = document.getElementById('news-count');
    var all = published(window.ULAW_NEWS);
    function render(){
      var qn = norm(q ? q.value : '');
      var c = cat ? cat.value : 'all';
      var items = all.filter(function(n){
        return (c === 'all' || n.category === c) && (!qn || norm(n.title + ' ' + n.excerpt).indexOf(qn) > -1);
      });
      if(count) count.textContent = nOf('{n} bài viết', items.length);
      var empty = document.getElementById('news-empty');
      if(empty) empty.hidden = items.length > 0 || !all.length;
      box.hidden = !items.length && all.length > 0;
      newsSplit(box, items, true);
    }
    if(q) q.addEventListener('input', render);
    if(cat) cat.addEventListener('change', render);
    render();
  })();

  // ---------- /hoc-lieu: show the library only after ULAW sign-in ----------
  // The official SSO redirects back with ?signed_in=1 (agreed with ULAW IT); the flag lives in sessionStorage
  // for this browser tab. Client-side only — real protection of files must be done server-side by ULAW.
  (function(){
    var locked = document.querySelectorAll('[data-requires-login]');
    if(!locked.length) return;
    var KEY = 'ulaw-signed-in', q = new URLSearchParams(location.search);
    try {
      if(q.get('signed_in') === '1' && window.ULAW_SSO_URL) sessionStorage.setItem(KEY, '1');
      // Local design preview only (never on the public site): ?preview=signed-in on localhost / file://
      var local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      if(local && q.get('preview') === 'signed-in') sessionStorage.setItem(KEY, '1');
      if(q.get('signed_out') === '1') sessionStorage.removeItem(KEY);
    } catch(e){}
    var ok = false;
    try { ok = sessionStorage.getItem(KEY) === '1'; } catch(e){}
    locked.forEach(function(el){ el.hidden = !ok; });
    var gate = document.querySelector('[data-login-gate]');
    if(gate && ok){
      gate.querySelector('.lg-card').innerHTML = '<p class="lg-card-title">Đã đăng nhập</p><p class="lg-status">Bạn đang xem Học liệu bằng tài khoản sinh viên ULAW.</p>' +
        '<a class="btn btn-secondary btn-block" href="?signed_out=1">Đăng xuất</a>';
    }
  })();

  // ---------- /hoc-lieu: SSO login gate ([data-sso-login]) ----------
  // Sends the student to the official ULAW sign-in (ULAW_SSO_URL) with a return URL. No password field here.
  document.querySelectorAll('[data-sso-login]').forEach(function(a){
    var st = document.querySelector('[data-sso-status]'), sso = window.ULAW_SSO_URL;
    if(sso){
      var ret = location.href.split('#')[0];
      a.href = sso + (sso.indexOf('?') > -1 ? '&' : '?') + 'redirect_uri=' + encodeURIComponent(ret);
      a.removeAttribute('aria-disabled');
      if(st) st.textContent = 'Bạn sẽ được chuyển tới trang đăng nhập chính thức của ULAW.';
    } else {
      a.addEventListener('click', function(e){
        e.preventDefault();
        if(st){ st.textContent = 'Hệ thống đăng nhập (SSO) của Trường chưa được kết nối. Vui lòng quay lại sau hoặc liên hệ Khoa.'; st.classList.add('is-alert'); }
      });
    }
  });

  // ---------- /hoc-lieu library ----------
  (function(){
    var app = document.getElementById('library-app');
    if(!app) return;
    var data = published(window.ULAW_RESOURCES);
    var types = window.ULAW_RESOURCE_TYPES || [];
    var typeLabel = {};
    types.forEach(function(t){ typeLabel[t.key] = t.label; });
    var f = {
      q: document.getElementById('lib-q'),
      type: document.getElementById('lib-type'),
      program: document.getElementById('lib-program'),
      cohort: document.getElementById('lib-cohort'),
      semester: document.getElementById('lib-semester'),
      course: document.getElementById('lib-course'),
      version: document.getElementById('lib-version'),
      access: document.getElementById('lib-access'),
    };
    var results = document.getElementById('lib-results');
    var count = document.getElementById('lib-count');

    function fillSelect(sel, values){
      if(!sel) return;
      sel.innerHTML = '<option value="all">Tất cả</option>' + values.map(function(v){
        return '<option value="' + esc(v[0]) + '">' + esc(v[1]) + '</option>';
      }).join('');
    }
    function uniq(key){
      var seen = {}, out = [];
      data.forEach(function(r){ if(r[key] && !seen[r[key]]){ seen[r[key]] = 1; out.push([r[key], r[key]]); } });
      return out;
    }
    fillSelect(f.type, types.map(function(t){ return [t.key, t.label]; }));
    fillSelect(f.program, published(window.ULAW_PROGRAMS).map(function(p){ return [p.slug, p.name]; }));
    fillSelect(f.cohort, uniq('cohort'));
    fillSelect(f.semester, uniq('semester'));
    fillSelect(f.course, uniq('course'));
    fillSelect(f.version, uniq('version'));
    fillSelect(f.access, [['public', 'Công khai'], ['student', 'Dành cho sinh viên']]);

    function signedIn(){ try { return sessionStorage.getItem('ulaw-signed-in') === '1'; } catch(e){ return false; } }
    function card(r){
      var access = r.access === 'public'
        ? '<span class="badge badge-public">Công khai</span>'
        : '<span class="badge badge-student">Dành cho sinh viên</span>';
      var action = r.access === 'public'
        ? (r.file ? '<a class="btn btn-secondary" href="' + esc(url(r.file)) + '">Xem tài liệu</a>' : '<span>Tệp đang cập nhật</span>')
        : (signedIn()
            ? '<span class="lib-open">🔓 Đã mở khóa</span><span>Tệp đang cập nhật</span>'
            : '<span class="lib-locked">🔒 Cần đăng nhập</span><a class="btn btn-primary" href="#dang-nhap">Đăng nhập để xem</a>');
      var meta = [
        ['Loại', typeLabel[r.type]], ['Ngành', r.programName], ['Học phần', r.course], ['Khóa', r.cohort],
        ['Học kỳ', r.semester], ['Phiên bản', r.version], ['Nguồn', r.source],
        ['Cập nhật', r.updatedAt ? fmtDate(r.updatedAt) : 'chưa xác thực'],
      ].filter(function(m){ return m[1]; }).map(function(m){ return '<span>' + m[0] + ': <b>' + esc(m[1]) + '</b></span>'; }).join('');
      return '<li class="resource-card"><div><div class="news-meta">' + access + statusBadge(r.status) + '</div>' +
        '<h3>' + esc(r.title) + '</h3><p class="resource-meta">' + meta + '</p></div>' +
        '<div class="resource-action">' + action + '</div></li>';
    }
    function val(sel){ return sel ? sel.value : 'all'; }
    function render(){
      var qn = norm(f.q ? f.q.value : '');
      var items = data.filter(function(r){
        return (val(f.type) === 'all' || r.type === val(f.type)) &&
          (val(f.program) === 'all' || r.program === val(f.program)) &&
          (val(f.cohort) === 'all' || r.cohort === val(f.cohort)) &&
          (val(f.semester) === 'all' || r.semester === val(f.semester)) &&
          (val(f.course) === 'all' || r.course === val(f.course)) &&
          (val(f.version) === 'all' || r.version === val(f.version)) &&
          (val(f.access) === 'all' || r.access === val(f.access)) &&
          (!qn || norm(r.title + ' ' + r.programName + ' ' + (r.course || '')).indexOf(qn) > -1);
      });
      count.textContent = fill('{shown} / {total} mục học liệu', {shown: items.length, total: data.length});
      results.innerHTML = items.length ? '<ul class="resource-list">' + items.map(card).join('') + '</ul>'
        : emptyState({title:'Không có học liệu phù hợp', icon:'⌕', text:'Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác.'});
    }
    function fromHash(){
      var h = window.location.hash.slice(1);
      if(typeLabel[h] && f.type){ f.type.value = h; render(); }
    }
    Object.keys(f).forEach(function(k){
      if(!f[k]) return;
      f[k].addEventListener(k === 'q' ? 'input' : 'change', render);
    });
    var reset = document.getElementById('lib-reset');
    if(reset) reset.addEventListener('click', function(){
      Object.keys(f).forEach(function(k){ if(f[k]) f[k].value = k === 'q' ? '' : 'all'; });
      render();
    });
    if(f.q) f.q.value = new URLSearchParams(window.location.search).get('q') || '';
    window.addEventListener('hashchange', fromHash);
    render();
    fromHash();
  })();

  upgradeAdmissionsCtas();

  // ---------- arrow links → round orange chevron ----------
  // Replaces a trailing "→" in link text with a decorative round chevron (also for content rendered later).
  var CHEV = '<span class="chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></span>';
  function chevronize(root){
    (root.querySelectorAll ? root : document).querySelectorAll('a.link-arrow, a .link-arrow, a.card-link, a.mobile-all, a .sv-tile-go, a.mega-col-link').forEach(function(a){
      if(a.querySelector('.chev')) return;
      var host = a.lastElementChild && a.lastElementChild.getAttribute('aria-hidden') === 'true' && /→/.test(a.lastElementChild.textContent) ? a.lastElementChild : null;
      if(host){ host.outerHTML = CHEV; }
      else {
        var t = a.lastChild;
        if(!t || t.nodeType !== 3 || !/→\s*$/.test(t.nodeValue)) return;
        t.nodeValue = t.nodeValue.replace(/\s*→\s*$/, '');
        a.insertAdjacentHTML('beforeend', CHEV);
      }
      a.classList.add('has-chev');
    });
  }
  chevronize(document);
  // "Business × Law × Technology": colour every × red (text nodes that mention Law), also in content rendered later.
  function xmarkify(root){
    var base = root.nodeType === 1 ? root : document.body;
    if(base.closest && base.closest('.x-mark, script, style, title')) return;
    var w = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {acceptNode: function(n){
      return /×/.test(n.nodeValue) && /Law/.test(n.parentNode.textContent) && !n.parentNode.closest('.x-mark, script, style, title, textarea, option')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }}), list = [];
    while(w.nextNode()) list.push(w.currentNode);
    list.forEach(function(n){
      var frag = document.createDocumentFragment();
      n.nodeValue.split('×').forEach(function(part, i){
        if(i){ var x = document.createElement('span'); x.className = 'x-mark'; x.setAttribute('aria-hidden', 'true'); x.textContent = '×'; frag.appendChild(x); }
        if(part) frag.appendChild(document.createTextNode(part));
      });
      n.parentNode.replaceChild(frag, n);
    });
  }

  xmarkify(document.body);
  if(window.MutationObserver){
    new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType === 1 && !n.classList.contains('x-mark')){ chevronize(n); xmarkify(n); } }); }); })
      .observe(document.body, {childList:true, subtree:true});
  }
})();
