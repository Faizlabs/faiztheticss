/* ================================================================
   FAIZTHETICSS — Main JavaScript
   Scroll-driven color transitions, reveal animations, parallax
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- DOM References ----
  const body = document.body;
  const nav = document.getElementById('main-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a[data-nav]');
  const collections = document.querySelectorAll('.collection');
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const parallaxElements = document.querySelectorAll('.parallax');
  const heroSection = document.getElementById('hero');

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        // Close mobile nav if open
        navLinksContainer.classList.remove('open');
        navToggle.classList.remove('active');
      }
    });
  });

  // ---- Scroll-based Color Transitions ----
  // Uses scroll position to find which section is closest to the
  // viewport center, then sets the data-collection attribute on <body>
  let currentCollection = 'default';

  const updateActiveCollection = () => {
    const viewportCenter = window.innerHeight * 0.4; // slightly above center
    let activeSection = null;
    let minDistance = Infinity;

    // Check if we're still in the hero area
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom > viewportCenter) {
        // Still in hero, reset to default
        if (currentCollection !== 'default') {
          currentCollection = 'default';
          body.setAttribute('data-collection', 'default');
          navItems.forEach(item => item.classList.remove('active'));
        }
        return;
      }
    }

    // Find the collection section closest to the trigger point
    collections.forEach(section => {
      const rect = section.getBoundingClientRect();
      // Section must be at least partially visible
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        // Distance from the section's top quarter to the trigger point
        const sectionTrigger = rect.top + rect.height * 0.25;
        const distance = Math.abs(sectionTrigger - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          activeSection = section;
        }
      }
    });

    if (activeSection) {
      const collection = activeSection.dataset.collection;
      if (collection && collection !== currentCollection) {
        currentCollection = collection;
        body.setAttribute('data-collection', collection);

        // Update active nav item
        navItems.forEach(item => {
          item.classList.toggle('active', item.dataset.nav === collection);
        });
      }
    }
  };

  // ---- Reveal Animations on Scroll ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing for performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Parallax Effect ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  const updateParallax = () => {
    if (prefersReducedMotion || isMobile) return;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.12;
      const rect = el.getBoundingClientRect();
      const viewCenter = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const offset = (elCenter - viewCenter) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  };

  // ---- Unified Scroll Handler ----
  // Single rAF-throttled scroll listener for all scroll-driven effects
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // 1. Nav background
        nav.classList.toggle('scrolled', scrollY > 80);

        // 2. Active collection color transition
        updateActiveCollection();

        // 3. Parallax
        if (parallaxElements.length > 0) {
          updateParallax();
        }

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ---- Mobile Nav Toggle ----
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksContainer.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
  });

  // Close mobile nav when clicking outside
  navLinksContainer.addEventListener('click', (e) => {
    if (e.target === navLinksContainer) {
      navLinksContainer.classList.remove('open');
      navToggle.classList.remove('active');
    }
  });

  // ---- Staggered reveal for gallery rows ----
  document.querySelectorAll('.gallery-duo, .gallery-trio').forEach(row => {
    const children = row.querySelectorAll('.gallery-item');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  // ---- Initialize: trigger reveal for elements already in viewport ----
  requestAnimationFrame(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
        revealObserver.unobserve(el);
      }
    });

    // Run initial collection detection
    updateActiveCollection();
  });
});
