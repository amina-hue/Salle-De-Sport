// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import AddButton from '../../renderer/components/AddButton';
// import { ShoppingCart } from 'lucide-react';

// // ─── DESCRIPTION ──────────────────────────────────────────────────────────────
// // Techniques appliquées :
// //   - EP  (Equivalence Partitioning) : classes valides / invalides
// //   - BVA (Boundary Value Analysis)  : frontières des props
// //   - BVA Robuste                    : valeurs hors domaine / types incorrects
// //   - CFG (Control Flow Graph)       : chemins onClick fourni / non fourni
// //   - DFG (Data Flow Graph)          : def → use sur onClick et children
// //   - Pairwise                       : combinaisons icon × children × onClick

// // ─── CFG ──────────────────────────────────────────────────────────────────────
// // Chemins du composant :
// //   Chemin 1 : onClick fourni     → handler appelé au clic
// //   Chemin 2 : onClick non fourni → pas de crash au clic
// //   Chemin 3 : icon par défaut    → Plus affiché
// //   Chemin 4 : icon personnalisée → icône custom affichée

// describe('AddButton — CFG (chemins de contrôle)', () => {

//   test('CFG chemin 1 — onClick fourni : appelé au clic', () => {
//     const handleClick = jest.fn();
//     render(<AddButton onClick={handleClick}>Ajouter</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(handleClick).toHaveBeenCalledTimes(1);
//   });

//   test('CFG chemin 2 — onClick non fourni : aucun crash au clic', () => {
//     render(<AddButton>Ajouter</AddButton>);
//     expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
//   });

//   test('CFG chemin 3 — icon par défaut (Plus) : rendu sans icon prop', () => {
//     render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

//   test('CFG chemin 4 — icon personnalisée : rendu avec icon prop', () => {
//     render(
//       <AddButton onClick={jest.fn()} icon={ShoppingCart}>
//         Acheter
//       </AddButton>
//     );
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

// });

// // ─── DFG ──────────────────────────────────────────────────────────────────────
// // Flux de données :
// //   DEF onClick  → USE dans l'attribut onClick du bouton
// //   DEF children → USE dans le rendu du texte
// //   DEF icon     → USE dans le rendu du composant icône

// describe('AddButton — DFG (flux de données)', () => {

//   test('DFG — DEF onClick → USE : la fonction reçue est bien celle appelée', () => {
//     const fn = jest.fn();
//     render(<AddButton onClick={fn}>Test</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn).toBe(fn); // même référence
//     expect(fn).toHaveBeenCalledTimes(1);
//   });

//   test('DFG — DEF children="Ajouter membre" → USE : texte affiché', () => {
//     render(<AddButton onClick={jest.fn()}>Ajouter membre</AddButton>);
//     expect(screen.getByText('Ajouter membre')).toBeInTheDocument();
//   });

//   test('DFG — DEF children modifié → USE : nouveau texte affiché', () => {
//     const { rerender } = render(
//       <AddButton onClick={jest.fn()}>Ancien texte</AddButton>
//     );
//     rerender(<AddButton onClick={jest.fn()}>Nouveau texte</AddButton>);
//     expect(screen.getByText('Nouveau texte')).toBeInTheDocument();
//     expect(screen.queryByText('Ancien texte')).not.toBeInTheDocument();
//   });

//   test('DFG — DEF onClick mis à jour → USE : nouvelle fonction appelée', () => {
//     const fn1 = jest.fn();
//     const fn2 = jest.fn();
//     const { rerender } = render(<AddButton onClick={fn1}>Test</AddButton>);
//     rerender(<AddButton onClick={fn2}>Test</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn2).toHaveBeenCalledTimes(1);
//     expect(fn1).not.toHaveBeenCalled();
//   });

// });

// // ─── EP (Equivalence Partitioning) ────────────────────────────────────────────
// // Partitions :
// //   children : [string non vide] | [string vide] | [absent]
// //   onClick  : [fonction]        | [undefined]   | [null]
// //   icon     : [composant React] | [absent]

// describe('AddButton — EP (partitionnement en classes)', () => {

//   describe('Partition children', () => {

//     test('EP — children valide (string) : texte affiché', () => {
//       render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
//       expect(screen.getByText('Ajouter')).toBeInTheDocument();
//     });

