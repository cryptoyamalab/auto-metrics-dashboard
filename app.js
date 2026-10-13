// Clave para LocalStorage
const STORAGE_KEY = "auto_metrics_records";

let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let chartInstance = null;

const form = document.getElementById("fuel-form");
const fechaInput = document.getElementById("fecha");
const odoInput = document.getElementById("odometro");
const galInput = document.getElementById("galones");
const costoInput = document.getElementById("costo");
const tbody = document.getElementById("logs-tbody");
const clearBtn = document.getElementById("clear-btn");

// Establecer fecha de hoy por defecto
fechaInput.value = new Date().toISOString().split("T")[0];

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  render();
});

// Guardar nueva recarga
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newRecord = {
    id: Date.now(),
    fecha: fechaInput.value,
    odometro: parseFloat(odoInput.value),
    galones: parseFloat(galInput.value),
    costo: parseFloat(costoInput.value)
  };

  // Validar odómetro respecto al último
  if (records.length > 0) {
    const ultimo = records[records.length - 1];
    if (newRecord.odometro <= ultimo.odometro) {
      alert("El odómetro ingresado debe ser mayor que el odómetro previo (" + ultimo.odometro + " mi).");
      return;
    }
  }

  records.push(newRecord);
  saveData();
  render();

  odoInput.value = "";
  galInput.value = "";
  costoInput.value = "";
});

// Borrar todos los registros
clearBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que quieres borrar todos los registros?")) {
    records = [];
    saveData();
    render();
  }
});

// Borrar registro individual
window.deleteRecord = function (id) {
  records = records.filter(r => r.id !== id);
  saveData();
  render();
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Calcular métricas derivadas por cada registro
function calcularMetricas() {
  return records.map((rec, idx) => {
    if (idx === 0) {
      return {
        ...rec,
        millas: null,
        mpg: null,
        costoPorMilla: null
      };
    }
    const prev = records[idx - 1];
    const deltaMillas = rec.odometro - prev.odometro;
    const mpg = deltaMillas / rec.galones;
    const cpm = rec.costo / deltaMillas;

    return {
      ...rec,
      millas: deltaMillas,
      mpg: mpg,
      costoPorMilla: cpm
    };
  });
}

function render() {
  const processed = calcularMetricas();
  renderKPIs(processed);
  renderTable(processed);
  renderChart(processed);
}

function renderKPIs(processed) {
  const kpiOdo = document.getElementById("kpi-odo");
  const kpiAvgMpg = document.getElementById("kpi-avg-mpg");
  const kpiLastMpg = document.getElementById("kpi-last-mpg");
  const kpiCpm = document.getElementById("kpi-cpm");

  if (processed.length === 0) {
    kpiOdo.textContent = "0 mi";
    kpiAvgMpg.textContent = "0.00";
    kpiLastMpg.textContent = "0.00";
    kpiCpm.textContent = "$0.00";
    return;
  }

  const ultimo = processed[processed.length - 1];
  kpiOdo.textContent = `${ultimo.odometro.toLocaleString()} mi`;

  const validEntries = processed.filter(p => p.mpg !== null);

  if (validEntries.length === 0) {
    kpiAvgMpg.textContent = "-- (esperando 2do registro)";
    kpiLastMpg.textContent = "--";
    kpiCpm.textContent = "--";
    return;
  }

  const lastEntry = validEntries[validEntries.length - 1];
  kpiLastMpg.textContent = `${lastEntry.mpg.toFixed(2)}`;

  const totalMillas = validEntries.reduce((sum, p) => sum + p.millas, 0);
  const totalGalones = validEntries.reduce((sum, p) => sum + p.galones, 0);
  const totalCosto = validEntries.reduce((sum, p) => sum + p.costo, 0);

  const avgMpg = totalGalones > 0 ? totalMillas / totalGalones : 0;
  const avgCpm = totalMillas > 0 ? totalCosto / totalMillas : 0;

  kpiAvgMpg.textContent = `${avgMpg.toFixed(2)}`;
  kpiCpm.textContent = `$${avgCpm.toFixed(3)}`;
}

function renderTable(processed) {
  tbody.innerHTML = "";
  // Mostrar los más recientes primero
  const reversed = [...processed].reverse();

  reversed.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td>${r.odometro.toLocaleString()} mi</td>
      <td>${r.millas !== null ? r.millas.toFixed(1) + " mi" : "Línea base"}</td>
      <td>${r.galones.toFixed(2)} gal</td>
      <td>${r.mpg !== null ? r.mpg.toFixed(2) : "--"}</td>
      <td>$${r.costo.toFixed(2)}</td>
      <td>${r.costoPorMilla !== null ? "$" + r.costoPorMilla.toFixed(3) : "--"}</td>
      <td><button class="btn-delete" onclick="deleteRecord(${r.id})">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderChart(processed) {
  const ctx = document.getElementById("mpgChart").getContext("2d");
  const chartData = processed.filter(p => p.mpg !== null);

  const labels = chartData.map(p => p.fecha);
  const mpgValues = chartData.map(p => p.mpg.toFixed(2));

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "MPG (Millas por Galón)",
        data: mpgValues,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        borderWidth: 2,
        tension: 0.25,
        fill: true,
        pointBackgroundColor: "#38bdf8"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8" } }
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } }
      }
    }
  });
}
