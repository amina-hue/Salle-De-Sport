import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../renderer/pages/Home';

// ══════════════════════════════════════════════════════════════════════════════
// CFG — CHEMINS DE CONTRÔLE
// Chemin unique : le composant n'a aucune condition ni boucle.
// Un seul chemin d'exécution possible → rendu direct du JSX statique.
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — CFG (chemins de contrôle)', () => {

  test('CFG chemin unique — le composant se rend sans crasher', () => {
    expect(() => render(<Home />)).not.toThrow();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// DFG — FLUX DE DONNÉES
// DEF string titre   → USE dans <h1>
// DEF string description → USE dans <p>
// Pas de variable, pas de state : les données sont des literals hardcodés.
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — DFG (flux de données)', () => {

  test('DFG — DEF titre → USE : affiché dans le h1', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent('Bienvenue à la Salle de Sport');
  });

  test('DFG — DEF description → USE : affichée dans le paragraphe', () => {
    render(<Home />);
    expect(
      screen.getByText('Gérez les adhérents, abonnements, paiements et plus encore.')
    ).toBeInTheDocument();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// EP — EQUIVALENCE PARTITIONING
// Le composant n'accepte aucune prop.
// Partition 1 : rendu sans props (cas normal attendu)
// Partition 2 : rendu avec des props inattendues passées quand même
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — EP (partitionnement en classes)', () => {

  test('EP — sans props : le composant s\'affiche correctement', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Gérez les adhérents/)).toBeInTheDocument();
  });

  test('EP — avec props inattendues : ne crashe pas', () => {
    // Home n'utilise pas ces props, elles sont ignorées silencieusement
    expect(() => render(<Home autreProps="valeur" data-testid="test" />)).not.toThrow();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// BVA — BOUNDARY VALUE ANALYSIS
// Frontières sur le contenu textuel :
// - Le texte doit être EXACTEMENT celui attendu (ni tronqué, ni augmenté)
// - La structure HTML doit avoir exactement les bons éléments
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — BVA (analyse des valeurs limites)', () => {

  test('BVA — le h1 contient exactement le texte attendu, rien de plus', () => {
    render(<Home />);
    const titre = screen.getByRole('heading', { level: 1 });
    expect(titre.textContent).toBe('Bienvenue à la Salle de Sport');
  });

  test('BVA — le paragraphe contient exactement le texte attendu, rien de plus', () => {
    render(<Home />);
    const para = screen.getByText('Gérez les adhérents, abonnements, paiements et plus encore.');
    expect(para.textContent).toBe('Gérez les adhérents, abonnements, paiements et plus encore.');
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// BVA ROBUSTE — VALEURS HORS DOMAINE
// On teste des situations extrêmes ou inattendues.
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — BVA Robuste (valeurs hors domaine)', () => {

  test('BVA robuste — props bizarres (children, style, onClick) : pas de crash', () => {
    expect(() =>
      render(
        <Home
          style={{ color: 'red' }}
          onClick={() => {}}
          children={<span>Contenu inattendu</span>}
        />
      )
    ).not.toThrow();
  });

  test('BVA robuste — rendu multiple dans la même suite : pas d\'interférence', () => {
    // On rend le composant deux fois de suite pour vérifier qu'il n'y a pas
    // d'état global partagé qui causerait des effets de bord
    const { unmount } = render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    unmount();
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

});

// ══════════════════════════════════════════════════════════════════════════════
// PAIRWISE — COMBINAISONS DE CONTEXTE
// Paramètres : conteneur DOM × présence de props
// Combinaison 1 : div par défaut + sans props
// Combinaison 2 : conteneur custom (section) + sans props
// ══════════════════════════════════════════════════════════════════════════════
describe('Home — Pairwise (combinaisons de contexte)', () => {

  test('Pairwise 1 — rendu dans le conteneur par défaut (div) : h1 et p présents', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Gérez les adhérents/)).toBeInTheDocument();
  });

  test('Pairwise 2 — rendu dans un conteneur custom (section) : h1 et p présents', () => {
    const conteneur = document.createElement('section');
    document.body.appendChild(conteneur);
    render(<Home />, { container: conteneur });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Gérez les adhérents/)).toBeInTheDocument();
    document.body.removeChild(conteneur);
  });

});