//     test('EP — children vide ("") : bouton rendu sans texte', () => {
//       render(<AddButton onClick={jest.fn()}>{''}</AddButton>);
//       expect(screen.getByRole('button')).toBeInTheDocument();
//     });

//     test('EP — children absent : bouton rendu sans crash', () => {
//       render(<AddButton onClick={jest.fn()} />);
//       expect(screen.getByRole('button')).toBeInTheDocument();
//     });

//     test('EP — children = élément JSX : rendu correctement', () => {
//       render(
//         <AddButton onClick={jest.fn()}>
//           <span>Texte enrichi</span>
//         </AddButton>
//       );
//       expect(screen.getByText('Texte enrichi')).toBeInTheDocument();
//     });

//   });

//   describe('Partition onClick', () => {

//     test('EP — onClick = fonction valide : appelée au clic', () => {
//       const fn = jest.fn();
//       render(<AddButton onClick={fn}>Test</AddButton>);
//       fireEvent.click(screen.getByRole('button'));
//       expect(fn).toHaveBeenCalledTimes(1);
//     });

//     test('EP — onClick = undefined : pas de crash', () => {
//       render(<AddButton onClick={undefined}>Test</AddButton>);
//       expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
//     });

//     test('EP — onClick = null : pas de crash', () => {
//       render(<AddButton onClick={null}>Test</AddButton>);
//       expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
//     });

//   });

//   describe('Partition icon', () => {

//     test('EP — icon = composant valide : rendu sans crash', () => {
//       render(
//         <AddButton onClick={jest.fn()} icon={ShoppingCart}>
//           Acheter
//         </AddButton>
//       );
//       expect(screen.getByRole('button')).toBeInTheDocument();
//     });

//     test('EP — icon absent : icône par défaut (Plus) utilisée', () => {
//       render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
//       expect(screen.getByRole('button')).toBeInTheDocument();
//     });

//   });

// });

// // ─── BVA (Boundary Value Analysis) ───────────────────────────────────────────
// // Frontières sur children (longueur du texte)

// describe('AddButton — BVA (analyse des valeurs limites)', () => {

//   test('BVA — children = 1 caractère (borne min non vide)', () => {
//     render(<AddButton onClick={jest.fn()}>A</AddButton>);
//     expect(screen.getByText('A')).toBeInTheDocument();
//   });

//   test('BVA — children = 2 caractères (juste au-dessus du min)', () => {
//     render(<AddButton onClick={jest.fn()}>AB</AddButton>);
//     expect(screen.getByText('AB')).toBeInTheDocument();
//   });

//   test('BVA — children = texte long (50 caractères)', () => {
//     const texte = 'A'.repeat(50);
//     render(<AddButton onClick={jest.fn()}>{texte}</AddButton>);
//     expect(screen.getByText(texte)).toBeInTheDocument();
//   });

//   test('BVA — onClick appelée exactement 1 fois par clic', () => {
//     const fn = jest.fn();
//     render(<AddButton onClick={fn}>Test</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn).toHaveBeenCalledTimes(1); // ni 0, ni 2
//   });

//   test('BVA — onClick appelée exactement 2 fois sur 2 clics', () => {
//     const fn = jest.fn();
//     render(<AddButton onClick={fn}>Test</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn).toHaveBeenCalledTimes(2);
//   });

// });

// // ─── BVA ROBUSTE ──────────────────────────────────────────────────────────────
// // Valeurs hors domaine / types incorrects

// describe('AddButton — BVA Robuste (valeurs hors domaine)', () => {

//   test('BVA robuste — children = nombre : rendu sans crash', () => {
//     render(<AddButton onClick={jest.fn()}>{42}</AddButton>);
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

//   test('BVA robuste — children = tableau : rendu sans crash', () => {
//     render(
//       <AddButton onClick={jest.fn()}>
//         {['Ajouter', ' ', 'membre']}
//       </AddButton>
//     );
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

//   test('BVA robuste — onClick = string au lieu de fonction : pas de crash au rendu', () => {
//     // Ne doit pas crasher au rendu (le crash éventuel n'arrive qu'au clic)
//     expect(() =>
//       render(<AddButton onClick="pas_une_fonction">Test</AddButton>)
//     ).not.toThrow();
//   });

