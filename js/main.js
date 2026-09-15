// =====================================================================
// RAHASH EFENDI — بيت الرهش الفاخر
// Product data sourced from the brand's live Snoonu storefront.
// To use real photography: drop a matching image into assets/images/
// using the exact "photo" filename listed for each item below.
// =====================================================================

const ORDER_URL = "https://snoonu.com/restaurants/rahash-efendi";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PRODUCTS = [
  // ---------------- رهش (Rahash) ----------------
  { cat: "rahash", name: "رهش بالورد والقرفة", en: "Rose Petal Cinnamon Rahash", desc: "بتلات ورد ونكهة القرفة الدافئة ممزوجة بالرهش السمسمي الناعم.", price: 69, photo: "rahash-rose-cinnamon.jpg", best: true },
  { cat: "rahash", name: "كوكتيل رهش", en: "Cocktail Rahash (Grapes, Hazelnut, Pistachio)", desc: "مزيج غني من الزبيب والبندق والفستق مطويّ داخل الرهش الكلاسيكي.", price: 69, photo: "rahash-cocktail.jpg", best: true },
  { cat: "rahash", name: "رهش الفستق", en: "Pistachio Rahash", desc: "فستق فاخر ممزوج بالرهش التقليدي لنكهة غنية ومقرمشة.", price: 69, photo: "rahash-pistachio.jpg", best: true },
  { cat: "rahash", name: "رهش اللوز", en: "Almond Rahash", desc: "رهش سمسمي ناعم ممزوج باللوز المطحون طحنًا ناعمًا.", price: 69, photo: "rahash-almond.jpg", best: true },
  { cat: "rahash", name: "رهش الزعتر", en: "Zaatar Rahash", desc: "نكهة مالحة من الزعتر العطري ضمن قوام الرهش السمسمي.", price: 69, photo: "rahash-zaatar.jpg", best: true },
  { cat: "rahash", name: "رهش سادة", en: "Plain Rahash", desc: "الرهش السمسمي التقليدي بقوامه الناعم ونكهته الأصيلة.", price: 69, photo: "rahash-plain.jpg" },
  { cat: "rahash", name: "رهش الكاكاو", en: "Cacao Rahash", desc: "رهش كلاسيكي ممزوج بالكاكاو للمسة شوكولاتة خفيفة.", price: 69, photo: "rahash-cacao.jpg" },
  { cat: "rahash", name: "رهش البندق", en: "Hazelnut Rahash", desc: "رهش كريمي غني بنكهة البندق المحمّص.", price: 69, photo: "rahash-hazelnut.jpg" },
  { cat: "rahash", name: "رهش القهوة", en: "Coffee Rahash", desc: "رهش سمسمي ممزوج بالقهوة لنكهة جريئة وعطرية.", price: 69, photo: "rahash-coffee.jpg" },
  { cat: "rahash", name: "رهش البرتقال", en: "Orange Rahash", desc: "رهش خفيف ممزوج بنكهة البرتقال الطبيعية.", price: 69, photo: "rahash-orange.jpg" },
  { cat: "rahash", name: "رهش الشوكولاتة الداكنة", en: "Dark Chocolate Rahash", desc: "رهش سمسمي غني ممزوج بالشوكولاتة الداكنة العميقة.", price: 69, photo: "rahash-dark-chocolate.jpg" },
  { cat: "rahash", name: "رهش الكراميل المملح", en: "Salted Caramel Rahash", desc: "رهش كريمي غني بنكهة الكراميل المملح.", price: 69, photo: "rahash-salted-caramel.jpg" },
  { cat: "rahash", name: "رهش الزعفران والهيل", en: "Saffron & Cardamom Rahash", desc: "رهش طحيني تقليدي منقوع بالزعفران الفاخر والهيل العطري بنكهة خليجية أصيلة.", price: 75, photo: "rahash-saffron-cardamom.jpg" },
  { cat: "rahash", name: "رهش الزعفران والهيل (خالٍ من السكر)", en: "Sugar Free Saffron & Cardamom Rahash", desc: "رهش طحيني خالٍ من السكر المضاف، منقوع بالزعفران والهيل بنكهة متوازنة.", price: 75, photo: "rahash-saffron-cardamom-sf.jpg" },
  { cat: "rahash", name: "رهش سادة (خالٍ من السكر)", en: "Sugar Free Plain Rahash", desc: "رهش سمسمي كلاسيكي بقوام ناعم وبدون سكر مضاف.", price: 69, photo: "rahash-plain-sf.jpg" },
  { cat: "rahash", name: "رهش الزعتر (خالٍ من السكر)", en: "Sugar Free Zaatar Rahash", desc: "رهش مالح بنكهة الزعتر، مُحضّر بدون سكر مضاف.", price: 69, photo: "rahash-zaatar-sf.jpg" },
  { cat: "rahash", name: "رهش الفستق (خالٍ من السكر)", en: "Sugar Free Pistachio Rahash", desc: "رهش سمسمي بالفستق، مُحلّى بدون سكر مضاف.", price: 69, photo: "rahash-pistachio-sf.jpg" },

  // ---------------- حلقوم / Şelbet ----------------
  { cat: "selbet", name: "حلقوم اللوتس بالفستق", en: "Lotus Pistachio Şelbet", desc: "حلقوم الفستق ممزوج بقطعة اللوتس لنكهة حلوة وغنية بالتوابل.", price: 78, photo: "selbet-lotus-pistachio.jpg" },
  { cat: "selbet", name: "حلقوم الرمان والفستق", en: "Pomegranate Pistachio Şelbet", desc: "مزيج نابض بالحياة من الرمان الحامض والفستق الغني.", price: 78, photo: "selbet-pomegranate-pistachio.jpg" },
  { cat: "selbet", name: "حلقوم الكراميل الإيطالي بالفستق", en: "Italian Caramel Pistachio Şelbet", desc: "حلقوم الفستق الكريمي ممزوج بنكهات الكراميل الإيطالي الناعمة.", price: 78, photo: "selbet-italian-caramel-pistachio.jpg" },
  { cat: "selbet", name: "حلقوم التوت البري والفستق", en: "Cranberry Pistachio Şelbet", desc: "مزيج منعش من التوت البري الحامض والفستق الغني في قوام ناعم.", price: 78, photo: "selbet-cranberry-pistachio.jpg" },
  { cat: "selbet", name: "حلقوم البندق بالشوكولاتة", en: "Hazelnut Chocolate Şelbet", desc: "حلقوم البندق الكلاسيكي مُغنى بالشوكولاتة لنكهة جريئة ومريحة.", price: 78, photo: "selbet-hazelnut-chocolate.jpg" },
  { cat: "selbet", name: "حلقوم أوريو بالبندق", en: "Oreo Hazelnut Şelbet", desc: "حلقوم البندق الكريمي ممزوج بفتات الأوريو بلمسة عصرية.", price: 78, photo: "selbet-oreo-hazelnut.jpg" },

  // ---------------- علب مميزة (Signature Boxes) ----------------
  { cat: "boxes", name: "الصندوق الملكي المتنوع", en: "Royal Assorted Box", desc: "صندوق متكامل يضم بسكويت محشو بالرهش، حلقوم، بيض شوكولاتة محشو بالرهش، تمر محشو، ومكسرات فاخرة مختارة — للتجمعات الفاخرة والإهداء الراقي.", price: 350, photo: "box-royal-assorted.jpg" },
  { cat: "boxes", name: "صندوق التمرية المميز", en: "Signature Tamrya Box", desc: "مكعب زجاجي فاخر مليء بقطع التمرية المصنوعة يدويًا ومغطاة بالسمسم الفاخر — للإهداء الراقي.", price: 85, photo: "box-signature-tamrya.jpg" },
  { cat: "boxes", name: "صينية تمرية بالسمسم", en: "Tamreya Sesame Bites Gift Tray", desc: "صينية هدايا دائرية فاخرة مليئة بقطع التمرية بالسمسم المغلّفة فرديًا — خيار مثالي لرمضان والمناسبات.", price: 175, photo: "box-tamreya-tray.jpg" },
  { cat: "boxes", name: "تمرية محشوة بالطحينة", en: "Tmreya Stuffed with Tahini", desc: "عجينة تمر طرية محشوة بالطحينة الناعمة لحلاوة متوازنة تمامًا.", price: 49, photo: "box-tamreya-tahini.jpg" },
  { cat: "boxes", name: "تشكيلة رهش وحلقوم", en: "Rahash & Şelbet Selection Box", desc: "بسكويت محشو بالرهش، تمر محشو بالرهش، ومكعبات حلقوم متنوعة.", price: 295, photo: "box-rahash-selbet.jpg" },
  { cat: "boxes", name: "صندوق التمر المحشو بالرهش", en: "Rahash Stuffed Dates Box", desc: "تمر فاخر محشو بالرهش الناعم ومغطى بالفستق والسمسم والشوكولاتة البيضاء.", price: 290, photo: "box-rahash-dates.jpg" },
  { cat: "boxes", name: "علبة حلقوم متنوعة", en: "Assorted Şelbet Box", desc: "تشكيلة من مكعبات الحلقوم بنكهات متنوعة حسب الاختيار.", price: 78, photo: "selbet-assorted.jpg" },

  // ---------------- مجموعة الشوكولاتة الفاخرة ----------------
  { cat: "chocolate", name: "علبة التشكيلة الفاخرة ١ كغ", en: "Luxury Selection Box 1kg", desc: "تشكيلة أنيقة من ست قطع شوكولاتة مصنوعة يدويًا، مُنتقاة بعناية لتجربة تذوق راقية.", price: 375, photo: "choco-luxury-1kg.jpg" },
  { cat: "chocolate", name: "علبة التشكيلة الفاخرة ٥٠٠ غ", en: "Luxury Selection Box 500g", desc: "ثلاثية من إبداعات رهش أفندي الشوكولاتية المميزة، لمن يقدّر الأناقة في كل قضمة.", price: 187.5, photo: "choco-luxury-500g.jpg" },
  { cat: "chocolate", name: "حلقوم الفستق بالشوكولاتة الداكنة ٢٥٠غ", en: "Dark Chocolate Pistachio Turkish Delight 250G", desc: "حلقوم طري بحشوة الفستق الغنية، مغطى بالشوكولاتة الداكنة الفاخرة.", price: 93.75, photo: "choco-dark-pistachio-delight.jpg" },
  { cat: "chocolate", name: "حلقوم الفستق بالشوكولاتة بالحليب ٢٥٠غ", en: "Milk Chocolate Pistachio Turkish Delight 250G", desc: "حلقوم طري بحشوة الفستق، مغطى بشوكولاتة الحليب الناعمة لمذاق متوازن.", price: 93.75, photo: "choco-milk-pistachio-delight.jpg" },
  { cat: "chocolate", name: "كورن فليكس روشيه ٢٠٠غ", en: "Corn Flakes Roche 200G", desc: "رقائق ذرة مقرمشة مغطاة بشوكولاتة الحليب الناعمة، بتوازن بين الغنى الكريمي والقرمشة.", price: 75, photo: "choco-cornflakes-roche.jpg" },
  { cat: "chocolate", name: "فستق بالشوكولاتة الداكنة (روش) ٢٠٠غ", en: "Pistachio Dark Chocolate Rosh 200G", desc: "فستق محمّص كامل مغطى بالشوكولاتة الداكنة الغنية لتجربة كاكاو مكثفة.", price: 75, photo: "choco-pistachio-dark-rosh.jpg" },
  { cat: "chocolate", name: "فستق بشوكولاتة الحليب (روش) ٢٠٠غ", en: "Pistachio Milk Chocolate Rosh 200G", desc: "فستق محمّص كامل مغطى بشوكولاتة الحليب الناعمة لمذاق كريمي ومقرمش.", price: 75, photo: "choco-pistachio-milk-rosh.jpg" },
];

