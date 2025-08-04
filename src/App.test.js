import { render, screen } from '@testing-library/react';
import App from './App';

test("renders Dave's Running Club title", () => {
  render(<App />);
  const titleElement = screen.getByText(/Dave's Running Club/i);
  expect(titleElement).toBeInTheDocument();
});
