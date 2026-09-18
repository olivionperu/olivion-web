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
const targets = document.querySelectorAll(".card,.steps li,.work__copy,.work__img,.about > *,.cta__in > *,.sec__head,.strip__in div");
targets.forEach((t) => t.classList.add("rv"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.12 }
  );
  targets.forEach((t) => io.observe(t));
} else targets.forEach((t) => t.classList.add("in"));

document.getElementById("year").textContent = new Date().getFullYear();
