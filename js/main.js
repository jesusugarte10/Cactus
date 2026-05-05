const portfolioData = window.PORTFOLIO_DATA || { featuredProducts: [], publicRepos: [], snapshotDate: "" };

const currentYear = document.getElementById("current-year");
const featuredGrid = document.getElementById("featured-grid");
const repoList = document.getElementById("repo-list");
const repoCount = document.getElementById("repo-count");
const snapshotDate = document.getElementById("snapshot-date");
const repoSearch = document.getElementById("repo-search");
const repoToggle = document.getElementById("repo-toggle");
const repoPreviewNote = document.getElementById("repo-preview-note");
const roleRotator = document.getElementById("role-rotator");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileBackdrop = document.querySelector(".mobile-nav-backdrop");
const header = document.querySelector(".site-header");
const compactRepoLimit = 6;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const roles = [
    "Full Stack Engineer",
    "Gen AI Specialist",
    "DevOps Builder",
    "Mobile Developer",
    "Computer Vision Researcher",
    "Mixed Reality Developer"
];

let filteredRepos = [...portfolioData.publicRepos];
let archiveExpanded = false;

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
        return value;
    }

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
};

const createTag = (label, accent = false) => {
    const className = accent ? "meta-pill meta-pill-accent" : "tag-pill";
    return `<span class="${className}">${label}</span>`;
};

const renderFeaturedProducts = () => {
    featuredGrid.innerHTML = portfolioData.featuredProducts.map((product) => `
        <article class="featured-card reveal">
            <div class="card-meta">
                ${createTag(product.visibilityNote, true)}
            </div>
            <div>
                <h3>${product.title}</h3>
                <p>${product.summary}</p>
            </div>
            <div class="featured-tags">
                ${(product.tags || []).map((tag) => createTag(tag)).join("")}
            </div>
            <div class="card-actions">
                <a class="link-button" href="${product.liveUrl}" target="_blank" rel="noopener noreferrer">Visit Live Site</a>
            </div>
        </article>
    `).join("");
};

const getSearchQuery = () => repoSearch.value.trim().toLowerCase();

const isSearchActive = () => Boolean(getSearchQuery());

const isCompactPreviewActive = () => !archiveExpanded && !isSearchActive() && filteredRepos.length > compactRepoLimit;

const getVisibleRepos = () => isCompactPreviewActive()
    ? filteredRepos.slice(0, compactRepoLimit)
    : filteredRepos;

const renderRepoCount = () => {
    const visibleCount = getVisibleRepos().length;
    const totalCount = portfolioData.publicRepos.length;

    if (isSearchActive()) {
        repoCount.textContent = visibleCount === 1
            ? "1 matching repository"
            : `${visibleCount} matching repositories`;
        return;
    }

    repoCount.textContent = isCompactPreviewActive()
        ? `Top ${visibleCount} of ${totalCount} public repositories`
        : `${totalCount} public repositories`;
};

const renderArchiveControls = () => {
    const totalCount = portfolioData.publicRepos.length;
    const compactPreview = isCompactPreviewActive();
    const queryActive = isSearchActive();

    if (queryActive) {
        repoPreviewNote.textContent = filteredRepos.length
            ? "Search is showing the full set of matching repositories."
            : "No repositories matched that search. Try a broader keyword.";
        repoToggle.hidden = true;
        repoToggle.setAttribute("aria-expanded", "true");
        return;
    }

    if (totalCount <= compactRepoLimit) {
        repoPreviewNote.textContent = "All public repositories fit in the current archive view.";
        repoToggle.hidden = true;
        repoToggle.setAttribute("aria-expanded", "true");
        return;
    }

    repoToggle.hidden = false;
    repoToggle.textContent = compactPreview ? "Expand full archive" : "Show compact preview";
    repoToggle.setAttribute("aria-expanded", String(!compactPreview));
    repoPreviewNote.textContent = compactPreview
        ? `Showing the latest ${Math.min(compactRepoLimit, filteredRepos.length)} repositories first in a condensed layout.`
        : `Full archive expanded. All ${totalCount} public repositories are visible.`;
};

