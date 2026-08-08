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

  /* Body of tightly packed tapering dots. The tail runs up to the open jaws;
     the red tail tip floats in the middle of the mouth, mid-bite. The head is
     an open-jawed wedge (pac-man cut) fused to the neck. Returns helpers. */
  function drawSnake(svg, o) {
    const a0 = o.start + o.gap;                  // neck, just past the mouth
    const ha = o.start + o.gap * 0.5;            // head centre on the ring
    const H = o.rMax * 2.0;                      // head radius
    const [hx, hy] = polar(o.cx, o.cy, o.r, ha);

    // Mouth aims across the gap at the incoming tail.
    const [mx, my] = polar(o.cx, o.cy, o.r, o.start - o.gap * 0.5);
    const theta = Math.atan2(my - hy, mx - hx);

    // Body starts inside the back of the skull (fused joint) and ends just
    // short of the jaw tips so nothing pokes into the mouth.
    const aBody = ha + (H / o.r) * 0.5;
    const span = (a0 + 2 * Math.PI - o.gap * 1.5 - (H / o.r) * 1.2) - aBody;

    for (let i = 0; i < o.segs; i++) {
      const t = i / (o.segs - 1);
      const [x, y] = polar(o.cx, o.cy, o.r, aBody + t * span);
      const r = o.rMin + (o.rMax - o.rMin) * Math.pow(1 - t, 1.35);
      const c = el("circle", { cx: x, cy: y, r: r.toFixed(2), class: "seg" });
      if (o.wave) c.style.animationDelay = (t * 5.2) + "s";
      svg.appendChild(c);
    }

    // Head: an open-jawed wedge biting toward the tail.
    const m = 0.58;                              // jaw half-angle (~33°)
    const [j1x, j1y] = [hx + H * Math.cos(theta - m), hy + H * Math.sin(theta - m)];
    const [j2x, j2y] = [hx + H * Math.cos(theta + m), hy + H * Math.sin(theta + m)];
    svg.appendChild(el("path", {
      d: "M " + hx.toFixed(1) + " " + hy.toFixed(1) +
         " L " + j1x.toFixed(1) + " " + j1y.toFixed(1) +
         " A " + H + " " + H + " 0 1 0 " + j2x.toFixed(1) + " " + j2y.toFixed(1) + " Z",
      class: "head"
    }));

    // The red tail tip, held mid-mouth between the open jaws.
    svg.appendChild(el("circle", {
      cx: (hx + H * 0.58 * Math.cos(theta)).toFixed(1),
      cy: (hy + H * 0.58 * Math.sin(theta)).toFixed(1),
      r: (o.rMax * 0.34).toFixed(2),
      class: "tailtip"
    }));

    // Eye: on the back of the skull, outward side, well clear of the jaw cut.
    const [rox, roy] = [Math.cos(ha), Math.sin(ha)];          // outward radial
    let phi = theta - Math.PI / 2;
    if (Math.cos(phi) * rox + Math.sin(phi) * roy < 0) phi = theta + Math.PI / 2;
    const ex = hx + H * 0.42 * Math.cos(phi) - H * 0.3 * Math.cos(theta);
    const ey = hy + H * 0.42 * Math.sin(phi) - H * 0.3 * Math.sin(theta);
    svg.appendChild(el("circle", { cx: ex, cy: ey, r: H * 0.21, class: "eye" }));
    svg.appendChild(el("circle", { cx: ex, cy: ey, r: H * 0.1, class: "pupil" }));

    return {
      a0: a0,
      // usable arc for nodes: stop before the tail curls into the mouth
      nodeSpan: 2 * Math.PI - 2 * o.gap,
      taperAt: function (t) {
        return o.rMin + (o.rMax - o.rMin) * Math.pow(1 - t, 1.35);
      }
    };
  }

  window.buildHub = function (svg, pages, current) {
    const CX = 400, CY = 400, R = 300;
    const ring = drawSnake(svg, {
      cx: CX, cy: CY, r: R, start: -Math.PI / 2, gap: 0.26,
      segs: 170, rMin: 3, rMax: 11.5, wave: true
    });

    // Orbit path for the traveling red reader-dot (clockwise, reading order).
    const d = "M " + CX + " " + (CY - R) +
              " A " + R + " " + R + " 0 1 1 " + CX + " " + (CY + R) +
              " A " + R + " " + R + " 0 1 1 " + CX + " " + (CY - R);
    const orbit = el("path", { id: "orbit", d: d, fill: "none", stroke: "none" });
    svg.appendChild(orbit);
    const trav = el("circle", { r: 5, class: "traveler" });
    const mo = el("animateMotion", { dur: "36s", repeatCount: "indefinite" });
    const mp = el("mpath", {});
    mp.setAttribute("href", "#orbit");
    mp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#orbit");
    mo.appendChild(mp);
    trav.appendChild(mo);
    svg.appendChild(trav);

    // Section nodes: solid segments OF the body, sized to the local taper.
    // 01 sits just behind the head; 11 (Works Cited) rides the tail being eaten.
    pages.forEach(function (p, i) {
      const t = (i + 1) / (pages.length + 1);
      const a = ring.a0 + t * ring.nodeSpan;
      const [x, y] = polar(CX, CY, R, a);
      const nr = Math.max(10.5, Math.min(17, ring.taperAt(t) * 1.55));

      const link = el("a", { class: "node" + (i === current ? " cur" : "") });
      link.setAttribute("href", p.href);
      link.setAttribute("aria-label", p.num + " " + p.label);

      link.appendChild(el("circle", { cx: x, cy: y, r: nr.toFixed(1) }));

      const num = el("text", {
        x: x, y: y, class: "nnum",
        "font-size": Math.max(8.5, nr * 0.7).toFixed(1),
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
      cx: CX, cy: CY, r: R, start: -Math.PI / 2, gap: 0.38,
      segs: 70, rMin: 1.1, rMax: 4.8, wave: false
    });

    pages.forEach(function (p, i) {
      const t = (i + 1) / (pages.length + 1);
      const a = ring.a0 + t * ring.nodeSpan;
      const [x, y] = polar(CX, CY, R, a);
      const nr = i === current ? 5.6 : Math.max(2.6, ring.taperAt(t) * 1.3);

      const link = el("a", { class: "mnode" + (i === current ? " cur" : "") });
      link.setAttribute("href", p.href);
      link.setAttribute("aria-label", p.num + " " + p.label);
      const title = el("title", {});
      title.textContent = p.num + " · " + p.label;
      link.appendChild(title);
      link.appendChild(el("circle", { cx: x, cy: y, r: nr.toFixed(1) }));
      svg.appendChild(link);
    });
  };
})();
