# 오설록 삼다 꿀배 티 프로모션 웹페이지 (교육용 가상 프로젝트)

## 실행
index.html 을 브라우저로 열면 됩니다. (인터넷 연결 시 웹폰트·원격 이미지 사용)

## 구조
- index.html : 마크업. "★ 수정:" 주석이 자주 바꾸는 곳
- css/style.css : 목차 0~14. 색상·폰트·모션 속도는 맨 위 `:root` 변수
- js/main.js : 목차 0~14. 링크/레시피/슬라이더 간격은 `CONFIG`, `RECIPES`
- images/ : 로컬 대체 이미지(SVG). 실제 이미지로 교체
- videos/ : brand-film.mp4(제주 풀스크린), ad-15s.mp4(15초 광고)를 넣으면 재생. ad-15s.mp4 는 가로/세로 비율을 자동 감지해 맞춤

## 이미지/영상 교체
`<img src="…" data-fallback="images/…">` 에서 src 만 바꾸세요. 원격 이미지가 안 뜨면 data-fallback 이 표시됩니다.
제품 패키지는 images/product-package.svg 를 실제 패키지 이미지(비율·로고 그대로)로 교체하세요.
이미지 출처: Unsplash 사진 2점(창가 햇살, 차 따르기)을 링크로 사용 — 사용 전 라이선스를 확인하세요.

## 폰트
KoPubWorld Batang 은 CDN이 없어 Noto Serif KR 로 대체. 설치형 폰트를 쓰려면 @font-face 를 css 에 추가하세요.

## 티 레시피 섹션 (통합 수정본)
- 좌: 15초 세로형(9:16) 영상 1개 + 영상 정보 / 우: ENJOY YOUR TEA 제목 + 카드 3개(HOT TEA · ICE TEA · SPARKLING ADE)
- 영상 열 폭은 css `.recipe{--video-col}`, 카드 높이는 `--rcard-h` 한 곳에서 조절 (카드 3개는 같은 규격)
- 카드 클릭 → 레시피 팝업 1개를 공유 (내용은 js `RECIPES` 의 hot / ice / sparkling, 카드의 `data-recipe` 와 키가 같아야 함)
- 900px 이하: 영상이 먼저, 카드 3개는 그 아래 세로 배치
- 기존의 카드 아래 별도 링크("+ 삼다 꿀배 스파클링 에이드 레시피 →")는 삭제되고 세 번째 카드로 대체됨

## 구매·선물·SNS 버튼
- 교육용 가상 프로젝트이므로 기본은 시연용입니다(클릭 시 안내 문구만 표시, 외부 이동 없음).
- 실제 주소를 쓰려면 js `CONFIG.links` 에 주소를 넣으세요. SNS 는 index.html 의 `data-demo` 를 지우고 href 를 바꾸세요.

## 통합 디자인 시스템
- css `:root` 의 `--sec-pad`(섹션 여백) `--h2-size`(섹션 제목) `--r-lg`(모서리) `--shadow-*`(그림자) 로 전 섹션이 같은 규격을 사용합니다.

## HERO
- HERO 영역(HTML / CSS 4번 블록 / JS 4번 블록)은 원본과 한 글자도 바꾸지 않았습니다.
