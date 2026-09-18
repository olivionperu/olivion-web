// ===== CONFIGURACIÓN =====
// Escribe tu número de WhatsApp con código de país, sin "+" ni espacios (Perú = 51). Ej: "51987654321"
// Mientras esté vacío, los botones abren el chat de Instagram @olivion.pe.
const WHATSAPP = "51948448130";
const IG_DM = "https://ig.me/m/olivionperu";
// =========================

const waLink = (text) =>
  WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
    : IG_DM;

// Botones de contacto
document.querySelectorAll("[data-contact]").forEach((a) => {
  a.href = waLink("Hola Olivion, quisiera cotizar una página web para mi negocio.");
  if (!WHATSAPP && a.classList.contains("btn--wa")) {
    a.textContent = "Escribir por Instagram";
    a.classList.remove("btn--wa");
  }
});

// Menú móvil
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
const setMenu = (open) => {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
};
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Formulario -> WhatsApp (o Instagram)
const form = document.getElementById("form");
const hint = document.getElementById("hint");
if (!WHATSAPP) hint.textContent = "Al enviar, se copiará tu mensaje y se abrirá el chat de Instagram.";
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const nombre = form.nombre;
  nombre.classList.toggle("err", !d.nombre.trim());
  if (!d.nombre.trim()) return nombre.focus();
  const msg =
    `Hola Olivion, soy ${d.nombre.trim()}.` +
    (d.negocio.trim() ? ` Mi negocio: ${d.negocio.trim()}.` : "") +
    ` Necesito: ${d.servicio}.` +
    (d.mensaje.trim() ? ` ${d.mensaje.trim()}` : "");
  if (!WHATSAPP) { try { await navigator.clipboard.writeText(msg); } catch (_) {} }
  window.open(waLink(msg), "_blank", "noopener");
});

// Aparición suave al hacer scroll
const targets = document.querySelectorAll(".card,.steps li,.work__copy,.work__img,.about > *,.cta__in > *,.sec__head,.strip__in div,.q-step,.receipt,.faq__head,.faq__item");
targets.forEach((t) => t.classList.add("rv"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  targets.forEach((t) => io.observe(t));
} else targets.forEach((t) => t.classList.add("in"));

// Carrusel de proyectos del hero: se duplica solo para que el bucle sea continuo
(() => {
  const track = document.getElementById("mq");
  if (!track) return;
  const set = track.querySelector(".mq__set");
  const clone = set.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone);
})();

// ===== Cursor interactivo =====
(() => {
  if (!matchMedia("(pointer: fine)").matches) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ring = document.querySelector(".cursor-ring");
  const dot = document.querySelector(".cursor-dot");
  if (!ring || !dot) return;
  const root = document.documentElement;
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    root.classList.add("has-cursor");
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
  });
  const follow = () => {
    const k = reduce ? 1 : 0.18;
    rx += (mx - rx) * k; ry += (my - ry) * k;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(follow);
  };
  follow();

  const linkSel = "a,button,summary,label,select,[data-cursor]";
  document.addEventListener("mouseover", (e) => {
    const card = e.target.closest && e.target.closest(".mq__card");
    const link = e.target.closest && e.target.closest(linkSel);
    ring.classList.toggle("is-card", !!card);
    ring.classList.toggle("is-link", !!link && !card);
  });
  addEventListener("mousedown", () => ring.classList.add("is-down"));
  addEventListener("mouseup", () => ring.classList.remove("is-down"));
  document.addEventListener("mouseleave", () => root.classList.remove("has-cursor"));
})();

// ===== Luz en el hero y botones magnéticos =====
(() => {
  const hero = document.getElementById("hero");
  const spot = document.querySelector(".spot");
  if (hero && spot) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      spot.style.setProperty("--mx", e.clientX - r.left + "px");
      spot.style.setProperty("--my", e.clientY - r.top + "px");
    });
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll(".btn").forEach((b) => {
    b.addEventListener("mousemove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty("--tx", ((e.clientX - r.left - r.width / 2) / r.width) * 10 + "px");
      b.style.setProperty("--ty", ((e.clientY - r.top - r.height / 2) / r.height) * 8 + "px");
    });
    b.addEventListener("mouseleave", () => {
      b.style.setProperty("--tx", "0px");
      b.style.setProperty("--ty", "0px");
    });
  });
})();

