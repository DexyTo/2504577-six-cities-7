import './spinner.css';

function Spinner(): JSX.Element {
  return (
    <div className="spinner" role="status">
      <span className="spinner__indicator" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}

export default Spinner;
