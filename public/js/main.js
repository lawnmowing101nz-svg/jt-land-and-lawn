/* JT Land and Lawn — nav, chat lead form, quote forms, gallery lightbox */
(function () {
  "use strict";

  var FORMSPARK_ID = "1xhV61ru1";
  var BOTPOISON_KEY = "pk_dce1f627-b0cc-4b2f-85b0-f7a005c0f354";
  var botpoison = (typeof Botpoison !== "undefined") ? new Botpoison({ publicKey: BOTPOISON_KEY }) : null;

  var PHONE = "(682) 294-3447";

  var SPAM_KEYWORDS = [
    "b2b", "seo", "backlink", "link building", "domain authority", "organic traffic",
    "keyword ranking", "serp", "guest post", "ahrefs", "semrush", "moz", "web design",
    "website redesign", "web development", "app development", "wordpress", "shopify",
    "full-stack", "devops", "mvp", "hire developers", "staff augmentation", "offshore",
    "virtual assistant", "ai automation", "ai agent", "ai assistant", "ai-powered",
    "ai-native", "ai video", "artificial intelligence", "generative", "chatgpt", "chatbot",
    "automate your", "automation", "crm", "saas", "lead generation", "qualified leads",
    "cold email", "mass email", "bulk email", "email campaign", "google my business", "gmb",
    "local seo", "google maps ranking", "online presence", "reputation management",
    "social media management", "facebook ads", "google ads", "meta ads", "ppc", "retargeting",
    "digital marketing", "marketing agency", "content marketing", "press release",
    "brand awareness", "branding package", "logo design", "video production",
    "explainer video", "voiceover", "influencer", "free audit", "seo audit",
    "conversion rate", "sales funnel", "monetize", "monetise", "your roi",
    "scale your business", "grow your business", "business loan", "merchant cash",
    "invoice factoring", "crypto", "bitcoin", "forex", "investment opportunity",
    "passive income", "make money online", "affiliate", "you've been selected",
    "congratulations you", "click here", "risk-free", "free trial", "limited time offer",
    "act now", "unsubscribe", "gift card", "wire transfer", "linkedin", "calendly",
    "calendar.app", "tidycal", "savvycal", "hubspot", "telegram", "book a call",
    "brief call", "hop on a call", "jump on a call", "discovery call", "book a demo",
    "15 minutes of your", "30 minutes of your", "worth a chat", "worth a conversation",
    "sounds relevant", "let's connect", "circling back", "touching base",
    "who handles your", "are you the right person", "we specialize", "we specialise",
    "our team handles", "we work with agencies", "full production", "end-to-end",
    "turnkey", "white label", "white-label", "proof of concept", "proof-of-concept",
    "case study", "case studies", "our recent work", "our latest work", "cofounder",
    "co-founder", "business development manager", "sales representative",
    "partnership", "collaboration", "synergy", "win-win", "mutual benefit",
    "dear sir", "dear madam"
  ];

  function isSpamMessage(text) {
    var lower = (text || "").toLowerCase();
    return SPAM_KEYWORDS.some(function (kw) { return lower.indexOf(kw) !== -1; });
  }

  /* ---------------------------------------------------------- mobile nav */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------- chat */
  var chatToggle = document.querySelector(".chat-toggle");
  var chatPanel = document.getElementById("chat-panel");
  var chatBubble = document.querySelector(".chat-bubble");
  if (chatToggle && chatPanel) {
    chatToggle.addEventListener("click", function () {
      var open = chatPanel.classList.toggle("open");
      chatToggle.classList.toggle("open", open);
      chatToggle.setAttribute("aria-expanded", open ? "true" : "false");
      chatToggle.setAttribute("aria-label", open ? "Close the quote form" : "Open the quote form");
      if (chatBubble) chatBubble.classList.add("hide");
      if (open) {
        var first = chatPanel.querySelector("input, textarea");
        if (first) first.focus();
      }
    });
  }
  if (chatBubble) {
    chatBubble.addEventListener("click", function () {
      if (chatToggle) chatToggle.click();
    });
  }

  /* ------------------------------------------------------------ forms */
  function wireForm(form) {
    var errorBox = form.querySelector(".form-error");
    var success = form.parentNode.querySelector(".form-success");
    var button = form.querySelector("button[type=submit]");

    function fail(msg) {
      if (!errorBox) return;
      errorBox.textContent = msg;
      errorBox.classList.add("show");
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (errorBox) errorBox.classList.remove("show");

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();

      if (!name) return fail("Please add your name so we know who we're talking to.");
      if (!phone && !email) return fail("Please add a phone number or an email so we can get back to you.");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email address doesn't look right — please check it.");

      var showDone = function () {
        form.style.display = "none";
        if (success) success.classList.add("show");
      };

      // keyword spam filter — pretend it worked so senders don't adapt their wording
      var messageText = (data.get("message") || "").toString();
      if (isSpamMessage(messageText)) {
        showDone();
        return;
      }

      if (!FORMSPARK_ID) {
        // No backend wired up yet — confirm to the visitor without posting.
        showDone();
        return;
      }

      var body = new URLSearchParams();
      data.forEach(function (value, key) { body.append(key, value.toString()); });

      if (button) { button.disabled = true; button.textContent = "Sending…"; }

      (botpoison ? botpoison.challenge() : Promise.resolve(null)).then(function (result) {
        if (result && result.solution) body.append("_botpoison", result.solution);
        return fetch("https://submit-form.com/" + FORMSPARK_ID, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: body.toString()
        });
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status " + res.status);
        showDone();
      }).catch(function () {
        if (button) { button.disabled = false; button.textContent = button.dataset.label || "Send"; }
        fail("Sorry — that didn't go through. Please call or text us on " + PHONE + " instead.");
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("form[data-quote-form]"), wireForm);

  /* ------------------------------------- character counter on message fields */
  Array.prototype.forEach.call(document.querySelectorAll("textarea[maxlength]"), function (textarea) {
    var max = textarea.getAttribute("maxlength");
    var counter = document.createElement("div");
    counter.className = "char-counter";
    counter.setAttribute("aria-live", "polite");
    function updateCounter() {
      counter.textContent = textarea.value.length + "/" + max;
    }
    updateCounter();
    textarea.addEventListener("input", updateCounter);
    textarea.insertAdjacentElement("afterend", counter);
  });

  /* ------------------------------------------- google reviews widget */
  var grTrack = document.querySelector(".gr-track");
  if (grTrack) {
    // "…read more" only appears on reviews long enough to actually be clipped
    Array.prototype.forEach.call(document.querySelectorAll(".gr-card"), function (card) {
      var text = card.querySelector(".gr-text");
      var more = card.querySelector(".gr-more");
      if (text.scrollHeight > text.clientHeight + 2) card.classList.add("can-expand");
      more.addEventListener("click", function () {
        var open = card.classList.toggle("open");
        more.innerHTML = open ? "show less" : "…read more";
      });
    });

    var carousel = grTrack.parentNode;
    var prev = carousel.querySelector(".gr-prev");
    var next = carousel.querySelector(".gr-next");

    function step() {
      var card = grTrack.querySelector(".gr-card");
      return card ? card.getBoundingClientRect().width + 18 : 320;
    }
    function sync() {
      // ignore a few stray pixels — only arrow it when there's real distance to travel
      var slack = grTrack.scrollWidth - grTrack.clientWidth;
      var overflows = slack > 24;
      carousel.classList.toggle("scrollable", overflows);
      if (!overflows) return;
      prev.disabled = grTrack.scrollLeft <= 4;
      next.disabled = grTrack.scrollLeft >= slack - 4;
    }

    // Set the position outright. Deliberately not using scroll-behavior:smooth
    // or requestAnimationFrame — both silently no-op when a browser isn't
    // compositing, which would leave the arrows looking broken.
    function nudge(dir) {
      grTrack.scrollLeft = Math.max(0, Math.min(
        grTrack.scrollLeft + dir * step(),
        grTrack.scrollWidth - grTrack.clientWidth));
      sync();
    }
    prev.addEventListener("click", function () { nudge(-1); });
    next.addEventListener("click", function () { nudge(1); });
    grTrack.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    sync();
  }

  /* ---------------------------------------------------- reveal on scroll */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Each entry is one animation group. `step` staggers siblings inside the
  // same parent, so a row of cards deals itself out rather than snapping in.
  var REVEAL_GROUPS = [
    { sel: ".section-head", mode: "up" },
    { sel: ".trust-card", mode: "up", step: 90 },
    { sel: ".service-card", mode: "up", step: 90 },
    { sel: ".split-media", mode: "zoom" },
    { sel: ".split > div:not(.split-media)", mode: "up" },
    { sel: ".gr-head", mode: "up" },
    { sel: ".gr-card", mode: "up", step: 90 },
    { sel: ".gallery-grid button", mode: "zoom", step: 45 },
    { sel: ".review-inline", mode: "up" },
    { sel: ".form-card", mode: "up" },
    { sel: ".map-frame", mode: "up" },
    { sel: ".info-list li", mode: "up", step: 70 },
    { sel: ".cta-band .wrap > *", mode: "up", step: 90 },
    { sel: ".footer-grid > div", mode: "up", step: 90 }
  ];

  var MAX_DELAY = 380;

  if (!reduced && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-in");
        observer.unobserve(el);
        // Drop the attribute once it has landed — the rule has done its job and
        // leaving it on would re-transition anything that later changes layout.
        el.addEventListener("transitionend", function done(ev) {
          if (ev.target !== el || ev.propertyName !== "opacity") return;
          el.removeEventListener("transitionend", done);
          el.removeAttribute("data-reveal");
          el.style.removeProperty("--reveal-delay");
        });
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });

    var fold = window.innerHeight;

    REVEAL_GROUPS.forEach(function (group) {
      var parents = [];
      var counts = [];

      Array.prototype.forEach.call(document.querySelectorAll(group.sel), function (el) {
        // Already on screen at load: leave it visible. Prevents the flash of
        // hidden content that a blanket reveal would cause above the fold.
        if (el.getAttribute("data-reveal") || el.getBoundingClientRect().top < fold - 40) return;

        el.setAttribute("data-reveal", group.mode);

        if (group.step) {
          var i = parents.indexOf(el.parentNode);
          var n;
          if (i === -1) { parents.push(el.parentNode); counts.push(0); n = 0; }
          else { n = ++counts[i]; }
          el.style.setProperty("--reveal-delay", Math.min(n * group.step, MAX_DELAY) + "ms");
        }

        observer.observe(el);
      });
    });

    // Safety net. If the observer never reports anything — a broken polyfill, a
    // browser that isn't compositing — every tagged section would sit at zero
    // opacity forever. Rather than risk blank content, drop the effect entirely.
    window.setTimeout(function () {
      if (document.querySelector("[data-reveal].is-in")) return;
      Array.prototype.forEach.call(document.querySelectorAll("[data-reveal]"), function (el) {
        el.removeAttribute("data-reveal");
        el.style.removeProperty("--reveal-delay");
      });
    }, 4000);
  }

  /* ------------------------------------------- header state + read bar */
  var header = document.querySelector(".site-header");
  if (header) {
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    header.appendChild(progress);

    var queued = false;
    function paintScroll() {
      queued = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var travel = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle("scrolled", y > 18);
      progress.style.transform = "scaleX(" + (travel > 0 ? Math.min(1, y / travel) : 0) + ")";
    }
    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paintScroll);
    }, { passive: true });
    window.addEventListener("resize", paintScroll);
    paintScroll();
  }

  /* -------------------------------------------------------- lightbox */
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var box = document.getElementById("lightbox");
  if (thumbs.length && box) {
    var img = box.querySelector("img");
    var count = box.querySelector(".lb-count");
    var current = 0;

    function show(i) {
      current = (i + thumbs.length) % thumbs.length;
      var t = thumbs[current];
      img.src = t.getAttribute("data-full");
      img.alt = t.querySelector("img") ? t.querySelector("img").alt : "JT Land and Lawn job photo";
      if (count) count.textContent = (current + 1) + " of " + thumbs.length;
    }
    function open(i) {
      show(i);
      box.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      box.classList.remove("open");
      document.body.style.overflow = "";
      thumbs[current].focus();
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener("click", function () { open(i); });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (ev) { if (ev.target === box) close(); });
    document.addEventListener("keydown", function (ev) {
      if (!box.classList.contains("open")) return;
      if (ev.key === "Escape") close();
      if (ev.key === "ArrowLeft") show(current - 1);
      if (ev.key === "ArrowRight") show(current + 1);
    });
  }
})();
