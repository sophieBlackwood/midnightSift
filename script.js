document.addEventListener("DOMContentLoaded", () => {
    // 1. SELECT ELEMENTS
    const featuredList = document.getElementById("featured-list");
    const allEl = document.getElementById("all-poems");
    const emailGrid = document.getElementById("all-emails");
    const squirrelingGrid = document.getElementById("all-squirreling");
    const searchInput = document.getElementById("search") || document.getElementById("search-emails") || document.getElementById("search-squirreling");
    const authorBlurb = document.getElementById("author-blurb");
    const mainHero = document.querySelector('.fullscreen-hero');
    const poemHero = document.querySelector('.poem-hero-visual');
    const squirrelingBtn = document.getElementById('squirreling-btn');

    // 2. BACKGROUND HERO LOGIC
    const poemImages = [
        'hero2.jpg', 'hero3.jpg', 'hero4.jpg', 'hero5.jpg', 'hero6.jpg',
        'hero7.jpg', 'hero8.jpg', 'hero9.jpg', 'hero10.jpg', 'hero11.jpg',
        'hero12.jpg', 'hero13.jpg', 'hero14.jpg', 'hero15.jpg', 'hero16.jpg',
        'hero17.jpg', 'hero18.jpg', 'hero19.jpg'
    ];

    const getImagePath = (fileName) => `assets/hero_images/${fileName}`;

    if (mainHero) {
        mainHero.style.backgroundImage = `url('${getImagePath('hero.jpg')}')`;
        mainHero.style.backgroundSize = 'cover';
        mainHero.style.backgroundPosition = 'center';
    } 
    
    if (poemHero) {
        const randomImg = poemImages[Math.floor(Math.random() * poemImages.length)];
        poemHero.style.backgroundImage = `url('${getImagePath(randomImg)}')`;
        poemHero.style.backgroundSize = 'cover';
        poemHero.style.backgroundPosition = 'center';
    }

    // 3. CARD GENERATORS
    function createPoemCard(p) {
        const el = document.createElement("div");
        el.className = "blog-card"; 
        const displayText = p.description || (p.content ? p.content.substring(0, 120) + "..." : "");

        el.innerHTML = `
            <div class="blog-card-inner">
                <span class="date" style="color: var(--accent, #8b5cf6); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${p.date || ''}</span>
                <h4>${p.title || 'Untitled'}</h4>
                <p>${displayText}</p>
                <a href="./poem.html?id=${p.id}" class="link" style="margin-top: 1rem; display: block; color: var(--accent, #8b5cf6);">Read more →</a>
            </div>
        `;
        
        el.onclick = () => { window.location.href = `./poem.html?id=${p.id}`; };
        return el;
    }

    function createStandardCard(item) {
        const card = document.createElement('div');
        card.classList.add('card'); 
        card.innerHTML = `
            <span class="date" style="color: var(--accent, #8b5cf6); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${item.date || ''}</span>
            <h2>${item.title || 'Untitled'}</h2>
            <p>${item.preview || (item.content ? item.content.substring(0, 120) + "..." : "")}</p>
        `;
        return card;
    }

    // 4. PASSWORD LOCK LOGIC (FIXED)
    const correctPassword = "brooklyn"; 

    if (squirrelingGrid) {
        if (sessionStorage.getItem('squirreling_unlocked') !== 'true') {
            const userInput = prompt("Enter password to access Squirreling:");
            if (userInput === correctPassword) {
                sessionStorage.setItem('squirreling_unlocked', 'true');
            } else {
                alert("Incorrect password!");
                window.location.href = "index.html";
                return; // Stop running remaining scripts if access denied
            }
        }
    }

    if (squirrelingBtn) {
        squirrelingBtn.addEventListener('click', function(e) {
            e.preventDefault(); 

            if (sessionStorage.getItem('squirreling_unlocked') === 'true') {
                window.location.href = "squirreling.html";
            } else {
                const userInput = prompt("Enter password to access Squirreling:");
                if (userInput === correctPassword) {
                    sessionStorage.setItem('squirreling_unlocked', 'true');
                    window.location.href = "squirreling.html";
                } else if (userInput !== null) {
                    alert("Incorrect password!");
                }
            }
        });
    }

    // 5. CAROUSEL INITIALIZATION
    function initCarousel() {
        const blogTrack = document.querySelector(".blog-card-grid");
        const blogPrev = document.querySelector(".blog-carousel-btn.prev");
        const blogNext = document.querySelector(".blog-carousel-btn.next");
        const blogCards = Array.from(document.querySelectorAll(".blog-card"));

        if (blogTrack && blogCards.length > 0) {
            const trackStyle = getComputedStyle(blogTrack);
            const gap = parseFloat(trackStyle.gap) || 0;
            const transitionDuration = parseFloat(trackStyle.transitionDuration) * 1000 || 500; 
            const total = blogCards.length;

            blogCards.forEach(card => blogTrack.appendChild(card.cloneNode(true)));

            let index = 0;
            let isTransitioning = false;

            const updateCarousel = (animate = true) => {
                if (isTransitioning && animate) return; 
                isTransitioning = animate;

                const cardWidth = blogCards[0].offsetWidth;
                const offset = index * (cardWidth + gap);

                blogTrack.style.transition = animate ? `transform ${transitionDuration / 1000}s ease` : "none";
                blogTrack.style.transform = `translateX(${-offset}px)`;

                if (animate) {
                    setTimeout(() => (isTransitioning = false), transitionDuration);
                } else {
                    isTransitioning = false;
                }
            };

            const jumpToStart = () => {
                index = 0;
                updateCarousel(false);
            };

            const next = () => {
                if (isTransitioning) return; 
                index++;
                updateCarousel();
                if (index >= total) {
                    setTimeout(jumpToStart, transitionDuration + 10);
                }
            };

            const prev = () => {
                if (isTransitioning) return;
                if (index === 0) {
                    index = total;
                    updateCarousel(false);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            index--;
                            updateCarousel();
                        }, 10);
                    });
                } else {
                    index--;
                    updateCarousel();
                }
            };

            blogNext?.addEventListener("click", next);
            blogPrev?.addEventListener("click", prev);

            updateCarousel(false); 
        }
    }

    // 6. HOME PAGE FEATURED
    if (featuredList && typeof poems !== 'undefined') {
        featuredList.innerHTML = "";
        poems.filter(p => p.featured).forEach(p => featuredList.appendChild(createPoemCard(p)));
        initCarousel();
    }

    if (authorBlurb && typeof author !== 'undefined') {
        authorBlurb.textContent = author.blurb;
    }

    // 7. MULTI-PAGE GRID RENDERER (FIXED TARGET RESOLUTION)
    const renderSection = (container, data, isPoem = false) => {
        if (!container || !data) return;

        let currentSort = 'newest';

        const render = () => {
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
            
            let list = data.filter(item => {
                const titleMatch = item.title && item.title.toLowerCase().includes(query);
                const tagMatch = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
                const textSnippet = item.preview || item.content || "";
                const textMatch = textSnippet.toLowerCase().includes(query);

                return titleMatch || tagMatch || textMatch;
            });

            if (currentSort === 'newest') {
                list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            } else if (currentSort === 'oldest') {
                list.sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime());
            } else if (currentSort === 'az') {
                list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            } else if (currentSort === 'za') {
                list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            }

            container.innerHTML = "";
            list.forEach(item => {
                const card = isPoem ? createPoemCard(item) : createStandardCard(item);
                container.appendChild(card);
            });
        };

        if (searchInput) {
            searchInput.addEventListener("input", render);
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSort = btn.getAttribute('data-sort');
                render();
            });
        });

        render();
    };

    // Explicitly render each grid independently to ensure none are skipped
    if (allEl && typeof poems !== 'undefined') renderSection(allEl, poems, true);
    if (emailGrid && typeof emailsData !== 'undefined') renderSection(emailGrid, emailsData, false);
    if (squirrelingGrid && typeof squirrelingData !== 'undefined') renderSection(squirrelingGrid, squirrelingData, false);
});
