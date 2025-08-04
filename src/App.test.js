import { render, screen } from '@testing-library/react';
import App from './App';

test("renders Dave's Running Club title somewhere on the page", () => {
  render(<App />);
  const matches = screen.getAllByText(/Dave's Running Club/i);
  expect(matches.length).toBeGreaterThan(0);
});