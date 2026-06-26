// Track the exact start time of page loading
const loadStartTime = Date.now();

// ========== Ẩn loader khi toàn bộ trang đã tải & tạo bão tuyết ==========
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-wrapper');
    
    // Đảm bảo loader hiển thị ít nhất 1200ms để trải nghiệm mượt mà, tránh nhấp nháy
    const elapsedTime = Date.now() - loadStartTime;
    const remainingTime = Math.max(0, 1200 - elapsedTime);

    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, remainingTime);
    }

    // Tạo hiệu ứng bão tuyết với các mảnh băng nhọn trong hero
    const blizzardContainer = document.querySelector('.blizzard-container');
    if (blizzardContainer) {
        const shardCount = 60;
        for (let i = 0; i < shardCount; i++) {
            const shard = document.createElement('div');
            shard.classList.add('ice-shard-particle');
            
            // Randomize vị trí bắt đầu theo chiều ngang (rộng hơn 100% vì gió bão thổi xéo qua trái)
            shard.style.left = `${Math.random() * 130 - 15}%`;
            shard.style.animationDelay = `${Math.random() * 8}s`;
            shard.style.animationDuration = `${1.5 + Math.random() * 3}s`; // bay rất nhanh (1.5 - 4.5s)
            shard.style.opacity = Math.random() * 0.7 + 0.3;
            
            // Randomize kích thước mảnh băng
            const scale = 0.4 + Math.random() * 1.2;
            shard.style.transform = `scale(${scale})`;
            
            blizzardContainer.appendChild(shard);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // ========== Hamburger menu toggle ==========
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = hamburger.querySelector('i');

    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        if (navMenu.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        } else {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    });

    // ========== Click link trong hamburger list hiện loader & kéo dài thời gian ==========
    const navLinks = document.querySelectorAll('.nav-menu a');
    const loader = document.querySelector('.loader-wrapper');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href) return;

            // Đóng menu khi click vào một link trong menu
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }

            if (loader) {
                e.preventDefault(); // Ngăn chặn nhảy trang ngay lập tức
                
                // Hiển thị lại loader
                loader.classList.remove('hidden');

                // Kiểm tra xem có phải link neo nội bộ không (Smooth scroll)
                const hashIndex = href.indexOf('#');
                if (hashIndex !== -1) {
                    const base = href.substring(0, hashIndex);
                    const hash = href.substring(hashIndex);

                    if (base === '' || base === '/' || base === window.location.pathname) {
                        // Đợi 1000ms để chạy hiệu ứng đóng băng trước khi cuộn
                        setTimeout(() => {
                            const targetId = hash.substring(1);
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                const headerHeight = document.querySelector('header').offsetHeight;
                                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            }
                            // Cuộn xong thì ẩn loader đi (đợi thêm 600ms)
                            setTimeout(() => {
                                loader.classList.add('hidden');
                            }, 600);
                        }, 1000);
                        return;
                    }
                }

                // Link chuyển trang thật sự: Đợi 1200ms rồi mới chuyển trang
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = href;
                }, 1200);
            }
        });
    });

    // ========== Smooth scroll cho các anchor links KHÔNG nằm trong hamburger menu ==========
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (e.defaultPrevented) return; // Bỏ qua nếu đã được xử lý bởi hamburger list

            const href = this.getAttribute('href');
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const base = href.substring(0, hashIndex);
            const hash = href.substring(hashIndex);

            if (base === '' || base === '/' || base === window.location.pathname) {
                e.preventDefault();
                const targetId = hash.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ========== Page transition (fade-out) cho link thường ngoài menu ==========
    document.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;

        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#')) return;

        if (href.includes('#')) {
            const parts = href.split('#');
            const basePath = parts[0] === '' ? '/' : parts[0];
            if (basePath === window.location.pathname || basePath === '/') {
                return;
            }
        }

        if (link.origin === window.location.origin && !link.target) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });

    // ========== Hiệu ứng mưa hình tròn băng (Ice Circle Rain) khi cuộn chuột xuống ==========
    let lastScrollTop = 0;
    const iceContainer = document.getElementById('ice-rain-container');
    
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Chỉ kích hoạt hiệu ứng khi cuộn xuống dưới
        if (scrollTop > lastScrollTop) {
            // Giới hạn tỷ lệ sinh để tránh giật lag (chỉ sinh ngẫu nhiên khoảng 30% số lần sự kiện cuộn kích hoạt)
            if (Math.random() < 0.35) {
                createIceCircle();
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    function createIceCircle() {
        if (!iceContainer) return;

        // Giới hạn tối đa 35 hạt trên màn hình cùng một lúc để tối ưu hóa hiệu năng
        if (iceContainer.childElementCount > 35) return;

        const circle = document.createElement('div');
        circle.classList.add('ice-circle');

        // Ngẫu nhiên kích thước (8px - 28px)
        const size = Math.floor(Math.random() * 20) + 8;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;

        // Ngẫu nhiên vị trí bắt đầu theo chiều ngang
        circle.style.left = `${Math.random() * 100}vw`;

        // Ngẫu nhiên thời gian rơi (1.5s - 3.5s)
        const duration = 1.5 + Math.random() * 2;
        circle.style.animationDuration = `${duration}s`;

        // Ngẫu nhiên độ mờ và hiệu ứng blur
        circle.style.opacity = Math.random() * 0.6 + 0.2;
        const blurValue = Math.random() * 4 + 1;
        circle.style.filter = `blur(${blurValue}px) drop-shadow(0 0 8px rgba(0, 242, 255, 0.4))`;

        iceContainer.appendChild(circle);

        // Tự động giải phóng bộ nhớ khi hạt rơi xong
        setTimeout(() => {
            circle.remove();
        }, duration * 1000);
    }
});