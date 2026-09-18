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
const targets = document.querySelectorAll(".card,.steps li,.work__copy,.work__img,.about > *,.cta__in > *,.sec__head,.strip__in div,.plan,.plans__extra,.faq__head,.faq__item");
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

// Botones "Cotiza aquí" de los paquetes -> WhatsApp con el paquete elegido
document.querySelectorAll("[data-plan]").forEach((a) => {
  a.href = waLink(`Hola Olivion, me interesa el paquete ${a.dataset.plan}. ¿Me pueden dar más información?`);
});

document.getElementById("year").textContent = new Date().getFullYear();
