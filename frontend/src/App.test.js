import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Box', () => () => <div>Food boxes</div>);
jest.mock('./components/BubbleText', () => () => <div>Bubble text</div>);
jest.mock('./components/Reci', () => () => <div>Recipe finder</div>);
jest.mock('./components/About', () => () => <div>About Reci</div>);
jest.mock('./components/FloatingEmail', () => () => <div>Email button</div>);

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the Reci preloader first', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /reci/i })).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: /loading homepage/i })).toBeInTheDocument();
});
