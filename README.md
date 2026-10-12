# auto-metrics-dashboard

# 🚗 Auto Metrics Dashboard — Vehicle Maintenance & Fuel Economy Log

Aplicación web Full Stack diseñada para gestionar el historial de mantenimiento mecánico, registrar cargas de combustible y calcular métricas de rendimiento por milla/kilómetro en tiempo real.

---

## 📌 Funcionalidades Principales

- ⛽ **Cálculo de Consumo:** Registro de odómetro y galones/litros para calcular automáticamente el rendimiento promedio ($MPG$ o $km/l$).
- 🔧 **Historial de Servicios:** Seguimiento de cambios de aceite, filtros de cabina/motor, rotación de frenos y fluidos.
- ⏰ **Alertas Preventivas:** Cálculo del kilometraje restante para el próximo servicio programado.
- 📊 **Persistencia de Datos:** Arquitectura cliente-servidor conectada a una base de datos relacional para auditoría de gastos.

---

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5 semántico, CSS3 moderno (Flexbox, Grid), JavaScript Vanilla (ES6+, Fetch API).
- **Backend:** Node.js, Express.js (Arquitectura REST API).
- **Base de Datos:** PostgreSQL / SQLite (Modelado relacional con claves foráneas).
- **Control de Versiones:** Git & GitHub.

---

## 🗄️ Esquema de la Base de Datos

```sql
CREATE TABLE fuel_logs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    odometer INT NOT NULL,
    gallons NUMERIC(5,2) NOT NULL,
    total_cost NUMERIC(6,2) NOT NULL,
    mpg NUMERIC(4,2)
);

CREATE TABLE service_logs (
    id SERIAL PRIMARY KEY,
    service_date DATE NOT NULL,
    odometer INT NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    notes TEXT,
    cost NUMERIC(6,2)
);
