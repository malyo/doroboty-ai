import type { JobFilters } from "./types";
import { contractLabels, functionLabels, remoteLabels, seniorityLabels } from "./presentation";
export function JobFiltersForm({
  filters,
  onChange,
  onReset,
}: {
  filters: JobFilters;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="frame pp-filter-panel">
      <div className="cap pp-filter-heading">
        <h2>Po Twojemu</h2>
        <button type="button" className="tx pp-text-button" onClick={onReset}>
          Wyczyść
        </button>
      </div>
      {(
        [
          ["remote", "Tryb pracy", remoteLabels],
          ["seniority", "Doświadczenie", seniorityLabels],
          ["contract", "Forma współpracy", contractLabels],
          ["function", "Funkcja", functionLabels],
        ] as const
      ).map(([key, label, options]) => (
        <fieldset className="pp-filter-group" key={key}>
          <legend>{label}</legend>
          {Object.entries(options).map(([value, text]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={filters[key] === value}
                onChange={() => onChange(key, filters[key] === value ? "" : value)}
              />
              {text}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
