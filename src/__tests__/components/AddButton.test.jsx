import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddButton from '../../renderer/components/AddButton';

describe('AddButton', () => {

  test('affiche le texte enfant', () => {
    render(<AddButton onClick={() => {}}>Ajouter</AddButton>);
    expect(screen.getByText('Ajouter')).toBeInTheDocument();
  });

  test('appelle onClick quand on clique', () => {
    const mockClick = jest.fn();
    render(<AddButton onClick={mockClick}>Ajouter</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

});