const renderRepos = () => {
    const compactPreview = isCompactPreviewActive();
    const visibleRepos = getVisibleRepos();

    repoList.dataset.mode = compactPreview ? "compact" : "full";

    if (!visibleRepos.length) {
        repoList.innerHTML = `
            <div class="empty-state reveal">
                <h3>No matching repositories</h3>
                <p>Try a different keyword or clear the search to return to the latest project preview.</p>
            </div>
        `;
        renderRepoCount();
        renderArchiveControls();
        revealVisibleSections();
        return;
    }

    repoList.innerHTML = visibleRepos.map((repo) => {
        const liveLink = repo.liveUrl
            ? `<a class="link-button" href="${repo.liveUrl}" target="_blank" rel="noopener noreferrer">Live Site</a>`
            : "";
        const repoTags = (repo.tags || []).map((tag) => createTag(tag)).join("");

        return `
            <article class="repo-item reveal">
                <div class="repo-header">
                    <div class="repo-title-group">
                        <h3 class="repo-title">${repo.title}</h3>
                        <p class="repo-subtitle">${repo.visibilityNote}</p>
                    </div>
                    <div class="repo-meta">
                        ${repo.language ? createTag(repo.language, true) : ""}
                        ${createTag(`Updated ${formatDate(repo.updatedAt)}`)}
                    </div>
                </div>
                <p class="repo-description">${repo.summary}</p>
                <div class="repo-footer">
                    <div class="repo-tags">${repoTags}</div>
                    <div class="repo-actions">
                        <a class="link-button" href="${repo.repoUrl}" target="_blank" rel="noopener noreferrer">View GitHub</a>
                        ${liveLink}
                    </div>
                </div>
            </article>
        `;
    }).join("");

    renderRepoCount();
    renderArchiveControls();
    revealVisibleSections();
};

const revealVisibleSections = () => {
    const revealNodes = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealNodes.forEach((node) => node.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16
    });

    revealNodes.forEach((node) => {
        if (!node.classList.contains("is-visible")) {
            observer.observe(node);
        }
    });
};

const filterRepos = () => {
    const query = getSearchQuery();

    if (!query) {
        filteredRepos = [...portfolioData.publicRepos];
        renderRepos();
        return;
    }

    filteredRepos = portfolioData.publicRepos.filter((repo) => {
        const haystack = [
            repo.title,
            repo.summary,
            repo.language,
            ...(repo.tags || [])
        ].join(" ").toLowerCase();

        return haystack.includes(query);
    });

    renderRepos();
};

const setupArchiveToggle = () => {
    repoToggle.addEventListener("click", () => {
        archiveExpanded = !archiveExpanded;
        renderRepos();
    });
};

const setSnapshotLabel = () => {
    if (!portfolioData.snapshotDate) {
        return;
    }

    const label = formatDate(portfolioData.snapshotDate);
    snapshotDate.textContent = `Snapshot: ${label}`;
};

const runRoleRotator = () => {
    if (!roleRotator) {
        return;
    }

    if (prefersReducedMotion) {
        roleRotator.textContent = roles[0];
        return;
    }

    let index = 0;

    window.setInterval(() => {
        index = (index + 1) % roles.length;
        roleRotator.animate([
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-6px)" },
            { opacity: 0, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], {
            duration: 460,
            easing: "ease"
        });
        roleRotator.textContent = roles[index];
    }, 2200);
};

const toggleMenu = (open) => {
    const isOpen = typeof open === "boolean" ? open : !document.body.classList.contains("menu-open");

    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.hidden = !isOpen;
    mobileBackdrop.hidden = !isOpen;
};

const setupMenu = () => {
    menuToggle.addEventListener("click", () => toggleMenu());
    mobileBackdrop.addEventListener("click", () => toggleMenu(false));

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => toggleMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            toggleMenu(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            toggleMenu(false);
        }
    });
};

const setupParallax = () => {
    if (prefersReducedMotion) {
        return;
    }

    const nodes = [...document.querySelectorAll("[data-parallax]")];

    if (!nodes.length) {
        return;
    }

    let ticking = false;

    const update = () => {
        const scrollY = window.scrollY;

        nodes.forEach((node) => {
            const rect = node.getBoundingClientRect();
            const offset = (rect.top + scrollY - scrollY) * 0.02;
            node.style.transform = `translateY(${Math.max(-12, Math.min(12, -offset))}px)`;
        });

        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
};

const setupHeaderState = () => {
    const updateHeader = () => {
        header.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
};

const setupSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");
            const target = href ? document.querySelector(href) : null;

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });
};

currentYear.textContent = new Date().getFullYear();
setSnapshotLabel();
renderFeaturedProducts();
renderRepos();
runRoleRotator();
setupMenu();
setupParallax();
setupHeaderState();
setupSmoothAnchors();
setupArchiveToggle();
revealVisibleSections();

repoSearch.addEventListener("input", filterRepos);
