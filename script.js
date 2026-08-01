document.addEventListener("DOMContentLoaded", () => {
    // 1. SELECT ELEMENTS
    const featuredList = document.getElementById("featured-list");
    const allEl = document.getElementById("all-poems");
    const searchInput = document.getElementById("search") || document.getElementById("search-emails");
    const authorBlurb = document.getElementById("author-blurb");
    const mainHero = document.querySelector('.fullscreen-hero');
    const emailGrid = document.getElementById('all-emails');
    const squirrelingBtn = document.getElementById('squirreling-btn');

    // 2. BACKGROUND LOGIC (Updated to assets/hero_images/)
    const poemImages = [
        'hero2.jpg', 'hero3.jpg', 'hero4.jpg', 'hero5.jpg', 'hero6.jpg',
        'hero7.jpg', 'hero8.jpg', 'hero9.jpg', 'hero10.jpg', 'hero11.jpg',
        'hero12.jpg', 'hero13.jpg', 'hero14.jpg', 'hero15.jpg', 'hero16.jpg',
        'hero17.jpg', 'hero18.jpg', 'hero19.jpg'
    ];

    const poemHero = document.querySelector('.poem-hero-visual');

    if (mainHero) {
        mainHero.style.backgroundImage = "url('assets/hero_images/hero.jpg')";
    } else if (poemHero) {
        const randomImg = poemImages[Math.floor(Math.random() * poemImages.length)];
        poemHero.style.backgroundImage = `url('assets/hero_images/${randomImg}')`;
    }

    // 3. CARD GENERATORS
    function createCard(p) {
        const el = document.createElement("div");
        el.className = "blog-card"; 
        const displayText = p.description || (p.content ? p.content.substring(0, 120) + "..." : "");

        el.innerHTML = `
            <div class="blog-card-inner">
                <span class="date" style="color: var(--accent); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${p.date}</span>
                <h4>${p.title}</h4>
                <p>${displayText}</p>
                <a href="./poem.html?id=${p.id}" class="link" style="margin-top: 1rem; display: block; color: var(--accent);">Read more →</a>
            </div>
        `;
        
        el.onclick = () => { window.location.href = `./poem.html?id=${p.id}`; };
        return el;
    }

    function createEmailCard(email) {
        const card = document.createElement('div');
        card.classList.add('card'); 
        card.innerHTML = `
            <span class="date" style="color: var(--accent); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${email.date}</span>
            <h2>${email.title}</h2>
            <p>${email.preview || (email.content ? email.content.substring(0, 120) + "..." : "")}</p>
        `;
        return card;
    }

    // 4. CAROUSEL INITIALIZATION LOGIC
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

            // Clone for infinite loop
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

            let resizeTimeout;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateCarousel(false); 
                }, 150); 
            });
        }
    }

    // 5. HOME PAGE CONTENT
    if (featuredList && typeof poems !== 'undefined') {
        poems.filter(p => p.featured).forEach(p => featuredList.appendChild(createCard(p)));
        initCarousel();
    }

    if (authorBlurb && typeof author !== 'undefined') {
        authorBlurb.textContent = author.blurb;
    }

    // 6. ARCHIVE & EMAILS PAGE CONTENT (With Search & Sorting)
    const targetContainer = allEl || emailGrid;
    const targetData = allEl ? (typeof poems !== 'undefined' ? poems : null) : (typeof emailsData !== 'undefined' ? emailsData : null);

    if (targetContainer && targetData) {
        let currentSort = 'newest';
        
        const render = () => {
            const query = searchInput ? searchInput.value.toLowerCase() : "";
            
            let list = targetData.filter(item => 
                item.title.toLowerCase().includes(query) || 
                (item.tags && item.tags.some(t => t.toLowerCase().includes(query))) ||
                (item.preview && item.preview.toLowerCase().includes(query))
            );

            if (currentSort === 'newest') {
                list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            } else if (currentSort === 'oldest') {
                list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            } else if (currentSort === 'az') {
                list.sort((a, b) => a.title.localeCompare(b.title));
            } else if (currentSort === 'za') {
                list.sort((a, b) => b.title.localeCompare(a.title));
            }

            targetContainer.innerHTML = "";
            list.forEach(item => {
                const card = allEl ? createCard(item) : createEmailCard(item);
                targetContainer.appendChild(card);
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
    }

    // 7. PASSWORD LOCK LOGIC
    if (squirrelingBtn) {
        squirrelingBtn.addEventListener('click', function(e) {
            e.preventDefault(); 

            const correctPassword = "brooklyn"; 
            const userInput = prompt("Enter password to access Squirreling:");

            if (userInput === correctPassword) {
                window.location.href = "squirreling.html";
            } else if (userInput !== null) {
                alert("Incorrect password!");
            }
        });
    }
});