//   test('BVA robuste — icon = null : pas de crash', () => {
//     render(<AddButton onClick={jest.fn()} icon={null}>Test</AddButton>);
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

//   test('BVA robuste — children = texte très long (500 caractères)', () => {
//     const texte = 'X'.repeat(500);
//     render(<AddButton onClick={jest.fn()}>{texte}</AddButton>);
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

// });

// // ─── PAIRWISE ─────────────────────────────────────────────────────────────────
// // Paramètres : icon (défaut|custom) × children (présent|absent) × onClick (fn|undefined)
// // Paires couvrant toutes les combinaisons en 4 tests

// describe('AddButton — Pairwise (combinaisons de paramètres)', () => {

//   test('Pairwise 1 — icon=défaut, children=présent, onClick=fn', () => {
//     const fn = jest.fn();
//     render(<AddButton onClick={fn}>Ajouter</AddButton>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn).toHaveBeenCalledTimes(1);
//     expect(screen.getByText('Ajouter')).toBeInTheDocument();
//   });

//   test('Pairwise 2 — icon=défaut, children=absent, onClick=undefined', () => {
//     render(<AddButton onClick={undefined} />);
//     expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
//   });

//   test('Pairwise 3 — icon=custom, children=présent, onClick=undefined', () => {
//     render(
//       <AddButton onClick={undefined} icon={ShoppingCart}>
//         Acheter
//       </AddButton>
//     );
//     expect(screen.getByText('Acheter')).toBeInTheDocument();
//   });

//   test('Pairwise 4 — icon=custom, children=absent, onClick=fn', () => {
//     const fn = jest.fn();
//     render(<AddButton onClick={fn} icon={ShoppingCart} />);
//     fireEvent.click(screen.getByRole('button'));
//     expect(fn).toHaveBeenCalledTimes(1);
//   });

// });

// // ─── STYLE ET ACCESSIBILITÉ ───────────────────────────────────────────────────

// describe('AddButton — Style et accessibilité', () => {

//   test('le bouton a le role "button"', () => {
//     render(<AddButton onClick={jest.fn()}>Test</AddButton>);
//     expect(screen.getByRole('button')).toBeInTheDocument();
//   });

//   test('le bouton est visible dans le DOM', () => {
//     render(<AddButton onClick={jest.fn()}>Test</AddButton>);
//     expect(screen.getByRole('button')).toBeVisible();
//   });

//   test('mouseEnter ne provoque pas de crash', () => {
//     render(<AddButton onClick={jest.fn()}>Test</AddButton>);
//     expect(() =>
//       fireEvent.mouseEnter(screen.getByRole('button'))
//     ).not.toThrow();
//   });

//   test('mouseLeave ne provoque pas de crash', () => {
//     render(<AddButton onClick={jest.fn()}>Test</AddButton>);
//     fireEvent.mouseEnter(screen.getByRole('button'));
//     expect(() =>
//       fireEvent.mouseLeave(screen.getByRole('button'))
//     ).not.toThrow();
//   });

// });




import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddButton from '../../renderer/components/AddButton';
import { ShoppingCart } from 'lucide-react';

// ─── DESCRIPTION ──────────────────────────────────────────────────────────────
// Techniques appliquées :
//   - EP  (Equivalence Partitioning) : classes valides / invalides
//   - BVA (Boundary Value Analysis)  : frontières des props
//   - BVA Robuste                    : valeurs hors domaine / types incorrects
//   - CFG (Control Flow Graph)       : chemins onClick fourni / non fourni
//   - DFG (Data Flow Graph)          : def → use sur onClick et children
//   - Pairwise                       : combinaisons icon × children × onClick

// ─── CFG ──────────────────────────────────────────────────────────────────────
// Chemins du composant :
//   Chemin 1 : onClick fourni     → handler appelé au clic
//   Chemin 2 : onClick non fourni → pas de crash au clic
//   Chemin 3 : icon par défaut    → Plus affiché
//   Chemin 4 : icon personnalisée → icône custom affichée

