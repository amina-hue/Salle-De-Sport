import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../../renderer/components/StatCard';
import { Package } from 'lucide-react';

describe('StatCard', () => {

  test('affiche la valeur passée en prop', () => {
    render(<StatCard title="Adhérents" value="42" accent="#e53935" icon={Package} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('affiche le titre correctement', () => {
    render(<StatCard title="Adhérents" value="42" accent="#e53935" icon={Package} />);
    expect(screen.getByText('Adhérents')).toBeInTheDocument();
  });

});