import { useState } from "react";
import gamesConfig from "../data/gamesConfig";

const AttendanceTable = () => {
  const [counts, setCounts] = useState({});

  const handleChange = (index, value) => {
    setCounts({
      ...counts,
      [index]: Number(value)
    });
  };

  const totalHours = gamesConfig.reduce((sum, game, index) => {
    const count = counts[index] || 0;
    return sum + count * game.rate;
  }, 0);

  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Game</th>
          <th>Type</th>
          <th>Count</th>
          <th>Hours</th>
        </tr>
      </thead>

      <tbody>
        {gamesConfig.map((game, index) => (
          <tr key={index}>
            <td>{game.game}</td>
            <td>{game.type}</td>
            <td>
              <input
                type="number"
                min="0"
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
              />
            </td>
            <td>{game.rate}</td>
          </tr>
        ))}

        <tr style={{ background: "#dff0d8", fontWeight: "bold" }}>
          <td colSpan="3">Total Working Hours</td>
          <td>{totalHours.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default AttendanceTable;