describe('AddButton — CFG (chemins de contrôle)', () => {

  test('CFG chemin 1 — onClick fourni : appelé au clic', () => {
    const handleClick = jest.fn();
    render(<AddButton onClick={handleClick}>Ajouter</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('CFG chemin 2 — onClick non fourni : aucun crash au clic', () => {
    render(<AddButton>Ajouter</AddButton>);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('CFG chemin 3 — icon par défaut (Plus) : rendu sans icon prop', () => {
    render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('CFG chemin 4 — icon personnalisée : rendu avec icon prop', () => {
    render(
      <AddButton onClick={jest.fn()} icon={ShoppingCart}>
        Acheter
      </AddButton>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

});

// ─── DFG ──────────────────────────────────────────────────────────────────────
// Flux de données :
//   DEF onClick  → USE dans l'attribut onClick du bouton
//   DEF children → USE dans le rendu du texte
//   DEF icon     → USE dans le rendu du composant icône

describe('AddButton — DFG (flux de données)', () => {

  test('DFG — DEF onClick → USE : la fonction reçue est bien celle appelée', () => {
    const fn = jest.fn();
    render(<AddButton onClick={fn}>Test</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toBe(fn); // même référence
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('DFG — DEF children="Ajouter membre" → USE : texte affiché', () => {
    render(<AddButton onClick={jest.fn()}>Ajouter membre</AddButton>);
    expect(screen.getByText('Ajouter membre')).toBeInTheDocument();
  });

  test('DFG — DEF children modifié → USE : nouveau texte affiché', () => {
    const { rerender } = render(
      <AddButton onClick={jest.fn()}>Ancien texte</AddButton>
    );
    rerender(<AddButton onClick={jest.fn()}>Nouveau texte</AddButton>);
    expect(screen.getByText('Nouveau texte')).toBeInTheDocument();
    expect(screen.queryByText('Ancien texte')).not.toBeInTheDocument();
  });

  test('DFG — DEF onClick mis à jour → USE : nouvelle fonction appelée', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const { rerender } = render(<AddButton onClick={fn1}>Test</AddButton>);
    rerender(<AddButton onClick={fn2}>Test</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn1).not.toHaveBeenCalled();
  });

});

// ─── EP (Equivalence Partitioning) ────────────────────────────────────────────
// Partitions :
//   children : [string non vide] | [string vide] | [absent]
//   onClick  : [fonction]        | [undefined]   | [null]
//   icon     : [composant React] | [absent]

describe('AddButton — EP (partitionnement en classes)', () => {

  describe('Partition children', () => {

    test('EP — children valide (string) : texte affiché', () => {
      render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
      expect(screen.getByText('Ajouter')).toBeInTheDocument();
    });

    test('EP — children vide ("") : bouton rendu sans texte', () => {
      render(<AddButton onClick={jest.fn()}>{''}</AddButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('EP — children absent : bouton rendu sans crash', () => {
      render(<AddButton onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('EP — children = élément JSX : rendu correctement', () => {
      render(
        <AddButton onClick={jest.fn()}>
          <span>Texte enrichi</span>
        </AddButton>
      );
      expect(screen.getByText('Texte enrichi')).toBeInTheDocument();
    });

  });

  describe('Partition onClick', () => {

    test('EP — onClick = fonction valide : appelée au clic', () => {
      const fn = jest.fn();
      render(<AddButton onClick={fn}>Test</AddButton>);
      fireEvent.click(screen.getByRole('button'));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('EP — onClick = undefined : pas de crash', () => {
      render(<AddButton onClick={undefined}>Test</AddButton>);
      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    test('EP — onClick = null : pas de crash', () => {
      render(<AddButton onClick={null}>Test</AddButton>);
      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

  });

  describe('Partition icon', () => {

    test('EP — icon = composant valide : rendu sans crash', () => {
      render(
        <AddButton onClick={jest.fn()} icon={ShoppingCart}>
          Acheter
        </AddButton>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('EP — icon absent : icône par défaut (Plus) utilisée', () => {
      render(<AddButton onClick={jest.fn()}>Ajouter</AddButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

  });

});

// ─── BVA (Boundary Value Analysis) ───────────────────────────────────────────
// Frontières sur children (longueur du texte)

describe('AddButton — BVA (analyse des valeurs limites)', () => {

  test('BVA — children = 1 caractère (borne min non vide)', () => {
    render(<AddButton onClick={jest.fn()}>A</AddButton>);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('BVA — children = 2 caractères (juste au-dessus du min)', () => {
    render(<AddButton onClick={jest.fn()}>AB</AddButton>);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  test('BVA — children = texte long (50 caractères)', () => {
    const texte = 'A'.repeat(50);
    render(<AddButton onClick={jest.fn()}>{texte}</AddButton>);
    expect(screen.getByText(texte)).toBeInTheDocument();
  });

  test('BVA — onClick appelée exactement 1 fois par clic', () => {
    const fn = jest.fn();
    render(<AddButton onClick={fn}>Test</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1); // ni 0, ni 2
  });

  test('BVA — onClick appelée exactement 2 fois sur 2 clics', () => {
    const fn = jest.fn();
    render(<AddButton onClick={fn}>Test</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(2);
  });

});

// ─── BVA ROBUSTE ──────────────────────────────────────────────────────────────
// Valeurs hors domaine / types incorrects

describe('AddButton — BVA Robuste (valeurs hors domaine)', () => {

  test('BVA robuste — children = nombre : rendu sans crash', () => {
    render(<AddButton onClick={jest.fn()}>{42}</AddButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('BVA robuste — children = tableau : rendu sans crash', () => {
    render(
      <AddButton onClick={jest.fn()}>
        {['Ajouter', ' ', 'membre']}
      </AddButton>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('BVA robuste — onClick = string au lieu de fonction : pas de crash au rendu', () => {
    // Ne doit pas crasher au rendu (le crash éventuel n'arrive qu'au clic)
    expect(() =>
      render(<AddButton onClick="pas_une_fonction">Test</AddButton>)
    ).not.toThrow();
  });

  test('BVA robuste — icon = null : React lève une erreur (comportement attendu)', () => {
    // icon=null est hors domaine : React ne peut pas rendre null comme composant
    // On vérifie que le composant lève bien une erreur dans ce cas
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<AddButton onClick={jest.fn()} icon={null}>Test</AddButton>)
    ).toThrow();
    consoleError.mockRestore();
  });

  test('BVA robuste — children = texte très long (500 caractères)', () => {
    const texte = 'X'.repeat(500);
    render(<AddButton onClick={jest.fn()}>{texte}</AddButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

});

// ─── PAIRWISE ─────────────────────────────────────────────────────────────────
// Paramètres : icon (défaut|custom) × children (présent|absent) × onClick (fn|undefined)
// Paires couvrant toutes les combinaisons en 4 tests

describe('AddButton — Pairwise (combinaisons de paramètres)', () => {

  test('Pairwise 1 — icon=défaut, children=présent, onClick=fn', () => {
    const fn = jest.fn();
    render(<AddButton onClick={fn}>Ajouter</AddButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Ajouter')).toBeInTheDocument();
  });

  test('Pairwise 2 — icon=défaut, children=absent, onClick=undefined', () => {
    render(<AddButton onClick={undefined} />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  test('Pairwise 3 — icon=custom, children=présent, onClick=undefined', () => {
    render(
      <AddButton onClick={undefined} icon={ShoppingCart}>
        Acheter
      </AddButton>
    );
    expect(screen.getByText('Acheter')).toBeInTheDocument();
  });

  test('Pairwise 4 — icon=custom, children=absent, onClick=fn', () => {
    const fn = jest.fn();
    render(<AddButton onClick={fn} icon={ShoppingCart} />);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

});

// ─── STYLE ET ACCESSIBILITÉ ───────────────────────────────────────────────────

describe('AddButton — Style et accessibilité', () => {

  test('le bouton a le role "button"', () => {
    render(<AddButton onClick={jest.fn()}>Test</AddButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('le bouton est visible dans le DOM', () => {
    render(<AddButton onClick={jest.fn()}>Test</AddButton>);
    expect(screen.getByRole('button')).toBeVisible();
  });

  test('mouseEnter ne provoque pas de crash', () => {
    render(<AddButton onClick={jest.fn()}>Test</AddButton>);
    expect(() =>
      fireEvent.mouseEnter(screen.getByRole('button'))
    ).not.toThrow();
  });

  test('mouseLeave ne provoque pas de crash', () => {
    render(<AddButton onClick={jest.fn()}>Test</AddButton>);
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(() =>
      fireEvent.mouseLeave(screen.getByRole('button'))
    ).not.toThrow();
  });

});