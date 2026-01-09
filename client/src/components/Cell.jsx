import '../styles/Cell.css';

function Cell({ value, onClick, isClickable }) {
  const cellClass = value ? `cell ${value.toLowerCase()}` : 'cell';
  const cursorClass = isClickable ? 'clickable' : '';

  return (
    <div
      className={`${cellClass} ${cursorClass}`}
      onClick={onClick}
      data-cell
    >
      {value}
    </div>
  );
}

export default Cell;
