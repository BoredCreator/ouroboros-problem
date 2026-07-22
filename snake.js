/* The ouroboros as site structure: every section is a segment of the snake.
   buildHub()  — full-size interactive ring on the home page (nodes = pages).
   buildMini() — small page-locator ring on every inner page. */

(function () {
  const NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function polar(cx, cy, r, a) {
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  // Body of tapering dots + head biting the red tail tip. Returns angle helpers.
  function drawSnake(svg, o) {
    const a0 = o.start + o.gap;
    const span = 2 * Math.PI - 2 * o.gap;

    for (let i = 0; i < o.segs; i++) {
      const t = i / (o.segs - 1);
      const [x, y] = polar(o.cx, o.cy, o.r, a0 + t * span);
      const r = o.rMin + (o.rMax - o.rMin) * Math.pow(1 - t, 1.35);
      const c = el("circle", { cx: x, cy: y, r: r.toFixed(2), class: "seg" });
      if (o.wave) c.style.animationDelay = (t * 5.2) + "s";
      if (i === o.segs - 1) {
        c.setAttribute("class", "seg tailtip");
        c.setAttribute("r", (o.rMax * 0.28).toFixed(2));
      }
      svg.appendChild(c);
    }

    // Head fused to the thick neck, mouth open toward the tail.
    const ha = o.start + o.gap * 0.55;
    const [hx, hy] = polar(o.cx, o.cy, o.r, ha);
    svg.appendChild(el("circle", { cx: hx, cy: hy, r: o.rMax * 1.55, class: "seg head" }));
    const [ex, ey] = polar(o.cx, o.cy, o.r + o.rMax * 0.45, ha - 0.04);
    svg.appendChild(el("circle", { cx: ex, cy: ey, r: o.rMax * 0.44, class: "eye" }));
    svg.appendChild(el("circle", { cx: ex, cy: ey, r: o.rMax * 0.2, class: "pupil" }));

    return { a0: a0, span: span };
  }

  window.buildHub = function (svg, pages, current) {
    const CX = 400, CY = 400, R = 300;
    const ring = drawSnake(svg, {
      cx: CX, cy: CY, r: R, start: -Math.PI / 2, gap: 0.30,
      segs: 110, rMin: 2.5, rMax: 11, wave: true
    });

    // Orbit path for the traveling red reader-dot (clockwise, reading order).
    const d = "M " + CX + " " + (CY - R) +
              " A " + R + " " + R + " 0 1 1 " + CX + " " + (CY + R) +
              " A " + R + " " + R + " 0 1 1 " + CX + " " + (CY - R);
    const orbit = el("path", { id: "orbit", d: d, fill: "none", stroke: "none" });
    svg.appendChild(orbit);
    const trav = el("circle", { r: 5.5, class: "traveler" });
    const mo = el("animateMotion", { dur: "36s", repeatCount: "indefinite" });
    const mp = el("mpath", {});
    mp.setAttribute("href", "#orbit");
    mp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#orbit");
    mo.appendChild(mp);
    trav.appendChild(mo);
    svg.appendChild(trav);

    // Section nodes: the pages ARE segments of the snake. 01 sits just behind
    // the head; 11 (Works Cited) ends at the tail being eaten.
    pages.forEach(function (p, i) {
      const t = (i + 1) / (pages.length + 1);
      const a = ring.a0 + t * ring.span;
      const [x, y] = polar(CX, CY, R, a);

      const link = el("a", { class: "node" + (i === current ? " cur" : "") });
      link.setAttribute("href", p.href);
      link.setAttribute("aria-label", p.num + " " + p.label);

      link.appendChild(el("circle", { cx: x, cy: y, r: 16 }));

      const num = el("text", {
        x: x, y: y, class: "nnum",
        "text-anchor": "middle", "dominant-baseline": "central"
      });
      num.textContent = p.num;
      link.appendChild(num);

      const [lx, ly] = polar(CX, CY, R + 44, a);
      const lab = el("text", { x: lx, y: ly, class: "nlabel" });
      const c = Math.cos(a), s = Math.sin(a);
      lab.setAttribute("text-anchor", c > 0.25 ? "start" : (c < -0.25 ? "end" : "middle"));
      lab.setAttribute("dominant-baseline", s > 0.25 ? "hanging" : (s < -0.25 ? "auto" : "central"));
      lab.textContent = p.label;
      link.appendChild(lab);

      svg.appendChild(link);
    });
  };

  window.buildMini = function (svg, pages, current) {
    const CX = 60, CY = 60, R = 44;
    const ring = drawSnake(svg, {
      cx: CX, cy: CY, r: R, start: -Math.PI / 2, gap: 0.42,
      segs: 46, rMin: 0.9, rMax: 4.6, wave: false
    });

    pages.forEach(function (p, i) {
      const t = (i + 1) / (pages.length + 1);
      const a = ring.a0 + t * ring.span;
      const [x, y] = polar(CX, CY, R, a);

      const link = el("a", { class: "mnode" + (i === current ? " cur" : "") });
      link.setAttribute("href", p.href);
      link.setAttribute("aria-label", p.num + " " + p.label);
      const title = el("title", {});
      title.textContent = p.num + " · " + p.label;
      link.appendChild(title);
      link.appendChild(el("circle", { cx: x, cy: y, r: i === current ? 6 : 4.4 }));
      svg.appendChild(link);
    });
  };
})();
