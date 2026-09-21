// ===== CONFIGURACIÓN =====
// Escribe tu número de WhatsApp con código de país, sin "+" ni espacios (Perú = 51). Ej: "51987654321"
// Mientras esté vacío, los botones abren el chat de Instagram @olivion.pe.
const WHATSAPP = "51948448130";
const IG_DM = "https://ig.me/m/olivion.pe";
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
const targets = document.querySelectorAll(".card,.work__copy,.work__img,.about > *,.founder,.founder__story,.cta__in > *,.sec__head,.strip__in div,.plan,.plans__extra,.faq__head,.faq__item");
targets.forEach((t) => t.classList.add("rv"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  targets.forEach((t) => io.observe(t));
} else targets.forEach((t) => t.classList.add("in"));

// Carrusel de proyectos: avanza solo y se puede arrastrar con el dedo o el puntero
(() => {
  const mq = document.querySelector(".mq");
  const track = document.getElementById("mq");
  if (!mq || !track) return;
  const first = track.querySelector(".mq__set");
  const SPEED = 36; // px por segundo
  let W = 0, pos = 0, vel = 0, dragging = false, hover = false, lastX = 0, lastT = 0;

  const build = () => {
    track.querySelectorAll(".mq__set[data-clone]").forEach((n) => n.remove());
    W = first.offsetWidth;
    if (!W) return;
    const copies = Math.ceil(mq.offsetWidth / W) + 1;
    for (let i = 0; i < copies; i++) {
      const c = first.cloneNode(true);
      c.dataset.clone = "1";
      c.setAttribute("aria-hidden", "true");
      track.appendChild(c);
    }
  };
  build();
  addEventListener("load", build);
  addEventListener("resize", build);

  const apply = () => {
    if (W) { pos %= W; if (pos > 0) pos -= W; }
    track.style.transform = `translate3d(${pos}px,0,0)`;
  };
  let prev = performance.now();
  const tick = (now) => {
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    if (!dragging) {
      if (Math.abs(vel) > 8) { pos += vel * dt; vel *= Math.pow(0.02, dt); }
      else if (!hover) pos -= SPEED * dt;
    }
    apply();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  mq.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true; vel = 0; lastX = e.clientX; lastT = performance.now();
    mq.classList.add("is-drag");
    try { mq.setPointerCapture(e.pointerId); } catch (_) {}
  });
  mq.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    pos += dx;
    apply();
    vel = (dx / Math.max(now - lastT, 1)) * 1000 * 0.6 + vel * 0.4;
    lastX = e.clientX; lastT = now;
  });
  const end = () => { dragging = false; mq.classList.remove("is-drag"); };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => mq.addEventListener(t, end));
  mq.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
  mq.addEventListener("pointerleave", () => { hover = false; });
  mq.addEventListener("dragstart", (e) => e.preventDefault());
})();

// Camino de proceso: la línea se llena al bajar y cada paso se enciende
(() => {
  const path = document.getElementById("path");
  if (!path) return;
  const steps = [...path.querySelectorAll(".step")];
  const nodes = steps.map((s) => s.querySelector(".step__node"));
  let y0 = 29, h = 0, centers = [];

  const measure = () => {
    const pr = path.getBoundingClientRect();
    const cs = nodes.map((n) => { const r = n.getBoundingClientRect(); return r.top - pr.top + r.height / 2; });
    y0 = cs[0]; h = cs[cs.length - 1] - cs[0];
    centers = cs.map((c) => c - y0);
    path.style.setProperty("--y0", y0 + "px");
    path.style.setProperty("--h", h + "px");
    update();
  };
  const update = () => {
    const pr = path.getBoundingClientRect();
    const raw = innerHeight * 0.55 - pr.top - y0;
    path.style.setProperty("--head", Math.min(Math.max(raw, 0), h) + "px");
    let last = -1;
    steps.forEach((s, i) => { const on = raw >= centers[i] - 2; s.classList.toggle("on", on); if (on) last = i; });
    steps.forEach((s, i) => s.classList.toggle("now", i === last));
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", measure);
  addEventListener("load", measure);
  measure();
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
    const card = e.target.closest && e.target.closest(".mq");
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

// Botones "Cotiza aquí" de los paquetes -> WhatsApp con el paquete elegido
document.querySelectorAll("[data-plan]").forEach((a) => {
  a.href = waLink(`Hola Olivion, me interesa el paquete ${a.dataset.plan}. ¿Me pueden dar más información?`);
});

document.getElementById("year").textContent = new Date().getFullYear();
