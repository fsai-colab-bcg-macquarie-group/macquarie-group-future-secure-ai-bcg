const PALETTE = [
  "#1d3557", "#457b9d", "#e07a5f", "#3d405b", "#81b29a",
  "#e9c46a", "#6d597a", "#355070", "#b56576", "#22223b",
];

Chart.defaults.font.family = "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
Chart.defaults.color = "#444";
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.font = { size: 11 };

function bars(id, labels, values, colors) {
  const el = document.getElementById(id);
  if (!el) return;
  const bg = Array.isArray(colors) ? colors : labels.map(() => colors || PALETTE[0]);
  new Chart(el, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: bg, maxBarThickness: 22 }],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  });
}

function grouped(id, labels, series) {
  const el = document.getElementById(id);
  if (!el) return;
  new Chart(el, {
    type: "bar",
    data: {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.data,
        backgroundColor: PALETTE[i % PALETTE.length],
        maxBarThickness: 18,
      })),
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function doughnut(id, labels, values) {
  const el = document.getElementById(id);
  if (!el) return;
  new Chart(el, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values, backgroundColor: PALETTE, borderWidth: 0 }] },
    options: { cutout: "52%", plugins: { legend: { position: "bottom" } } },
  });
}

function stacked(id, packed) {
  const el = document.getElementById(id);
  if (!el || !packed) return;
  const idx = packed.rows
    .map((_, i) => i)
    .filter((i) => packed.columns.some((c) => (packed.series[c] || [])[i]));
  const labels = idx.map((i) => packed.rows[i]);
  const datasets = packed.columns
    .map((col, ci) => ({
      label: col,
      data: idx.map((i) => packed.series[col][i] || 0),
      backgroundColor: PALETTE[ci % PALETTE.length],
    }))
    .filter((d) => d.data.some((n) => n));
  new Chart(el, {
    type: "bar",
    data: { labels, datasets },
    options: {
      indexAxis: "y",
      scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } },
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderDirectory(rows) {
  const q = (document.getElementById("q")?.value || "").toLowerCase();
  const tbody = document.getElementById("dir-body");
  if (!tbody) return;
  const filtered = rows.filter((r) =>
    `${r.name} ${r.headline} ${r.family} ${r.competency} ${(r.priors || []).join(" ")} ${r.location || ""}`
      .toLowerCase()
      .includes(q)
  );
  tbody.innerHTML = filtered
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.headline)}</td>
        <td>${escapeHtml(r.family)}</td>
        <td>${escapeHtml((r.priors || []).join(", ") || "—")}</td>
        <td>${escapeHtml(r.location || "—")}</td>
        <td>${escapeHtml(r.competency)}</td>
      </tr>`
    )
    .join("");
  const n = document.getElementById("dir-count");
  if (n) n.textContent = `${filtered.length} of ${rows.length}`;
}

function renderLead(rows) {
  const tbody = document.getElementById("lead-body");
  if (!tbody || !rows) return;
  tbody.innerHTML = rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.seat)}</td>
        <td>${escapeHtml(r.prior)}</td>
      </tr>`
    )
    .join("");
}

function orderedEntries(obj, order) {
  if (order) return order.filter((k) => obj[k] != null).map((k) => [k, obj[k]]);
  return Object.entries(obj);
}

fetch("data/charts.json")
  .then((r) => r.json())
  .then((data) => {
    const s = data.search_sample;
    const r = data.ratios;
    doughnut("chart-mgmt", ["C-suite / exec / director titles", "Other named titles"], [
      r.mgmt_titles,
      r.named - r.mgmt_titles,
    ]);
    bars(
      "chart-proof",
      ["Independent trial customers", "Named logos", "Sectors claimed", "Anonymised $ stories"],
      [1, 5, 12, 3],
      "#e07a5f"
    );

    const leadOrder = ["McKinsey", "BCG", "Deloitte", "Macquarie", "Cohere", "Netflix", "AWS", "AMP", "A&O Shearman", "Other"];
    doughnut(
      "chart-lead-mix",
      leadOrder.filter((k) => data.leadership_prior_employers[k]),
      leadOrder.filter((k) => data.leadership_prior_employers[k]).map((k) => data.leadership_prior_employers[k])
    );
    const mgmtComp = orderedEntries(s.competency_mgmt);
    doughnut("chart-comp-mgmt", mgmtComp.map(([k]) => k), mgmtComp.map(([, v]) => v));

    stacked("chart-lead-prior", data.prior_by_function_leadership_page);
    stacked("chart-head-prior", data.prior_by_function_named_priors);
    stacked("chart-comp-fn", data.competency_by_function);
    stacked("chart-prior-comp", data.prior_by_competency);

    const fn = data.function_named || s.family_named;
    const fnOrder = Object.keys(fn);
    bars("chart-function", fnOrder, fnOrder.map((k) => fn[k] || 0), "#1d3557");

    const cap = data.capacity_vs_overlay;
    bars(
      "chart-capacity",
      cap.labels,
      cap.values,
      cap.labels.map((_, i) => (i < 3 ? "#1d3557" : "#e07a5f"))
    );

    doughnut("chart-location", Object.keys(s.location_named), Object.values(s.location_named));
    const geo = data.geo_claimed_vs_titles;
    grouped("chart-geo", geo.labels, [
      { label: "On the company widget", data: geo.claimed_on_widget },
      { label: "Word in a named headline", data: geo.title_words },
    ]);
    bars("chart-headcount", data.headcount_stories.labels, data.headcount_stories.values, "#e07a5f");

    const senOrder = ["C-suite", "Exec / head", "Director / VP", "Staff / principal", "Lead / manager", "Senior", "Individual contributor", "Intern"];
    bars("chart-seniority", senOrder, senOrder.map((k) => s.seniority_named[k] || 0), "#1d3557");

    window.__directory = data.directory;
    renderDirectory(data.directory);
    renderLead(data.leadership_bench);
    document.getElementById("q")?.addEventListener("input", () => renderDirectory(data.directory));
  })
  .catch((err) => {
    const el = document.getElementById("charts-error");
    if (el) {
      el.hidden = false;
      el.textContent = "Charts need http (not file://).";
    }
    console.error(err);
  });
