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
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxTriggers = document.querySelectorAll("[data-lightbox-src]");
    let activeLightboxTrigger = null;
    let previousBodyOverflow = "";

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
            flashFormSuccess(
                bookingForm,
                ".submit-btn",
                ".btn-label",
                "Send the Message",
                "Message Sent!"
            );
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

    function openLightbox(trigger) {
        if (!lightbox || !lightboxMedia || !lightboxTitle || !lightboxCaption) return;

        const src = trigger.dataset.lightboxSrc;
        const title = trigger.dataset.lightboxTitle || "Preview";
        const caption = trigger.dataset.lightboxCaption || "";
        const alt = trigger.querySelector("img")?.alt || title;

        activeLightboxTrigger = trigger;
        previousBodyOverflow = document.body.style.overflow;
        lightboxMedia.src = src;
        lightboxMedia.alt = alt;
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
        lightboxMedia.src = "";
        lightboxMedia.alt = "";
        document.body.style.overflow = previousBodyOverflow;
        activeLightboxTrigger?.focus();
        activeLightboxTrigger = null;
    }

    lightboxTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => openLightbox(trigger));
        trigger.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            openLightbox(trigger);
        });
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
        });
    });
})();
