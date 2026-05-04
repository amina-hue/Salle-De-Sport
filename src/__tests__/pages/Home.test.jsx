import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../renderer/pages/Home';

describe('Page Home', () => {

  test('affiche le titre de bienvenue', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  test('affiche un texte de description', () => {
    render(<Home />);
    expect(screen.getByText(/Gérez/i)).toBeInTheDocument();
  });

});