const CAT_LABELS = {
  rahash: "رهش",
  selbet: "حلقوم",
  boxes: "صندوق هدايا",
  chocolate: "شوكولاتة",
};

// Full section headings for the grouped "all" view — mirrors the tab labels
// exactly so a visitor never loses track of which category they're in.
const GROUP_TITLES = {
  rahash: "رهش",
  selbet: "حلقوم (Şelbet)",
  boxes: "علب مميزة",
  chocolate: "مجموعة الشوكولاتة",
};

function formatPrice(p) {
  const n = Number.isInteger(p) ? p : p.toFixed(2);
  return `${n} ر.ق`;
}

function productCardHTML(item) {
  return `
    <article class="product-card" data-cat="${item.cat}">
      <div class="product-photo">
        <img src="assets/images/${item.photo}" alt="${item.name}" decoding="async"
             onerror="this.closest('.product-card').classList.remove('has-photo')"
             onload="this.closest('.product-card').classList.add('has-photo')">
        <span class="ph-fallback">${item.name}</span>
      </div>
      <div class="product-body">
        <span class="product-en">${CAT_LABELS[item.cat]}</span>
        <h3>${item.name}</h3>
        <p class="product-desc">${item.desc}</p>
        <div class="product-foot">
          <span class="product-price">${formatPrice(item.price)}</span>
          <a class="product-order" href="${ORDER_URL}" target="_blank" rel="noopener">اطلب الآن</a>
        </div>
      </div>
    </article>
  `;
}

