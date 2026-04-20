const dom = {
  body: document.body,
  header: document.getElementById("siteHeader"),
  menuToggle: document.getElementById("menuToggle"),
  mainNav: document.getElementById("mainNav"),
  servicesDropdown: document.getElementById("servicesDropdown"),
  servicesMenuLink: document.getElementById("servicesMenuLink"),
  servicesMenuToggle: document.getElementById("servicesMenuToggle"),
  servicesSubmenu: document.getElementById("servicesSubmenu"),
  scrollProgress: document.getElementById("scrollProgress"),
  clientLogoTrack: document.getElementById("clientLogoTrack"),
  backToTop: document.getElementById("backToTop"),
  contactForm: document.getElementById("contactForm"),
  formNote: document.getElementById("formNote"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxCaption: document.getElementById("lightboxCaption"),
  lightboxClose: document.getElementById("lightboxClose"),
  year: document.getElementById("year"),
  navLinks: Array.from(document.querySelectorAll(".main-nav a[href^='#']")),
  sections: Array.from(document.querySelectorAll("main section[id]")),
  revealItems: Array.from(document.querySelectorAll(".reveal")),
  parallaxItems: Array.from(document.querySelectorAll("[data-parallax]")),
  galleryItems: Array.from(document.querySelectorAll("[data-lightbox]")),
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const formEndpoint =
  "https://script.google.com/macros/s/AKfycbwVzFXcpV9uyCKpou6NsSGhxzghe-C7b0_8LDg0K3h1UfC25gmU6eIEstm6LCXmoy5u/exec";
const serviceActiveIds = new Set(["services", "competent-person"]);
const clientLogos = [
  {
    name: "SMS group",
    short: "SMS",
    logoUrl: "static/images/partners/sms_group.svg",
  },
  {
    name: "MP Birla Group",
    short: "MPB",
    logoUrl: "static/images/partners/birla.png",
  },
  {
    name: "Tata Consumer Products",
    short: "TCP",
    logoUrl: "static/images/partners/tata_consumer_products.png",
  },
  {
    name: "Tata Steel",
    short: "TS",
    logoUrl: "static/images/partners/tata_steel.png",
  },
  {
    name: "NTPC",
    short: "NTPC",
    logoUrl: "static/images/partners/ntpc.png",
  },
  {
    name: "United Breweries",
    short: "UBL",
    logoUrl: "static/images/partners/ub_united_breweries.png",
  },
  {
    name: "Larsen & Toubro",
    short: "L&T",
    logoUrl: "static/images/partners/lnt.png",
  },
  {
    name: "Britannia",
    short: "BR",
    logoUrl: "static/images/partners/Britannia.png",
  },
  {
    name: "Carlsberg",
    short: "CARL",
    logoUrl: "static/images/partners/carlsberg.webp",
  },
  {
    name: "IFGL Refractories",
    short: "IFGL",
    logoUrl: "static/images/partners/ifgl.png",
  },
  {
    name: "Jayaswal Neco Industries",
    short: "JN",
    logoUrl: "static/images/partners/jayaswal.jpg",
  },
];

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

  if (!open) {
    setServicesMenuState(false);
  }
}

function setServicesMenuState(open) {
  if (!dom.servicesDropdown || !dom.servicesMenuToggle) return;

  dom.servicesDropdown.classList.toggle("open", open);
  dom.servicesMenuToggle.setAttribute("aria-expanded", String(open));
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
        setServicesMenuState(false);
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

  dom.servicesMenuToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = !dom.servicesDropdown?.classList.contains("open");
    setServicesMenuState(Boolean(next));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".nav-dropdown")) return;
    setServicesMenuState(false);
  });

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      smoothScrollToHash(href);
      setMenuState(false);
      setServicesMenuState(false);
    });
  });
}

function updateScrollState() {
  const scrollY = window.scrollY;
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  );
  const progress = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));

  dom.header?.classList.toggle("scrolled", scrollY > 12);
  dom.backToTop?.classList.toggle("show", scrollY > 540);
  if (dom.scrollProgress) {
    dom.scrollProgress.style.width = `${progress}%`;
  }

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

  dom.servicesMenuToggle?.classList.toggle(
    "active",
    serviceActiveIds.has(activeId),
  );
  dom.servicesMenuLink?.classList.toggle("active", serviceActiveIds.has(activeId));

  if (!reduceMotion) {
    dom.parallaxItems.forEach((item) => {
      const speed = Number(item.getAttribute("data-parallax")) || 0;
      item.style.setProperty("--parallax-shift", `${scrollY * speed * 0.28}px`);
    });
  }
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

  dom.contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldState();

    const formData = new FormData(dom.contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const requirement = String(formData.get("requirement") || "").trim();

    const nameField = dom.contactForm.elements.namedItem("name");
    const emailField = dom.contactForm.elements.namedItem("email");
    const phoneField = dom.contactForm.elements.namedItem("phone");
    const requirementField = dom.contactForm.elements.namedItem("requirement");
    const submitButton = dom.contactForm.querySelector("button[type='submit']");
    const originalButtonLabel = submitButton?.textContent || "Send Enquiry";

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

    if (requirement.length < 12) {
      setError(requirementField, "Please add a short requirement summary.");
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      setFormMessage("Submitting your enquiry...", "success");

      const response = await fetch(formEndpoint, {
        method: "POST",
        mode: "cors",
        referrerPolicy: "strict-origin-when-cross-origin",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          requirement,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const raw = await response.text();
      let data = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { success: true };
        }
      }

      const ok = data?.success !== false;

      if (!ok) {
        throw new Error(data?.message || "Submission failed");
      }

      setFormMessage(
        "Message sent successfully. Our team will contact you shortly.",
        "success",
      );
      dom.contactForm.reset();
    } catch (error) {
      setFormMessage(
        "Could not send your enquiry right now. Please try again in a moment.",
        "error",
      );
      console.error(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonLabel;
      }
    }
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

function renderClientLogos() {
  if (!dom.clientLogoTrack) return;

  const createMarkup = (duplicate = false) =>
    clientLogos
      .map(
        (client, index) => `
          <article class="client-logo-card${duplicate ? " is-duplicate" : ""}" ${
            duplicate ? 'aria-hidden="true"' : ""
          }>
            <div class="client-logo-asset">
              <img
                class="client-logo-image"
                src="${client.logoUrl}"
                alt="${client.name} logo"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                data-logo-index="${index}"
              />
              <span class="client-logo-fallback">${client.short}</span>
            </div>
            <p>${client.name}</p>
          </article>
        `,
      )
      .join("");

  dom.clientLogoTrack.innerHTML = `${createMarkup(false)}${createMarkup(true)}`;

  dom.clientLogoTrack.querySelectorAll(".client-logo-image").forEach((image) => {
    const fallback = () => {
      image.closest(".client-logo-card")?.classList.add("is-fallback");
    };

    image.addEventListener("error", fallback, { once: true });
    if (image.complete && image.naturalWidth === 0) {
      fallback();
    }
  });
}

function setYear() {
  if (dom.year) {
    dom.year.textContent = String(new Date().getFullYear());
  }
}

function setupMotionEnhancements() {
  dom.revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${(index % 4) * 40}ms`);
  });
}

function init() {
  setYear();
  handleNavigation();
  setupMotionEnhancements();
  setupRevealObserver();
  validateContactForm();
  setupLightbox();
  setupBackToTop();
  renderClientLogos();
  updateScrollState();

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1080) {
      setMenuState(false);
      setServicesMenuState(false);
    }
    updateScrollState();
  });
}

init();
