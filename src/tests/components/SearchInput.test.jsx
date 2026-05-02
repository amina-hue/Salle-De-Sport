import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchInput from '../../renderer/components/Searchinput';

describe('SearchInput Component', () => {
  test('affiche le placeholder par défaut', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/Rechercher.../i)).toBeInTheDocument();
  });

  test('affiche un placeholder personnalisé', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Rechercher un adhérent..." />);
    expect(screen.getByPlaceholderText(/Rechercher un adhérent.../i)).toBeInTheDocument();
  });

  test('affiche la valeur passée en prop', () => {
    render(<SearchInput value="Benali" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Benali')).toBeInTheDocument();
  });

  test('appelle onChange avec la nouvelle valeur lors de la saisie', () => {
    const mockOnChange = jest.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Youcef' } });
    expect(mockOnChange).toHaveBeenCalledWith('Youcef');
  });

  test('l\'icône de recherche est présente', () => {
    const { container } = render(<SearchInput value="" onChange={() => {}} />);
    expect(container.querySelector('.search-icon')).toBeInTheDocument();
  });

  test('le champ est de type text', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });
});