// ===== Cotizador =====
(() => {
  const form = document.querySelector(".quote__form");
  if (!form) return;

  // PRECIOS: escribe el monto en soles (número) para mostrarlo en el recibo. Con null se muestra "A cotizar".
  const PRICES = {
    tipo: { landing: null, web: null, tienda: null, medida: null },
    extra: { blog: null, reservas: null, idioma: null, catalogo: null },
    mensual: { mantenimiento: null },
  };
  const LABELS = {
    tipo: {
      landing: ["Landing", "Una sola página"],
      web: ["Web completa", "Varias páginas"],
      tienda: ["Tienda o catálogo", "Carrito o cotización"],
      medida: ["Software a medida", "Un sistema propio"],
    },
    extra: { blog: ["Blog"], reservas: ["Reservas o citas"], idioma: ["Segundo idioma"], catalogo: ["Catálogo de productos"] },
    mensual: { mantenimiento: ["Soporte y mantenimiento"] },
  };
  const money = (n) => "S/ " + n.toLocaleString("es-PE");
  const $ = (id) => document.getElementById(id);
  const lines = $("qLines"), total = $("qTotal"), note = $("qNote"), cta = $("qCta");
  $("qDate").textContent = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  const render = () => {
    const tipo = form.querySelector("input[name=tipo]:checked").value;
    const extras = [...form.querySelectorAll("input[name=extra]:checked")].map((i) => i.value);
    const mens = [...form.querySelectorAll("input[name=mensual]:checked")].map((i) => i.value);
    const items = [["tipo", tipo, false], ...extras.map((v) => ["extra", v, false]), ...mens.map((v) => ["mensual", v, true])];

    lines.innerHTML = "";
    let sum = 0, unknown = false, mSum = 0, mUnknown = false;
    items.forEach(([g, v, monthly]) => {
      const [name, sub] = LABELS[g][v];
      const price = PRICES[g][v];
      const row = document.createElement("div");
      row.className = "r-line";
      const left = document.createElement("span");
      left.textContent = (g === "extra" ? "+ " : "") + name;
      const detail = monthly ? "Cada mes" : sub;
      if (detail) { const s = document.createElement("small"); s.textContent = detail; left.appendChild(s); }
      const right = document.createElement("em");
      right.textContent = price == null ? "A cotizar" : money(price) + (monthly ? "/mes" : "");
      row.append(left, right);
      lines.appendChild(row);
      if (monthly) { price == null ? (mUnknown = true) : (mSum += price); }
      else { price == null ? (unknown = true) : (sum += price); }
    });

    total.textContent = unknown ? "A cotizar" : money(sum);
    total.classList.remove("bump"); void total.offsetWidth; total.classList.add("bump");
    const extraNote = mens.length ? (mUnknown ? " Mensualidad a cotizar." : ` + ${money(mSum)} al mes.`) : "";
    note.textContent = unknown || mUnknown
      ? "Cotización referencial. Confirmamos precio y plazo por WhatsApp."
      : "Cotización referencial." + extraNote + " Confirmamos plazo por WhatsApp.";

    const parts = items.filter((i) => !i[2]).map(([g, v]) => LABELS[g][v][0]);
    let msg = `Hola Olivion, armé mi cotización: ${parts[0]}`;
    if (parts.length > 1) msg += ` con ${parts.slice(1).join(", ")}`;
    if (mens.length) msg += `. Mensual: ${mens.map((v) => LABELS.mensual[v][0]).join(", ")}`;
    msg += ". ¿Me pueden enviar el precio y el plazo?";
    cta.href = waLink(msg);
  };
  form.addEventListener("change", render);
  render();
})();

document.getElementById("year").textContent = new Date().getFullYear();
