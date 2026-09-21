// Personaliza el prototipo con parámetros en el enlace:
//   ?n=Nombre de la veterinaria  &d=Distrito  &c=0f8f83 (color, sin #)  &w=51999999999 (WhatsApp del negocio, opcional)
// Ejemplo: /demo/veterinaria/?n=Vet%20San%20Roque&d=Surco&c=1d4ed8
const OLIVION_WA = "51948448130";
const q = new URLSearchParams(location.search);
const brand = (q.get("n") || "").trim().slice(0, 40) || "Huella Viva";
const city = (q.get("d") || "").trim().slice(0, 30) || "Lima";
const color = (q.get("c") || "").replace("#", "");
const wa = (q.get("w") || "").replace(/\D/g, "");

document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = brand));
document.querySelectorAll("[data-city]").forEach((el) => (el.textContent = city));
document.title = `${brand} | Veterinaria en ${city} (prototipo de Olivion)`;
if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) document.documentElement.style.setProperty("--brand", "#" + color);
if (q.get("n")) document.getElementById("forWho").textContent = " para " + brand;

const link = (num, text) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = wa
    ? link(wa, `Hola ${brand}, quiero agendar una cita para mi mascota.`)
    : link(OLIVION_WA, "Hola Olivion, vi el prototipo de veterinaria y quiero uno para mi negocio.");
});
document.querySelectorAll("[data-olivion]").forEach((a) => {
  a.href = link(OLIVION_WA, "Hola Olivion, vi el prototipo de veterinaria y quiero uno para mi negocio.");
});
