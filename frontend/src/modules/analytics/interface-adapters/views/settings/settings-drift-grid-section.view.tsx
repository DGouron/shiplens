import { type DriftGridSectionViewModel } from '../../presenters/settings.view-model.schema.ts';

interface SettingsDriftGridSectionViewProps {
  viewModel: DriftGridSectionViewModel;
}

export function SettingsDriftGridSectionView({
  viewModel,
}: SettingsDriftGridSectionViewProps) {
  return (
    <section className="settings-section">
      <h2>{viewModel.title}</h2>
      <p className="settings-description">{viewModel.description}</p>
      <table className="settings-drift-grid-table">
        <thead>
          <tr>
            <th>{viewModel.headerPoints}</th>
            <th>{viewModel.headerDuration}</th>
          </tr>
        </thead>
        <tbody>
          {viewModel.rows.map((row) => (
            <tr key={row.points}>
              <td>{row.points}</td>
              <td>{row.maxDuration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="settings-drift-grid-note">{viewModel.note}</p>
    </section>
  );
}
