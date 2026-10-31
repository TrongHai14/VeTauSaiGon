// Hiệu ứng nhẹ bằng GSAP (trang chủ và trang tàu): chữ ảnh bìa hiện dần, các khối trượt nhẹ lên khi cuộn tới.
// Không tải được GSAP, hoặc máy bật "giảm chuyển động": bỏ qua, nội dung vẫn hiện đầy đủ.
(function () {
  if (typeof gsap === 'undefined' || typeof document === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    if (document.querySelector && document.querySelector('.hero-toan-man')) {
      gsap.from('.hero-toan-man .nhan-hero, .hero-toan-man h1, .hero-toan-man p, .hero-toan-man .nut-hero', {
        y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', clearProps: 'all'
      });
    }
  } catch (loi) { return; }

  if (typeof IntersectionObserver !== 'function') return;
  // Chỉ chạy khi khối vào màn hình; không ẩn sẵn nên không có khối nào bị kẹt ở trạng thái ẩn.
  var theoDoi = new IntersectionObserver(function (cacMuc) {
    var thuTu = 0;
    cacMuc.forEach(function (muc) {
      if (!muc.isIntersecting) return;
      theoDoi.unobserve(muc.target);
      try {
        // Tắt transition CSS của thẻ trong lúc chạy để GSAP không bị giật.
        muc.target.style.transition = 'none';
        gsap.from(muc.target, { y: 24, autoAlpha: 0, duration: 0.6, delay: thuTu * 0.08, ease: 'power2.out', clearProps: 'all', onComplete: function () { muc.target.style.transition = ''; } });
      } catch (loi) { /* khối vẫn hiện bình thường */ }
      thuTu++;
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  var khoi = document.querySelectorAll('.the-tau, .muc');
  for (var i = 0; i < khoi.length; i++) theoDoi.observe(khoi[i]);
})();
