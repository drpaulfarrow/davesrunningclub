import React, { useState } from 'react';
import './Gate.css';

function Gate({ onPass }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.toLowerCase() === "smith") { // Replace "smith" with the correct answer
      onPass();
    } else {
      setError("Incorrect answer. Please try again.");
    }
  };

  return (
    <div className="gate">
      <h1>Welcome to Dave's Running Club</h1>
      <p>To enter, please answer the following question:</p>
      <p><strong>What was Dave's last name?</strong></p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Gate;
