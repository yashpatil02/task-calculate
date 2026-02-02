import ExcelAttendance from "./components/ExcelAttendance";

export default function App() {
  return (
    <div className="min-h-screen px-6 py-5">
      <h1 className="text-xl font-semibold">
        Working Hours Sheet
      </h1>
      <p className="text-sm text-[color:var(--hrms-muted)] mb-4">
        HRMS aligned working-hours view
      </p>

      <ExcelAttendance />
    </div>
  );
}
