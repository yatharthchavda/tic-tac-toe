import '../styles/WinningMessage.css';

function WinningMessage({ winner, isDraw, myMark, onRestart }) {
  const getMessage = () => {
    if (isDraw) return "It's a Draw!";
    if (winner === myMark) return "You Win!";
    return "You Lose!";
  };

  return (
    <div className="winning-message show">
      <div className="winning-message-text">{getMessage()}</div>
      <button className="restart-button" onClick={onRestart}>
        Restart
      </button>
    </div>
  );
}

export default WinningMessage;
