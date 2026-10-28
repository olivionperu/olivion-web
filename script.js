// ===== CONFIGURACIÓN =====
// Escribe tu número de WhatsApp con código de país, sin "+" ni espacios (Perú = 51). Ej: "51987654321"
// Mientras esté vacío, los botones abren el chat de Instagram @olivion.pe.
const WHATSAPP = "51948448130";
const IG_DM = "https://ig.me/m/olivion.pe";
// Pega aquí el enlace de tu LinkedIn personal (https://www.linkedin.com/in/...). Mientras esté vacío, el botón no se muestra.
const LINKEDIN = "https://www.linkedin.com/in/pedro-joaquin-olivera-novoa-2276a7305/";
// =========================

const waLink = (text) =>
  WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
    : IG_DM;

// LinkedIn del fundador
const inBtn = document.getElementById("founderIn");
if (inBtn && LINKEDIN) { inBtn.href = LINKEDIN; inBtn.hidden = false; }

// Botones de contacto
document.querySelectorAll("[data-contact]").forEach((a) => {
  a.href = waLink("Hola Olivion, quisiera cotizar una página web para mi negocio.");
  if (!WHATSAPP && a.classList.contains("btn--wa")) {
    a.textContent = "Escribir por Instagram";
    a.classList.remove("btn--wa");
  }
});

// Botones de "demo gratis" y "cupo fundador" -> WhatsApp con mensaje listo
document.querySelectorAll("[data-demo]").forEach((a) => {
  a.href = waLink("Hola Olivion, quiero mi demo gratis. Mi negocio es: ");
});
document.querySelectorAll("[data-fund]").forEach((a) => {
  a.href = waLink("Hola Olivion, quiero postular a un cupo de cliente fundador. Mi negocio es: ");
});

// Medición: cuenta los clics hacia WhatsApp/contacto si Vercel Web Analytics está activo.
// (Los eventos personalizados dependen del plan de Vercel; si no aplican, no pasa nada.)
const track = (name, data) => {
  try { if (window.va) window.va("event", { name, data }); } catch (_) {}
};
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-contact],[data-demo],[data-fund],[data-plan]");
  if (!a) return;
  const tipo = a.hasAttribute("data-founder") || a.hasAttribute("data-fund") ? "fundador" : a.hasAttribute("data-plan") ? "paquete" : a.hasAttribute("data-demo") ? "demo" : "contacto";
  track("cta_click", { tipo, paquete: a.dataset.plan || "" });
});

// Móvil: desplegable "Qué incluye" en cada paquete y preguntas cerradas al inicio
document.querySelectorAll(".plan__toggle").forEach((b) => b.addEventListener("click", () => {
  const open = b.closest(".plan").classList.toggle("open");
  b.setAttribute("aria-expanded", String(open));
}));
if (matchMedia("(max-width:760px)").matches) document.querySelectorAll(".faq__item[open]").forEach((d) => d.removeAttribute("open"));

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
// Vista previa del mensaje (burbuja tipo WhatsApp) que se actualiza mientras escribes
const bubble = document.getElementById("bubble");
const buildMsg = () => {
  const d = Object.fromEntries(new FormData(form));
  const nombre = (d.nombre || "").trim();
  const negocio = (d.negocio || "").trim();
  return (
    `Hola Olivion, soy ${nombre || "…"}.` +
    (negocio ? ` Mi negocio: ${negocio}.` : "") +
    ` Necesito: ${d.servicio}.`
  );
};
const paintBubble = () => { if (bubble) bubble.textContent = buildMsg(); };
form.addEventListener("input", paintBubble);
form.addEventListener("change", paintBubble);
paintBubble();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = form.nombre;
  const vacio = !nombre.value.trim();
  nombre.classList.toggle("err", vacio);
  if (vacio) return nombre.focus();
  const msg = buildMsg();
  if (!WHATSAPP) { try { await navigator.clipboard.writeText(msg); } catch (_) {} }
  track("form_enviado", { servicio: new FormData(form).get("servicio") });
  window.open(waLink(msg), "_blank", "noopener");
});

// Aparición suave al hacer scroll
const targets = document.querySelectorAll(".card,.work__copy,.work__img,.about > *,.founder,.founder__story,.cta__in > *,.sec__head,.strip__in div,.plan,.plans__extra,.fund__copy,.slot,.faq__head,.faq__item");
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
  let W = 0, pos = 0, vel = 0, dragging = false, hover = false, lastX = 0, lastT = 0, moved = 0, pid = 0, captured = false;

  const build = () => {
    track.querySelectorAll(".mq__set[data-clone]").forEach((n) => n.remove());
    W = first.offsetWidth;
    if (!W) return;
    const copies = Math.ceil(mq.offsetWidth / W) + 1;
    for (let i = 0; i < copies; i++) {
      const c = first.cloneNode(true);
      c.dataset.clone = "1";
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("a").forEach((a) => { a.tabIndex = -1; });
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
    dragging = true; vel = 0; moved = 0; lastX = e.clientX; lastT = performance.now();
    mq.classList.add("is-drag");
    pid = e.pointerId; captured = false; // se captura solo si de verdad se arrastra, para no romper los clics en las demos
  });
  mq.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    pos += dx;
    moved += Math.abs(dx);
    if (!captured && moved > 6) { captured = true; try { mq.setPointerCapture(pid); } catch (_) {} }
    apply();
    vel = (dx / Math.max(now - lastT, 1)) * 1000 * 0.6 + vel * 0.4;
    lastX = e.clientX; lastT = now;
  });
  const end = () => { dragging = false; captured = false; mq.classList.remove("is-drag"); };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => mq.addEventListener(t, end));
  mq.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
  mq.addEventListener("pointerleave", () => { hover = false; });
  mq.addEventListener("dragstart", (e) => e.preventDefault());
  // Si el gesto fue un arrastre, no abre la demo
  mq.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
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
  a.href = waLink(a.hasAttribute("data-founder")
    ? `Hola Olivion, quiero postular al precio fundador del paquete ${a.dataset.plan}. ¿Todavía hay cupos?`
    : `Hola Olivion, me interesa el paquete ${a.dataset.plan}. ¿Me pueden dar más información?`);
});

document.getElementById("year").textContent = new Date().getFullYear();
