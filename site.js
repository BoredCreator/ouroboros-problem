/* Shared site behavior: scroll-triggered reveals + stamp filter defs.
   No dependencies. Respects prefers-reduced-motion. */
(function () {
  // Roughened-stamp SVG filter, referenced by .stampbox via filter: url(#stamp-rough)
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  defs.innerHTML =
    '<filter id="stamp-rough" x="-5%" y="-5%" width="110%" height="110%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="2" seed="7" result="n"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>' +
    "</filter>";
  document.body.appendChild(defs);

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal, .stamp, .rule-draw");

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("on"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );
  // Anything already within the first viewport reveals immediately —
  // no first-paint window where above-the-fold content sits hidden.
  var vh = window.innerHeight || document.documentElement.clientHeight;
  targets.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > 0) {
      el.classList.add("on");
    } else {
      io.observe(el);
    }
  });
})();
