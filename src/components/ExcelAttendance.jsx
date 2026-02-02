import { useState } from "react";
import gamesConfig from "../data/gamesConfig";

const DAILY_TARGET = 7.25;
const EXCLUDED_OVERTIME_GROUP = "LIVE";

export default function ExcelAttendance() {
  const [analysts, setAnalysts] = useState([
    { id: 1, name: "Analyst 1", values: {} },
  ]);

  /* =========================
     UPDATE COUNT
  ========================= */
  const updateValue = (id, key, value) => {
    setAnalysts(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              values: {
                ...a.values,
                [key]: value === "" ? "" : Number(value),
              },
            }
          : a
      )
    );
  };

  /* =========================
     UPDATE ANALYST NAME
  ========================= */
  const updateAnalystName = (id, name) => {
    setAnalysts(prev =>
      prev.map(a => (a.id === id ? { ...a, name } : a))
    );
  };

  const addAnalyst = () => {
    setAnalysts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: `Analyst ${prev.length + 1}`,
        values: {},
      },
    ]);
  };

  /* =========================
     REGULAR + OVERTIME SPLIT
  ========================= */
  const splitRegularAndOvertime = values => {
    let remaining = DAILY_TARGET;
    const regularCounts = {};
    const overtimeCounts = {};

    gamesConfig.forEach(g =>
      g.items.forEach(i => {
        const key = `${g.group}-${i.label}`;
        const count = Number(values[key] || 0);
        const hours = count * i.rate;

        regularCounts[key] = 0;
        overtimeCounts[key] = 0;

        // LIVE → never goes to OT
        if (g.group === EXCLUDED_OVERTIME_GROUP) {
          regularCounts[key] = count;
          return;
        }

        if (remaining > 0) {
          if (hours <= remaining) {
            regularCounts[key] = count;
            remaining -= hours;
          } else {
            const regCount = Number(
              (remaining / i.rate).toFixed(2)
            );
            regularCounts[key] = regCount;
            overtimeCounts[key] = Number(
              (count - regCount).toFixed(2)
            );
            remaining = 0;
          }
        } else {
          overtimeCounts[key] = count;
        }
      })
    );

    return { regularCounts, overtimeCounts };
  };

  /* =========================
     HOURS CALC
  ========================= */
  const calcHoursFromCounts = counts => {
    let total = 0;
    gamesConfig.forEach(g =>
      g.items.forEach(i => {
        const key = `${g.group}-${i.label}`;
        total += (counts[key] || 0) * i.rate;
      })
    );
    return total;
  };

  const grandTotal = analysts.reduce(
    (s, a) => s + calcHoursFromCounts(a.values),
    0
  );

  /* =========================
     UI
  ========================= */
  return (
    <div
      className="rounded-xl shadow-sm border"
      style={{
        background: "var(--hrms-card)",
        borderColor: "var(--hrms-border)",
      }}
    >
      {/* HEADER */}
      <div
        className="flex justify-between items-center px-4 py-3 border-b"
        style={{ borderColor: "var(--hrms-border)" }}
      >
        <span className="text-sm font-medium">Analysts</span>
        <button
          onClick={addAnalyst}
          className="text-xs px-3 py-1.5 rounded"
          style={{
            background: "var(--hrms-primary)",
            color: "#fff",
          }}
        >
          + Add Analyst
        </button>
      </div>

      {/* ================= REGULAR INPUT TABLE ================= */}
      <div className="overflow-x-auto">
        <table style={{ minWidth: "1500px" }} className="text-xs">
          <thead>
            <tr style={{ background: "var(--hrms-primary-soft)" }}>
              <th rowSpan={3} className="px-3 py-2 text-left">
                Analyst
              </th>

              {gamesConfig.map(g => (
                <th
                  key={g.group}
                  colSpan={g.items.length}
                  className="px-3 py-2 text-center border-l"
                  style={{ borderColor: "var(--hrms-border)" }}
                >
                  {g.group}
                </th>
              ))}

              <th rowSpan={3} className="px-3 py-2 text-center">
                Regular Hrs
              </th>
            </tr>

            <tr>
              {gamesConfig.map(g =>
                g.items.map(i => (
                  <th
                    key={g.group + i.label}
                    className="px-2 py-1 text-center border-l"
                    style={{ borderColor: "var(--hrms-border)" }}
                  >
                    {i.label}
                  </th>
                ))
              )}
            </tr>

            <tr className="text-[11px] text-slate-500">
              {gamesConfig.map(g =>
                g.items.map(i => (
                  <th
                    key={g.group + i.label + "rate"}
                    className="px-2 py-[2px] text-center border-l"
                    style={{ borderColor: "var(--hrms-border)" }}
                  >
                    {i.rate}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {analysts.map(a => {
              const { regularCounts } =
                splitRegularAndOvertime(a.values);
              const regularHours =
                calcHoursFromCounts(regularCounts);

              return (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">
                    <input
                      value={a.name}
                      onChange={e =>
                        updateAnalystName(a.id, e.target.value)
                      }
                      className="w-28 px-2 py-1 text-xs rounded border"
                    />
                  </td>

                  {gamesConfig.map(g =>
                    g.items.map(i => {
                      const key = `${g.group}-${i.label}`;
                      return (
                        <td key={key} className="px-2 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={a.values[key] ?? ""}
                            onChange={e =>
                              updateValue(a.id, key, e.target.value)
                            }
                            className="w-10 h-6 text-xs text-center rounded border"
                          />
                        </td>
                      );
                    })
                  )}

                  <td className="px-3 py-2 text-center font-semibold">
                    {regularHours.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= OVERTIME TABLE (SAME STRUCTURE) ================= */}
      <div className="mt-8 border-t">
        <div className="px-4 py-3 text-sm font-medium">
          Overtime Breakdown
        </div>

        <div className="overflow-x-auto">
          <table style={{ minWidth: "1500px" }} className="text-xs">
            <thead style={{ background: "var(--hrms-primary-soft)" }}>
              <tr>
                <th className="px-3 py-2 text-left">Analyst</th>

                {gamesConfig.map(g => (
                  <th
                    key={"ot-group-" + g.group}
                    colSpan={g.items.length}
                    className="px-3 py-2 text-center border-l"
                  >
                    {g.group}
                  </th>
                ))}

                <th className="px-3 py-2 text-center">OT Hrs</th>
              </tr>

              <tr>
                <th></th>
                {gamesConfig.map(g =>
                  g.items.map(i => (
                    <th
                      key={"ot-" + g.group + i.label}
                      className="px-2 py-1 text-center border-l"
                    >
                      {i.label}
                    </th>
                  ))
                )}
                <th></th>
              </tr>
            </thead>

            <tbody>
              {analysts.map(a => {
                const { overtimeCounts } =
                  splitRegularAndOvertime(a.values);
                const otHours =
                  calcHoursFromCounts(overtimeCounts);

                return (
                  <tr key={"ot-" + a.id} className="border-t">
                    <td className="px-3 py-2 font-medium">
                      {a.name}
                    </td>

                    {gamesConfig.map(g =>
                      g.items.map(i => {
                        const key = `${g.group}-${i.label}`;
                        const value =
                          g.group === EXCLUDED_OVERTIME_GROUP
                            ? 0
                            : overtimeCounts[key] || 0;

                        return (
                          <td
                            key={"ot-" + key}
                            className="px-2 py-2 text-center"
                          >
                            {value}
                          </td>
                        );
                      })
                    )}

                    <td className="px-3 py-2 text-center font-semibold">
                      {otHours.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 py-3 border-t text-right">
        <span className="text-sm">
          Grand Total:
          <span className="ml-2 font-semibold">
            {grandTotal.toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
}
