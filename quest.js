/* The Loop — case-progress quest layer.
   Storyline chapters, persistent progress (localStorage), exhibit FILED stamps,
   and an animated continue-the-loop chapter card on every page.
   No dependencies. Degrades to nothing without JS; respects reduced motion. */
(function () {
  var CHAPTERS = {
    "p-home":       { n: 0,  label: "Prologue",     beat: "A snake is introduced. It is eating.",              next: "dilemma.html",    nextLabel: "Chapter I &middot; The Case File" },
    "p-dilemma":    { n: 1,  label: "Chapter I",    beat: "One act. Two stamps.",                              next: "thesis.html",     nextLabel: "Chapter II &middot; The Claim" },
    "p-thesis":     { n: 2,  label: "Chapter II",   beat: "The claim is read into the record.",                next: "frameworks.html", nextLabel: "Chapter III &middot; Two Lenses" },
    "p-frameworks": { n: 3,  label: "Chapter III",  beat: "Two instruments are calibrated.",                   next: "argument-1.html", nextLabel: "Chapter IV &middot; The Flip" },
    "p-arg1":       { n: 4,  label: "Chapter IV",   beat: "The flip is caught in writing.",                    next: "argument-2.html", nextLabel: "Chapter V &middot; The Referee" },
    "p-arg2":       { n: 5,  label: "Chapter V",    beat: "The referee refuses both sides.",                   next: "argument-3.html", nextLabel: "Chapter VI &middot; The Ledger" },
    "p-arg3":       { n: 6,  label: "Chapter VI",   beat: "The bite reaches a paycheck.",                      next: "argument-4.html", nextLabel: "Chapter VII &middot; Generation Loss" },
    "p-arg4":       { n: 7,  label: "Chapter VII",  beat: "The snake reaches its own tail.",                   next: "rebuttal.html",   nextLabel: "Chapter VIII &middot; Cross-Examination" },
    "p-rebuttal":   { n: 8,  label: "Chapter VIII", beat: "The defense takes the floor. It is good.",          next: "conclusion.html", nextLabel: "Chapter IX &middot; The Mirror" },
    "p-conclusion": { n: 9,  label: "Chapter IX",   beat: "The author runs the test on himself.",              next: "works-cited.html",nextLabel: "Epilogue &middot; The Tail" },
    "p-works":      { n: 10, label: "Epilogue",     beat: "Everything the argument ate, indexed.",             next: "index.html",      nextLabel: "The loop closes &middot; Home" }
  };
  var TOTAL = 11;
  var KEY = "oro-quest-v1";

  var cls = null;
  document.body.classList.forEach(function (c) { if (CHAPTERS[c]) cls = c; });
  if (!cls) return;
  var ch = CHAPTERS[cls];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- progress store ---- */
  var seen;
  try { seen = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { seen = []; }
  if (seen.indexOf(ch.n) === -1) seen.push(ch.n);
  try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch (e) {}

  /* ---- chapter strip under the pagehead (or hero on home) ---- */
  var anchor = document.querySelector(".pagehead") || document.querySelector("main > section");
  if (anchor) {
    var strip = document.createElement("div");
    strip.className = "quest-strip reveal";
    strip.innerHTML =
      '<span class="q-chap">' + ch.label + "</span>" +
      '<span class="q-beat">' + ch.beat + "</span>" +
      '<span class="q-prog" aria-label="' + seen.length + ' of ' + TOTAL + ' segments read">' +
      "segments digested <b>" + String(seen.length).padStart(2, "0") + "</b>&thinsp;/&thinsp;" + TOTAL + "</span>";
    anchor.insertAdjacentElement("afterend", strip);
  }

  /* ---- exhibit FILED stamps: mark exhibits as the reader passes them ---- */
  var exhibits = document.querySelectorAll("figure.exhibit .etag, blockquote.qs .qtag");
  function file(el) {
    if (el.querySelector(".q-filed")) return;
    var chip = document.createElement("span");
    chip.className = "q-filed";
    chip.textContent = "filed ✓";
    el.appendChild(chip);
  }
  if (reduced || !("IntersectionObserver" in window)) {
    exhibits.forEach(file);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { file(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    exhibits.forEach(function (el) { io.observe(el); });
  }

  /* ---- continue-the-loop chapter card before the footer ---- */
  var main = document.querySelector("main");
  if (main && ch.next) {
    var done = seen.length >= TOTAL;
    var card = document.createElement("aside");
    card.className = "quest-next reveal";
    card.setAttribute("aria-label", "Continue to the next page");
    card.innerHTML =
      '<div class="qn-left"><span class="qn-kick">' +
      (cls === "p-works" && done ? "loop closed &middot; every segment digested" : "the loop continues") +
      '</span><span class="qn-title">' + ch.nextLabel + "</span></div>" +
      '<a class="qn-go" href="' + ch.next + '"><span class="qn-word">Continue</span><span class="qn-arrow" aria-hidden="true">&rarr;</span></a>';
    main.appendChild(card);
  }

  /* ---- paint progress onto the snake: visited nodes fill red-soft ---- */
  function paint() {
    var nodes = document.querySelectorAll("a.mnode, a.node");
    nodes.forEach(function (a) {
      var href = (a.getAttribute("href") || a.getAttribute("xlink:href") || "").split("/").pop();
      for (var k in CHAPTERS) {
        var c = CHAPTERS[k];
        var page = { 0:"index.html",1:"dilemma.html",2:"thesis.html",3:"frameworks.html",4:"argument-1.html",5:"argument-2.html",6:"argument-3.html",7:"argument-4.html",8:"rebuttal.html",9:"conclusion.html",10:"works-cited.html" }[c.n];
        if (href === page && seen.indexOf(c.n) !== -1) a.classList.add("visited");
      }
    });
  }
  /* snake.js builds nodes before quest.js runs (script order), but be safe */
  paint();
  window.addEventListener("load", paint);

  /* re-run shared reveal wiring for the injected elements */
  if (!reduced && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("on"); io2.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".quest-strip, .quest-next").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (r.top < vh * 0.92) el.classList.add("on");
      else io2.observe(el);
    });
  } else {
    document.querySelectorAll(".quest-strip, .quest-next").forEach(function (el) { el.classList.add("on"); });
  }
})();
