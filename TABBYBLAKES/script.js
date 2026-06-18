/* =======================================================
   TABBYBLAKES - EDITORIAL REDESIGN SCRIPT
   Handles: reveal animation, active nav, lightbox,
            smooth anchor scroll, form feedback
   ======================================================= */

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    const bookingForm = document.getElementById("booking-form");
    const fanForm = document.getElementById("fan-form");
    const lightbox = document.getElementById("showcase-lightbox");
    const lightboxMedia = document.getElementById("lightbox-media");
    const lightboxVideo = document.getElementById("lightbox-video");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxTriggers = document.querySelectorAll("[data-lightbox-src]");
    const gallerySection = document.getElementById("gallery");
    const galleryToggle = document.getElementById("gallery-toggle");
    const galleryPanel = document.getElementById("gallery-archive-panel");
    const siteHeader = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const siteMenu = document.getElementById("primary-menu");
    let activeLightboxTrigger = null;
    let previousBodyOverflow = "";
    let galleryCloseTimer = null;

    if (!("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("visible"));
    } else if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -70px 0px" });

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("visible"));
    }

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.dataset.navSection || entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.dataset.section === id);
                });
            });
        }, { threshold: 0.42 });

        sections.forEach((section) => sectionObserver.observe(section));
    }

    function setGalleryOpen(isOpen, shouldReturnFocus = false) {
        if (!gallerySection || !galleryToggle || !galleryPanel) return;

        clearTimeout(galleryCloseTimer);
        galleryToggle.setAttribute("aria-expanded", String(isOpen));
        galleryToggle.querySelector("span").textContent = isOpen ? "Close Gallery" : "View Gallery";

        if (isOpen) {
            galleryPanel.hidden = false;
            galleryPanel.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right").forEach((el) => {
                el.classList.add("visible");
            });

            requestAnimationFrame(() => {
                gallerySection.classList.add("gallery-open");
            });
            return;
        }

        gallerySection.classList.remove("gallery-open");

        if (prefersReducedMotion) {
            galleryPanel.hidden = true;
        } else {
            galleryCloseTimer = setTimeout(() => {
                if (!gallerySection.classList.contains("gallery-open")) {
                    galleryPanel.hidden = true;
                }
            }, 780);
        }

        if (shouldReturnFocus) {
            galleryToggle.focus();
        }
    }

    if (galleryToggle && gallerySection && galleryPanel) {
        galleryToggle.addEventListener("click", () => {
            setGalleryOpen(!gallerySection.classList.contains("gallery-open"), true);
        });
    }

    function flashFormSuccess(targetForm, buttonSelector, labelSelector, idleText, successText) {
        if (!targetForm.checkValidity()) {
            targetForm.reportValidity();
            return;
        }

        const button = targetForm.querySelector(buttonSelector);
        const label = targetForm.querySelector(labelSelector);

        if (!button || !label) return;

        button.disabled = true;
        label.textContent = successText;

        setTimeout(() => {
            targetForm.reset();
            button.disabled = false;
            label.textContent = idleText;
        }, 2800);
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!bookingForm.checkValidity()) {
                bookingForm.reportValidity();
                return;
            }

            const recipient = bookingForm.dataset.recipient || "Tabbyblakesbookings@gmail.com";
            const button = bookingForm.querySelector(".submit-btn");
            const label = bookingForm.querySelector(".btn-label");
            const fields = {
                name: document.getElementById("booking-name")?.value.trim() || "",
                email: document.getElementById("booking-email")?.value.trim() || "",
                eventType: document.getElementById("booking-type")?.value || "",
                eventDate: document.getElementById("booking-date")?.value.trim() || "",
                message: document.getElementById("booking-message")?.value.trim() || ""
            };
            const subject = `Booking inquiry from ${fields.name || "Tabbyblakes site"}`;
            const body = [
                "New booking inquiry from tabbyblakes.com",
                "",
                `Name: ${fields.name}`,
                `Email: ${fields.email}`,
                `Type of event: ${fields.eventType}`,
                `Event date: ${fields.eventDate || "Not provided"}`,
                "",
                "Message:",
                fields.message || "Not provided"
            ].join("\n");
            const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            if (button) {
                button.disabled = true;
            }

            if (label) {
                label.textContent = "Opening Mail...";
            }

            window.location.href = mailtoUrl;

            setTimeout(() => {
                if (button) {
                    button.disabled = false;
                }

                if (label) {
                    label.textContent = "Send the Message";
                }
            }, 1200);
        });
    }

    if (fanForm) {
        fanForm.addEventListener("submit", (event) => {
            event.preventDefault();
            flashFormSuccess(
                fanForm,
                ".fan-btn",
                ".fan-btn-label",
                "Join the Fan List",
                "You're In!"
            );
        });
    }

    function resetLightboxVideo() {
        if (!lightboxVideo) return;

        lightboxVideo.pause();
        lightboxVideo.removeAttribute("src");
        lightboxVideo.removeAttribute("poster");
        lightboxVideo.load();
        lightboxVideo.hidden = true;
    }

    function openLightbox(trigger) {
        if (!lightbox || !lightboxMedia || !lightboxVideo || !lightboxTitle || !lightboxCaption) return;

        const src = trigger.dataset.lightboxSrc;
        const title = trigger.dataset.lightboxTitle || "Preview";
        const caption = trigger.dataset.lightboxCaption || "";
        const alt = trigger.querySelector("img")?.alt || title;
        const isVideo = trigger.dataset.lightboxType === "video";

        activeLightboxTrigger = trigger;
        previousBodyOverflow = document.body.style.overflow;

        if (isVideo) {
            lightboxMedia.removeAttribute("src");
            lightboxMedia.alt = "";
            lightboxMedia.hidden = true;
            lightboxVideo.poster = trigger.querySelector("img")?.getAttribute("src") || "";
            lightboxVideo.src = src;
            lightboxVideo.hidden = false;
        } else {
            resetLightboxVideo();
            lightboxMedia.hidden = false;
            lightboxMedia.src = src;
            lightboxMedia.alt = alt;
        }

        lightboxTitle.textContent = title;
        lightboxCaption.textContent = caption;
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        lightboxClose?.focus();
    }

    function closeLightbox() {
        if (!lightbox || !lightboxMedia) return;

        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        resetLightboxVideo();
        lightboxMedia.hidden = false;
        lightboxMedia.removeAttribute("src");
        lightboxMedia.alt = "";
        document.body.style.overflow = previousBodyOverflow;
        activeLightboxTrigger?.focus();
        activeLightboxTrigger = null;
    }

    lightboxTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => openLightbox(trigger));
    });

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target !== lightbox) return;
            closeLightbox();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !lightbox || !lightbox.classList.contains("open")) return;
        closeLightbox();
    });

    function setMenuOpen(isOpen) {
        if (!siteHeader || !menuToggle || !siteMenu) return;
        siteHeader.classList.toggle("menu-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    }

    if (menuToggle && siteHeader && siteMenu) {
        menuToggle.addEventListener("click", () => {
            setMenuOpen(!siteHeader.classList.contains("menu-open"));
        });

        document.addEventListener("click", (event) => {
            if (!siteHeader.classList.contains("menu-open")) return;
            if (siteHeader.contains(event.target)) return;
            setMenuOpen(false);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            const targetId = href ? href.slice(1) : "";

            if (!targetId) {
                event.preventDefault();
                return;
            }

            const target = document.getElementById(targetId);

            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
            setMenuOpen(false);
        });
    });
})();
