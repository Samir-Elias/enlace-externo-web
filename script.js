/* ═══════════════════════════════════════════════════════════════
   ENLACE EXTERNO — PIEZA 335 · script.js
   Vanilla, sin frameworks. Reveals, señal única por pieza,
   barra de posteo sticky, carrusel y chat que tipea.
   ═══════════════════════════════════════════════════════════════ */

const WHATSAPP_NUMBER = "5490000000000"; // TODO: reemplazar por el número real de la empresa (549...)
const WHATSAPP_TEXT = "Hola! Vengo de la web 👋";
const EMAIL_CONTACTO = ""; // Reservado. NO publicar en el sitio hasta que se autorice.

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Links de WhatsApp: todos los CTA arman wa.me desde la constante ── */
  var waHref =
    "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(WHATSAPP_TEXT);
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    a.href = waHref;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ── 2. Counters (10 años, 8 días) ── */
  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var target = parseInt(el.dataset.count, 10);
    if (reduced || isNaN(target)) {
      el.textContent = el.dataset.count;
      return;
    }
    var dur = 1000;
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── 3. Chat que tipea (una sola vez, al entrar en viewport) ── */
  var chatDone = false;
  function runChat() {
    if (chatDone) return;
    chatDone = true;
    var msgs = Array.prototype.slice.call(document.querySelectorAll(".chat .msg"));
    if (!msgs.length) return;
    if (reduced) {
      msgs.forEach(function (m) { m.classList.add("show"); });
      return;
    }
    var i = 0;
    function next() {
      if (i >= msgs.length) return;
      var m = msgs[i++];
      if (m.classList.contains("in")) {
        m.classList.add("typing", "show");
        setTimeout(function () {
          m.classList.remove("typing");
          setTimeout(next, 900);
        }, 1100);
      } else {
        m.classList.add("show");
        setTimeout(next, 800);
      }
    }
    setTimeout(next, 400);
  }

  /* ── 4. Reveals por pieza + encendido de señal ── */
  var piezas = Array.prototype.slice.call(document.querySelectorAll(".pieza"));

  function encender(pieza) {
    pieza.classList.add("on");
    pieza.querySelectorAll("[data-count]").forEach(runCounter);
    if (pieza.id === "pieza-03") runChat();
  }

  if (reduced || !("IntersectionObserver" in window)) {
    piezas.forEach(encender);
  } else {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            encender(e.target);
            revObs.unobserve(e.target);
          }
        });
      },
      // threshold 0: una sección más alta que el viewport nunca alcanza un
      // porcentaje visible alto — con 0 dispara apenas asoma tras el margen
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    piezas.forEach(function (p) { revObs.observe(p); });
  }

  /* ── 5. Barra de posteo sticky: pill de sección + paginación viva ── */
  var pillSeccion = document.getElementById("pill-seccion");
  var pagLinks = Array.prototype.slice.call(document.querySelectorAll(".pag-bar a"));

  function setActiva(pieza) {
    if (pillSeccion && pieza.dataset.label) pillSeccion.textContent = pieza.dataset.label;
    var idx = piezas.indexOf(pieza) + 1;
    pagLinks.forEach(function (a) {
      if (parseInt(a.dataset.i, 10) === idx) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var barObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActiva(e.target);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    piezas.forEach(function (p) { barObs.observe(p); });
  }

  /* ── 6. Línea de progreso lima (barra de stories) ── */
  var progress = document.getElementById("progress");
  var ticking = false;
  function updateProgress() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = (p * 100).toFixed(2) + "%";
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    },
    { passive: true }
  );
  updateProgress();

  /* ── 7. Carrusel de casos: paginación + flechas fallback ── */
  var carrusel = document.getElementById("carrusel");
  var pagCarrusel = document.getElementById("pag-carrusel");
  var prevBtn = document.getElementById("caso-prev");
  var nextBtn = document.getElementById("caso-next");

  if (carrusel) {
    var casos = Array.prototype.slice.call(carrusel.querySelectorAll(".caso"));
    var dots = pagCarrusel
      ? Array.prototype.slice.call(pagCarrusel.querySelectorAll("span"))
      : [];

    function pasoCarrusel() {
      if (casos.length < 2) return 0;
      return casos[1].offsetLeft - casos[0].offsetLeft;
    }

    function updateCarruselPag() {
      var paso = pasoCarrusel();
      if (!paso) return;
      var idx = Math.round(carrusel.scrollLeft / paso);
      idx = Math.max(0, Math.min(idx, casos.length - 1));
      dots.forEach(function (d, i) {
        d.classList.toggle("act", i === idx);
      });
    }

    var cTick = false;
    carrusel.addEventListener(
      "scroll",
      function () {
        if (!cTick) {
          cTick = true;
          requestAnimationFrame(function () {
            cTick = false;
            updateCarruselPag();
          });
        }
      },
      { passive: true }
    );

    function moverCarrusel(dir) {
      carrusel.scrollBy({
        left: dir * pasoCarrusel(),
        behavior: reduced ? "auto" : "smooth"
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { moverCarrusel(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { moverCarrusel(1); });
  }
})();
