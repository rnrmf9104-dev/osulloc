/* ============================================================
   오설록 삼다 꿀배 티 프로모션 - main.js
   ------------------------------------------------------------
   [목차]
   0. CONFIG / RECIPES   ← 링크·레시피 내용은 여기서 수정
   1. 유틸
   2. 이미지 대체(fallback)
   3. GNB: 고정/반투명/현재 섹션 강조/부드러운 스크롤/모바일 메뉴
   4. HERO 인트로 (세션 1회)
   5. 스크롤 등장(reveal)
   6. 패럴랙스
   7. 원재료 카드 (모바일 탭)
   8. HOT / ICE 탭
   9. 레시피 모달
  10. 15초 영상 재생
  11. 라이프스타일 슬라이더
  12. FAQ 아코디언
  13. 플로팅 CTA
  14. 구매 링크 적용
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. 설정 ---------- */
  // ★ 수정: 구매/선물 버튼 링크 (index.html 의 data-link="buy" / "gift" 에 적용됨)
  //   교육용 가상 프로젝트이므로 기본은 빈 값('') = 시연용 안내 문구만 표시됩니다.
  //   실제 주소를 넣으면(예: 'https://...') 새 탭으로 연결됩니다.
  var CONFIG = {
    links: {
      buy:  '',   // [나를 위해 구매하기]
      gift: ''    // [선물하기]
    },
    demoMessage: '교육용 가상 프로젝트입니다. 이 버튼은 시연용으로, 실제 구매·연결 기능은 제공되지 않아요.',
    floatShowAfter: 600,        // ★ 수정: 이 값(px) 이상 스크롤하면 플로팅 [선물하기] 표시
    sliderInterval: 3000,       // ★ 수정: 슬라이더 자동 전환 간격(ms) — 3초, 0 이면 자동 전환 끔
    parallaxMobile: false       // 모바일에서도 패럴랙스를 쓸지 여부 (성능상 기본 끔)
  };

  // ★ 수정: 레시피 팝업 내용 (index.html 카드의 data-recipe 값과 키가 같아야 함)
  var RECIPES = {
    hot: {
      title: '따뜻한 꿀배 티',
      ing: ['삼다 꿀배 티 티백 1개', '뜨거운 물(85~90℃) 200ml'],
      steps: ['잔을 따뜻한 물로 한 번 데웁니다.', '티백을 넣고 뜨거운 물을 부어요.', '2~3분 우린 뒤 티백을 건져 냅니다.', '취향에 따라 꿀을 한 스푼 더해 보세요.']
    },
    ice: {
      title: '꿀배 아이스 티',
      ing: ['삼다 꿀배 티 티백 2개', '뜨거운 물 100ml', '얼음 한 잔 가득', '차가운 물 100ml'],
      steps: ['티백 2개를 뜨거운 물 100ml에 3분간 진하게 우립니다.', '티백을 건져 낸 뒤 차가운 물을 섞어요.', '얼음을 가득 채운 잔에 천천히 붓습니다.', '배 슬라이스로 장식하면 완성!']
    },
    sparkling: {
      title: '꿀배 스파클링 에이드',
      ing: ['삼다 꿀배 티 티백 2개', '뜨거운 물 80ml', '탄산수 150ml', '얼음, 레몬 슬라이스'],
      steps: ['티백을 뜨거운 물 80ml에 3분 우려 농축 티를 만듭니다.', '충분히 식혀 얼음 가득한 잔에 붓습니다.', '탄산수를 천천히 따라 섞이지 않게 층을 만들어요.', '레몬 슬라이스를 올려 마무리합니다.']
    }
  };

  /* ---------- 1. 유틸 ---------- */
  var $  = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.innerWidth <= 768; };
  var gnbH = function () { return $('#gnb').offsetHeight; };

  // 짧은 안내 메시지(토스트)
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-show'); }, 3200);
  }

  // 스크롤 이벤트를 프레임당 1회로 제한 (성능)
  var ticking = false, scrollFns = [];
  function onScroll(fn) { scrollFns.push(fn); }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      scrollFns.forEach(function (f) { f(); });
      ticking = false;
    });
  }, { passive: true });

  /* ---------- 2. 이미지 대체 ----------
     <img src="원격URL" data-fallback="images/xxx.svg"> 형태에서
     원격 이미지 로딩 실패 시 data-fallback 으로 자동 교체합니다. */
  $$('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      var fb = img.getAttribute('data-fallback');
      if (fb && img.getAttribute('src') !== fb) img.src = fb;
    });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error')); // 이미 실패한 경우
  });

  /* ---------- 3. GNB ---------- */
  var gnb = $('#gnb'), nav = $('#gnbNav'), toggle = $('#gnbToggle');

  // 스크롤 시 반투명 배경
  function gnbState() { gnb.classList.toggle('is-scrolled', window.scrollY > 20); }
  onScroll(gnbState); gnbState();

  // 모바일 햄버거 메뉴
  function closeMenu() {
    nav.classList.remove('is-open'); gnb.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); gnb.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // 부드러운 스크롤 (고정 헤더 높이만큼 보정)
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (id === '#hero' ? 0 : gnbH() - 1);
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      closeMenu();
    });
  });

  // 현재 보고 있는 섹션의 메뉴 강조
  var menuLinks = $$('.gnb__nav a');
  var sections = menuLinks.map(function (a) { return $(a.getAttribute('href')); });
  function highlightMenu() {
    var y = window.scrollY + gnbH() + window.innerHeight * 0.25, cur = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    menuLinks.forEach(function (a, i) { a.classList.toggle('is-current', i === cur); });
  }
  onScroll(highlightMenu); highlightMenu();

  /* ---------- 4. HERO 인트로 (최초 1회) ----------
     sessionStorage 에 기록하여 같은 탭에서는 다시 재생하지 않습니다.
     (storage 가 막힌 환경에서도 오류 없이 동작) */
  var hero = $('#hero');
  var played = false;
  try { played = sessionStorage.getItem('heroPlayed') === '1'; } catch (e) {}
  if (!played && !reduceMotion) {
    hero.classList.add('is-intro');
    try { sessionStorage.setItem('heroPlayed', '1'); } catch (e) {}
    // 안전장치: 인트로가 끝나면(5.5초) 클래스를 제거해 기본 노출 상태로 고정
    setTimeout(function () { hero.classList.remove('is-intro'); }, 5500);
  }
  // 재방문/움직임 최소화: 바로 보이는 상태 (CSS 기본값)

  /* ---------- 5. 스크롤 등장 ----------
     .reveal 요소가 화면에 들어오면 .is-in 추가.
     data-delay="0.3" → 0.3초 뒤 등장 (순차 등장 간격 0.2~0.4s 권장) */
  document.documentElement.classList.add('js-ready');
  var revealEls = $$('.reveal');
  revealEls.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d + 's');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); }); // 구형 브라우저 대비
  }

  /* ---------- 6. 패럴랙스 ----------
     data-parallax="0.15" : 값이 클수록 많이 움직임 (0.1~0.2 권장)
     비주얼 안의 img/video 를 스크롤에 따라 위아래로 미세 이동 */
  var parallaxEls = $$('[data-parallax]');
  function parallax() {
    if (reduceMotion || (isMobile() && !CONFIG.parallaxMobile)) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (box) {
      var r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;                // 화면 밖은 계산 생략
      var speed = parseFloat(box.getAttribute('data-parallax')) || 0.15;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;  // 화면 중앙 기준 거리
      $$('.fullvisual__img,.fullvisual__video', box).forEach(function (m) {
        m.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    });
  }
  onScroll(parallax); parallax();
  window.addEventListener('resize', function () {
    if (isMobile()) $$('.fullvisual__img,.fullvisual__video').forEach(function (m) { m.style.transform = ''; });
    else parallax();
  });

  // 영상 재생이 실패하면(파일 없음 등) 뒤에 있는 대표 이미지가 그대로 보이도록 영상 숨김
  var bgVideo = $('.fullvisual__video');
  if (bgVideo) {
    var src = bgVideo.querySelector('source');
    if (src) src.addEventListener('error', function () { bgVideo.style.display = 'none'; });
  }

  /* ---------- 7. 원재료 카드 ----------
     PC: CSS :hover 로 확대/설명 표시 / 모바일(터치): 탭하면 설명 토글 */
  var ings = $$('.ing');
  ings.forEach(function (card) {
    card.addEventListener('click', function () {
      var open = !card.classList.contains('is-open');
      ings.forEach(function (c) { c.classList.remove('is-open'); });
      card.classList.toggle('is-open', open);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  /* ---------- 8. 레시피 카드 3개 (HOT / ICE / SPARKLING) ----------
     기존의 HOT/ICE 탭 전환은 우측 카드로 통합됨 (카드 클릭 → 9번 모달, 모달은 1개만 사용) */

  /* ---------- 9. 레시피 모달 ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal(key) {
    var r = RECIPES[key]; if (!r) return;
    $('#modalTitle').textContent = r.title;
    $('#modalIng').innerHTML = r.ing.map(function (i) { return '<li>' + i + '</li>'; }).join('');
    $('#modalSteps').innerHTML = r.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';     // 배경 스크롤 잠금
    $('.modal__close', modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-recipe]').forEach(function (c) {   // HOT / ICE / SPARKLING 카드 3개가 같은 모달 1개를 사용
    var key = c.getAttribute('data-recipe');
    if (!RECIPES[key]) console.warn('[레시피] data-recipe="' + key + '" 에 해당하는 RECIPES 항목이 없습니다.');  // 키 오타 점검용
    c.addEventListener('click', function () { openModal(key); });
  });
  modal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- 10. 15초 영상 ----------
     - 재생 버튼 클릭 → 영상 재생 (파일 경로: videos/ad-15s.mp4)
     - 영상의 실제 가로·세로 비율을 읽어 프레임에 적용 → 어떤 비율이든 잘리거나 늘어나지 않음 (CSS 변수 --vr)
     - 영상 영역(.showcase__stage)은 9:16 고정, 가로형 영상이 들어오면 영상 프레임이 그 안에서 비율대로 줄어듦
     - 영상 파일이 없을 때의 안내(토스트)는 "재생 버튼을 눌렀을 때만" 표시 */
  var ad = $('#adVideo'), playBtn = $('#playBtn'), frame = $('#shorts'), showcase = $('.showcase');
  var adFailed = false;
  ad.removeAttribute('controls');
  function fitVideo() {
    if (!ad.videoWidth || !ad.videoHeight) return;
    frame.style.setProperty('--vr', ad.videoWidth + ' / ' + ad.videoHeight);
    showcase.classList.toggle('is-vertical', ad.videoHeight > ad.videoWidth);
  }
  ad.addEventListener('loadedmetadata', fitVideo);
  if (ad.readyState >= 1) fitVideo();
  ad.addEventListener('error', function () { adFailed = true; }, true);   // <source> 로딩 실패 기록 (토스트는 아직 띄우지 않음)
  var NO_VIDEO = '영상 파일(videos/ad-15s.mp4)을 추가하면 재생됩니다.';
  playBtn.addEventListener('click', function () {
    // 파일이 없으면 networkState 가 3(NETWORK_NO_SOURCE)이며 play() 가 대기 상태로 남으므로 직접 확인
    if (adFailed || ad.error || ad.networkState === 3) { toast(NO_VIDEO); return; }
    var p = ad.play();
    if (p && p.then) {
      p.then(function () { frame.classList.add('is-playing'); ad.setAttribute('controls', ''); })
       .catch(function () { toast(NO_VIDEO); });
      // 안전장치: 1.5초가 지나도 재생이 시작되지 않고 데이터가 없으면 안내
      setTimeout(function () { if (ad.readyState === 0 && ad.paused) toast(NO_VIDEO); }, 1500);
    }
  });
  ad.addEventListener('ended', function () { frame.classList.remove('is-playing'); ad.removeAttribute('controls'); ad.load(); });

  /* ---------- 11. 슬라이더 ----------
     버튼/점/키보드/터치 스와이프/자동 전환(마우스 올리면 일시정지) 지원 */
  (function () {
    var root = $('#slider'); if (!root) return;
    var track = $('.slider__track', root), slides = $$('.slide', root), dotsBox = $('.slider__dots', root);
    var idx = 0, timer = null, hovering = false;
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', (i + 1) + '번째 장면');
      b.addEventListener('click', function () { manual(i); });
      dotsBox.appendChild(b); return b;
    });
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === idx); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
    }
    // 자동 재생: 3초마다 다음 장면 (마지막 → 처음으로 반복)
    // - 마우스가 슬라이더 위에 있는 동안, 또는 탭이 보이지 않을 때는 잠시 멈춤
    // - 화살표/점 클릭 시에는 멈춤을 풀고 3초 타이머를 새로 시작 (마우스가 올려져 있어도 계속 재생)
    function restart() {
      clearInterval(timer);
      if (CONFIG.sliderInterval) timer = setInterval(function () {
        if (hovering || document.hidden) return;
        go(idx + 1);
      }, CONFIG.sliderInterval);
    }
    function manual(i) { hovering = false; go(i); restart(); }
    $('.slider__btn--prev', root).addEventListener('click', function () { manual(idx - 1); });
    $('.slider__btn--next', root).addEventListener('click', function () { manual(idx + 1); });
    root.addEventListener('mouseenter', function () { hovering = true; });
    root.addEventListener('mouseleave', function () { hovering = false; restart(); });
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { go(idx - 1); restart(); }
      if (e.key === 'ArrowRight') { go(idx + 1); restart(); }
    });
    // 터치 스와이프
    var sx = 0, sy = 0;
    root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    go(0); restart();
  })();

  /* ---------- 12. FAQ 아코디언 ----------
     높이(height)를 실제 내용 높이로 계산해 부드럽게 펼침/접힘 */
  $$('.faq__q').forEach(function (q) {
    var a = q.nextElementSibling;
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      a.style.height = open ? '0px' : a.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {   // 창 크기 변경 시 열린 항목 높이 재계산
    $$('.faq__q[aria-expanded="true"]').forEach(function (q) { q.nextElementSibling.style.height = q.nextElementSibling.scrollHeight + 'px'; });
  });

  /* ---------- 13. 플로팅 CTA ---------- */
  var floatCta = $('#floatCta'), giftSec = $('#gift');
  function floatState() {
    var pastHero = window.scrollY > CONFIG.floatShowAfter;
    var atGift = giftSec.getBoundingClientRect().top < window.innerHeight * 0.6; // 선물하기 섹션에서는 숨김(중복 방지)
    floatCta.classList.toggle('is-show', pastHero && !atGift);
  }
  onScroll(floatState); floatState();

  /* ---------- 14. 구매 링크 적용 / 시연용 버튼 ----------
     - CONFIG.links 에 주소가 있으면: 그 주소로 새 탭 연결
     - 비어 있으면: 이동하지 않고 시연용 안내(토스트)만 표시 (빈 페이지·잘못된 주소로 이동 방지)
     - data-demo 속성이 있는 링크(구매·선물·SNS)가 시연용 대상 */
  $$('[data-link]').forEach(function (a) {
    var url = CONFIG.links[a.getAttribute('data-link')];
    if (url) {
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      a.removeAttribute('data-demo');
    }
  });
  $$('[data-demo]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      toast(CONFIG.demoMessage);
    });
  });
})();
