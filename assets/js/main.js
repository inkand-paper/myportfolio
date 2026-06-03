/* ============================================================
   PORTFOLIO — MAIN JS
   Features: Custom cursor, scroll reveal, nav scroll state,
   animated counters, mobile nav, form validation,
   prefers-reduced-motion aware throughout
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Custom Cursor ─────────────────────────────────────── */
  if (!prefersReducedMotion) {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;
    let rafId;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';

      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';

      rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll(
      'a, button, [tabindex="0"], input, textarea, select, .project-item'
    );

    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovering');
        follower.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering');
        follower.classList.remove('is-hovering');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    });
  }

  /* ── Navigation scroll state ───────────────────────────── */
  const navHeader = document.getElementById('nav-header');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Mobile nav toggle ─────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close on nav link click
  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navHeader.contains(e.target)) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  /* ── Scroll Reveal ─────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // No animation — show immediately
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ── Animated counters ─────────────────────────────────── */
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, target, duration) {
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target, 1600);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  } else {
    statNumbers.forEach((el) => {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ── Active nav link on scroll ─────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ── Contact form validation ───────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('form-success');

    function validateField(input) {
      const id = input.id;
      const errorEl = document.getElementById(id + '-error');
      let error = '';

      if (input.required && !input.value.trim()) {
        error = 'This field is required.';
      } else if (input.type === 'email' && input.value) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(input.value)) error = 'Please enter a valid email.';
      }

      if (errorEl) errorEl.textContent = error;
      input.classList.toggle('has-error', !!error);
      return !error;
    }

    // Validate on blur
    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      form.querySelectorAll('input[required], textarea[required]').forEach((input) => {
        if (!validateField(input)) isValid = false;
      });

      if (!isValid) {
        // Focus first error
        const firstError = form.querySelector('.has-error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      btnText.textContent = 'Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        btnText.textContent = 'Send message';
        successMsg.textContent = 'Message sent. I will get back to you within 24 hours.';
        successMsg.classList.add('visible');
        form.reset();

        setTimeout(() => {
          successMsg.classList.remove('visible');
        }, 6000);
      }, 1400);
    });
  }

  /* ── Smooth scroll for anchor links ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

})();
