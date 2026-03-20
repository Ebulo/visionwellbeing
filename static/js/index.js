const dom = {
  body: document.body,
  header: document.getElementById("siteHeader"),
  menuToggle: document.getElementById("menuToggle"),
  mainNav: document.getElementById("mainNav"),
  backToTop: document.getElementById("backToTop"),
  contactForm: document.getElementById("contactForm"),
  formNote: document.getElementById("formNote"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxCaption: document.getElementById("lightboxCaption"),
  lightboxClose: document.getElementById("lightboxClose"),
  year: document.getElementById("year"),
  navLinks: Array.from(document.querySelectorAll(".main-nav a")),
  sections: Array.from(document.querySelectorAll("main section[id]")),
  revealItems: Array.from(document.querySelectorAll(".reveal")),
  galleryItems: Array.from(document.querySelectorAll("[data-lightbox]")),
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getHeaderOffset() {
  return (dom.header?.offsetHeight || 0) + 14;
}

function smoothScrollToHash(hash) {
  if (!hash || !hash.startsWith("#")) return;
  const target = document.querySelector(hash);
  if (!target) return;

  const top = Math.max(0, target.offsetTop - getHeaderOffset());
  window.scrollTo({
    top,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

function setMenuState(open) {
  if (!dom.menuToggle || !dom.mainNav) return;

  dom.mainNav.classList.toggle("open", open);
  dom.menuToggle.classList.toggle("active", open);
  dom.menuToggle.setAttribute("aria-expanded", String(open));
}

function handleNavigation() {
  if (dom.menuToggle && dom.mainNav) {
    dom.menuToggle.addEventListener("click", () => {
      const open = !dom.mainNav.classList.contains("open");
      setMenuState(open);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
        closeLightbox();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!dom.mainNav.classList.contains("open")) return;
      if (target.closest(".nav-wrap")) return;
      setMenuState(false);
    });
  }

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      smoothScrollToHash(href);
      setMenuState(false);
    });
  });
}

function updateScrollState() {
  const scrollY = window.scrollY;

  dom.header?.classList.toggle("scrolled", scrollY > 12);
  dom.backToTop?.classList.toggle("show", scrollY > 540);

  let activeId = "";
  dom.sections.forEach((section) => {
    const threshold = section.offsetTop - getHeaderOffset() - 120;
    if (scrollY >= threshold) {
      activeId = section.id;
    }
  });

  dom.navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function setupRevealObserver() {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    dom.revealItems.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  dom.revealItems.forEach((item) => observer.observe(item));
}

function clearFieldState() {
  if (!dom.contactForm) return;
  dom.contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.classList.remove("invalid");
  });
}

function setFormMessage(message, type) {
  if (!dom.formNote) return;
  dom.formNote.textContent = message;
  dom.formNote.className = `form-note ${type}`;
}

function validateContactForm() {
  if (!dom.contactForm) return;

  dom.contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFieldState();

    const formData = new FormData(dom.contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const nameField = dom.contactForm.elements.namedItem("name");
    const emailField = dom.contactForm.elements.namedItem("email");
    const phoneField = dom.contactForm.elements.namedItem("phone");
    const messageField = dom.contactForm.elements.namedItem("message");

    const setError = (field, note) => {
      field?.classList.add("invalid");
      setFormMessage(note, "error");
    };

    if (name.length < 2) {
      setError(nameField, "Please enter a valid name.");
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!emailValid) {
      setError(emailField, "Please enter a valid email address.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setError(phoneField, "Please enter a valid phone number.");
      return;
    }

    if (message.length < 12) {
      setError(messageField, "Please add a short requirement summary.");
      return;
    }

    setFormMessage("Message sent successfully. Our team will contact you shortly.", "success");
    dom.contactForm.reset();
  });
}

function openLightbox(src, caption) {
  if (!dom.lightbox || !dom.lightboxImage || !dom.lightboxCaption) return;
  dom.lightboxImage.src = src;
  dom.lightboxCaption.textContent = caption || "";
  dom.lightbox.classList.add("open");
  dom.lightbox.setAttribute("aria-hidden", "false");
  dom.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!dom.lightbox || !dom.lightboxImage) return;
  dom.lightbox.classList.remove("open");
  dom.lightbox.setAttribute("aria-hidden", "true");
  dom.lightboxImage.removeAttribute("src");
  dom.body.style.overflow = "";
}

function setupLightbox() {
  if (!dom.galleryItems.length) return;

  dom.galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.getAttribute("data-lightbox");
      const caption = item.getAttribute("data-caption");
      if (src) {
        openLightbox(src, caption);
      }
    });
  });

  dom.lightboxClose?.addEventListener("click", closeLightbox);
  dom.lightbox?.addEventListener("click", (event) => {
    if (event.target === dom.lightbox) {
      closeLightbox();
    }
  });
}

function setupBackToTop() {
  dom.backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
}

function setYear() {
  if (dom.year) {
    dom.year.textContent = String(new Date().getFullYear());
  }
}

function init() {
  setYear();
  handleNavigation();
  setupRevealObserver();
  validateContactForm();
  setupLightbox();
  setupBackToTop();
  updateScrollState();

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1080) {
      setMenuState(false);
    }
    updateScrollState();
  });
}

init();
