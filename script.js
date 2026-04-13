// Função principal do Carrossel
function initCarousel(containerSelector) {
    const carouselWrapper = document.querySelector(containerSelector);
    if (!carouselWrapper) return;

    const carousel = carouselWrapper.querySelector('.carousel-track') || carouselWrapper.querySelector('.snacks-carousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.snack-card, .plan-card, .value-card, .carousel-item');
    const totalSlides = cards.length;
    if (!totalSlides) return;

    const prevBtn = carouselWrapper.querySelector('.carousel-btn-prev');
    const nextBtn = carouselWrapper.querySelector('.carousel-btn-next');
    const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

    let currentSlide = 0; // Variável local para evitar conflitos
    let autoplayId = null;

    carousel.classList.add('is-carousel');

    // 1. Criar pontos de navegação
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => { currentSlide = i; updateCarousel(); resetAutoplay(); });
            dotsContainer.appendChild(dot);
        }
    }

    const getGap = () => {
        const style = getComputedStyle(carousel);
        const gapValue = style.columnGap || style.gap || '0';
        return parseFloat(gapValue) || 0;
    };

    const getCarouselMetrics = () => {
        const cardWidth = cards[0].offsetWidth + getGap(); // Largura + Gap
        const visibleCards = Math.max(1, Math.round(carouselWrapper.offsetWidth / cardWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCards);
        return { cardWidth, maxIndex };
    };

    // 2. Lógica de Movimentação e Limite (Fix do Espaço Branco)
    function updateCarousel() {
        const { cardWidth, maxIndex } = getCarouselMetrics();

        // Ajuste de segurança: se o slide ultrapassar o limite visual, trava no máximo
        if (currentSlide > maxIndex) currentSlide = maxIndex;

        carousel.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

        // Atualizar Dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
        }
    }

    // 3. Funções de Avanço e Recuo (Loop Infinito)
    function nextSlide() {
        const { maxIndex } = getCarouselMetrics();

        // Se chegar no limite de exibição, volta ao início (0)
        currentSlide = (currentSlide >= maxIndex) ? 0 : currentSlide + 1;
        updateCarousel();
    }

    function prevSlide() {
        const { maxIndex } = getCarouselMetrics();
        currentSlide = (currentSlide > 0) ? currentSlide - 1 : maxIndex;
        updateCarousel();
    }

    // 4. Autoplay (Girar Sozinho)
    const startAutoplay = () => {
        stopAutoplay();
        autoplayId = setInterval(nextSlide, 3000);
    };

    const stopAutoplay = () => {
        if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    };

    const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };

    // Listeners
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    window.addEventListener('resize', updateCarousel);
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);

    updateCarousel();
    startAutoplay();
}

// Inicialização Global
document.addEventListener('DOMContentLoaded', () => {
    initCarousel('.snacks-carousel-wrapper');
    initCarousel('.plans-wrapper');
    initCarousel('.values-wrapper');
    // Fallback de imagens (mantido do original)
    document.querySelectorAll('.snack-card-img img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
            if (img.dataset.fallback) { img.src = img.dataset.fallback; img.removeAttribute('data-fallback'); }
        }, { once: true });
    });
});
