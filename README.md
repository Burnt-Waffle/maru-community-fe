# 🏠 대청마루 (Daechungmaru) - Frontend

> **당신의 이야기가 머무는 곳, 대청마루**
> 커뮤니티 서비스의 프론트엔드 프로젝트입니다.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-24.0.5-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CodeDeploy-232F3E?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/)

## 📖 프로젝트 소개

**대청마루**는 사용자들이 자유롭게 게시글을 작성하고 소통할 수 있는 커뮤니티 플랫폼입니다.
이 프론트엔드 프로젝트는 **Vanilla JavaScript (ES Modules)** 기반으로 작성되었으며, **Express.js**를 사용하여 정적 파일을 서빙하는 구조로 설계되었습니다.

프레임워크에 의존하지 않고 웹 표준 기술(HTML, CSS, JS)을 활용하여 기본기에 충실하며, 대규모 트래픽 상황에서도 가볍고 빠르게 동작할 수 있도록 최적화하는 것을 목표로 하고 있습니다.

## 🛠 기술 스택 (Tech Stack)

* **Runtime:** Node.js v22 (Alpine Linux based Docker image)
* **Web Server:** Express.js v5.1.0 (Static File Serving)
* **Language:** JavaScript (ES6+ Modules), HTML5, CSS3
* **Infrastructure:** Docker, Docker Compose
* **CI/CD:** GitHub Actions, AWS CodeDeploy, AWS S3

## ✨ 주요 기능 (Key Features)

### 1. 사용자 인증 & 보안 (Authentication & Security)
* **회원가입/로그인:** JWT 기반 인증, 클라이언트 측 유효성 검사 (`validation.js`).
* **Silent Refresh:** 액세스 토큰 만료 시 사용자 개입 없이 백그라운드에서 토큰을 자동 갱신하여 끊김 없는 사용자 경험 제공 (`silentRefresh.js`).
* **약관 동의:** 서비스 이용을 위한 필수 약관 동의 및 상세 조회 기능.

### 2. 게시판 (Board)
* **무한 스크롤 (Infinite Scroll):** `IntersectionObserver`를 활용하여 게시글 목록을 효율적으로 로딩.
* **게시글 작성/수정:** 텍스트 및 다중 이미지 업로드 지원.
* **이미지 업로드:** AWS Lambda와 Presigned URL을 활용한 Direct S3 Upload 방식으로 서버 부하 분산 (`imageFile.js`).

### 3. 댓글 (Comment)
* **CRUD:** 댓글 작성, 조회, 수정, 삭제 기능 완비.
* **페이징:** '더보기' 버튼을 통한 댓글 페이징 처리.

### 4. 사용자 관리 (User Management)
* **프로필 관리:** 닉네임 변경 및 프로필 이미지 수정.
* **계정 설정:** 비밀번호 변경 및 회원 탈퇴 기능.

### 5. UI/UX
* **인터랙티브 요소:** 커스텀 모달(Confirm/Info), 토스트 알림(Toast Notification), 드롭다운 메뉴 구현.

## 🔄 CI/CD 파이프라인

GitHub Actions와 AWS CodeDeploy를 통해 자동화된 배포 파이프라인을 구축했습니다.
1. **Push to `develop`**: 코드가 develop 브랜치에 푸시되면 워크플로우가 트리거됩니다.
2. **Test**: Node.js 환경에서 단위 테스트(`npm test`)를 수행합니다.
3. **Build & Push**: Docker 이미지를 빌드하여 Docker Hub에 푸시합니다.
4. **Deploy**: 배포 스크립트와 설정 파일을 AWS S3로 전송하고, AWS CodeDeploy를 트리거하여 EC2 인스턴스에 배포합니다.