function bestsellerCardHTML(item) {
  return `
    <a class="bs-card" href="${ORDER_URL}" target="_blank" rel="noopener">
      <div class="bs-photo">
        <img src="assets/images/${item.photo}" alt="${item.name}" decoding="async"
             onerror="this.closest('.bs-card').classList.remove('has-photo')"
             onload="this.closest('.bs-card').classList.add('has-photo')">
        <span class="bs-fallback">${item.name}</span>
      </div>
      <div class="bs-body">
        <h3>${item.name}</h3>
        <span class="bs-price">${formatPrice(item.price)}</span>
      </div>
    </a>
  `;
}

const CAT_ORDER = ["rahash", "selbet", "boxes", "chocolate"];

// ---------------- Card entrance (staggered fade-up on render) ----------------
function animateEntrance(container, selector) {
  if (prefersReduced) return;
  const items = container.querySelectorAll(selector);
  items.forEach(el => {
    el.classList.add("is-entering");
    el.style.transitionDelay = "0s";
  });
  // Force a reflow so the instant "entering" state is committed
  // before we transition back out of it.
  void container.offsetWidth;
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 12) * 40}ms`;
    el.classList.remove("is-entering");
  });
}

// ---------------- Card tilt + shine (follows the pointer) ----------------
function handleTiltMove(e) {
  const photo = e.currentTarget.querySelector(".product-photo, .bs-photo");
  if (!photo) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const max = 8;
  photo.style.setProperty("--tiltX", `${(0.5 - py) * max}deg`);
  photo.style.setProperty("--tiltY", `${(px - 0.5) * max}deg`);
  photo.style.setProperty("--tiltScale", "1.04");
  photo.style.setProperty("--mx", `${px * 100}%`);
  photo.style.setProperty("--my", `${py * 100}%`);
}
function handleTiltLeave(e) {
  const photo = e.currentTarget.querySelector(".product-photo, .bs-photo");
  if (!photo) return;
  photo.style.setProperty("--tiltX", "0deg");
  photo.style.setProperty("--tiltY", "0deg");
  photo.style.setProperty("--tiltScale", "1");
}
function bindTilt(container, cardSelector) {
  if (prefersReduced) return;
  container.querySelectorAll(cardSelector).forEach(card => {
    card.addEventListener("mousemove", handleTiltMove);
    card.addEventListener("mouseleave", handleTiltLeave);
  });
}

function renderProducts(filter = "all") {
  const grid = document.getElementById("productGrid");

  if (filter === "all") {
    // Grouped view: one labelled sub-section per category, so the grid
    // never blurs from one category straight into the next unlabelled.
    grid.innerHTML = CAT_ORDER.map(cat => {
      const items = PRODUCTS.filter(p => p.cat === cat);
      if (!items.length) return "";
      return `
        <div class="menu-group">
          <h3 class="menu-group-title">${GROUP_TITLES[cat]}</h3>
          <div class="product-grid">${items.map(productCardHTML).join("")}</div>
        </div>
      `;
    }).join("");
  } else {
    const items = PRODUCTS.filter(p => p.cat === filter);
    grid.innerHTML = `<div class="product-grid">${items.map(productCardHTML).join("")}</div>`;
  }

  animateEntrance(grid, ".product-card");
  bindTilt(grid, ".product-card");
}

function renderBestsellers() {
  const strip = document.getElementById("bestsellerStrip");
  const items = PRODUCTS.filter(p => p.best);
  strip.innerHTML = items.map(bestsellerCardHTML).join("");
  animateEntrance(strip, ".bs-card");
  bindTilt(strip, ".bs-card");
}

// ---------------- Category tab filtering ----------------
function initTabs() {
  const tabs = document.querySelectorAll(".cat-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      renderProducts(tab.dataset.cat);
    });
  });
}

// ---------------- Links that jump to a filtered category ----------------
// Any <a data-cat-link="boxes" href="#menu"> activates that category tab
// (updating the grid + the tab's active state) before the browser's own
// anchor scroll takes over, so the visitor lands on the filtered results
// instead of "All".
function initCatLinks() {
  document.querySelectorAll("[data-cat-link]").forEach(link => {
    link.addEventListener("click", () => {
      const cat = link.dataset.catLink;
      const tab = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
      if (!tab) return;
      document.querySelectorAll(".cat-tab").forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      renderProducts(cat);
    });
  });
}

// ---------------- Magnetic CTA buttons ----------------
function initMagneticButtons() {
  if (prefersReduced) return;
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.setProperty("--mx", `${x}px`);
      btn.style.setProperty("--my", `${y}px`);
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--mx", "0px");
      btn.style.setProperty("--my", "0px");
    });
  });
}

// ---------------- Header scroll state ----------------
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------------- Mobile nav toggle ----------------
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
  });
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------------- Opening seal animation ----------------
// Plays once per browsing session — a returning visitor who reloads or
// revisits a section shouldn't have to sit through the intro again.
function initSplash() {
  const splash = document.getElementById("splash");
  let seenBefore = false;
  try {
    seenBefore = sessionStorage.getItem("rahashSplashSeen") === "1";
  } catch (e) {
    // Storage unavailable (private mode, etc.) — fall back to always showing it.
  }

  if (prefersReduced || seenBefore) {
    splash.classList.add("skip");
    return;
  }

  try {
    sessionStorage.setItem("rahashSplashSeen", "1");
  } catch (e) {}

  // Trigger the sequence
  requestAnimationFrame(() => splash.classList.add("run"));

  // Remove from layout once the iris-out finishes (~2.6s total)
  window.setTimeout(() => splash.classList.add("skip"), 2700);
}

// ---------------- Scroll story (pinned, progress-driven) ----------------
function initScrollStory() {
  const section = document.getElementById("scrollstory");
  if (!section) return;
  const imgs = section.querySelectorAll(".ss-img");
  const caps = section.querySelectorAll(".ss-caption");
  const dots = section.querySelectorAll(".ss-dot");
  const media = section.querySelector(".ss-media");
  const captionsEl = section.querySelector(".ss-captions");
  const steps = imgs.length;
  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    let progress = scrollable > 0 ? -rect.top / scrollable : 0;
    progress = Math.min(1, Math.max(0, progress));
    const stepFloat = progress * steps;
    let step = Math.floor(stepFloat);
    if (step >= steps) step = steps - 1;
    if (step < 0) step = 0;

    imgs.forEach((img, i) => img.classList.toggle("is-active", i === step));
    caps.forEach((c, i) => c.classList.toggle("is-active", i === step));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === step));

    // Subtle depth: the background photo and the foreground caption drift
    // at different rates within each step, reading as parallax instead of
    // a flat cross-fade.
    if (!prefersReduced && media && captionsEl) {
      const local = Math.min(1, Math.max(0, stepFloat - step));
      media.style.transform = `translateY(${(local - 0.5) * 36}px)`;
      captionsEl.style.transform = `translateY(${(0.5 - local) * 12}px)`;
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

// ---------------- Footer year ----------------
function initYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  renderBestsellers();
  renderProducts("all");
  initTabs();
  initCatLinks();
  initHeaderScroll();
  initMobileNav();
  initMagneticButtons();
  initSplash();
  initScrollStory();
  initYear();
});
