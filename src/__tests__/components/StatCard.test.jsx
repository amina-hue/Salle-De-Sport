// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import StatCard from '../../renderer/components/StatCard';
// import { Users, TrendingUp, ShoppingBag } from 'lucide-react';

// // ─── DESCRIPTION ──────────────────────────────────────────────────────────────
// // Props du composant :
// //   title  : string    — label de la carte
// //   value  : any       — valeur principale affichée
// //   color  : string    — couleur texte (non utilisée directement dans le JSX visible)
// //   bg     : string    — couleur fond (non utilisée directement dans le JSX visible)
// //   accent : string    — couleur fond du cercle icône
// //   icon   : component — composant icône Lucide (optionnel)
// //   trend  : string    — texte tendance (optionnel, affiché en vert)
// //   sub    : string    — texte secondaire (optionnel)
// //
// // Techniques appliquées :
// //   CFG          — chemins : icon présent/absent, trend présent/absent
// //   DFG          — def → use sur title, value, trend, sub, accent, icon
// //   EP           — classes valides/invalides par prop
// //   BVA          — frontières sur value (0, 1, négatif, grand nombre)
// //   BVA Robuste  — types incorrects (null, undefined, objet, tableau)
// //   Pairwise     — combinaisons icon × trend × sub

// // ─── CFG ──────────────────────────────────────────────────────────────────────
// // Chemin 1 : Icon fourni     → rendu du cercle avec icône
// // Chemin 2 : Icon absent     → cercle rendu sans icône
// // Chemin 3 : trend fourni    → span vert affiché
// // Chemin 4 : trend absent    → span vert non affiché

// describe('StatCard — CFG (chemins de contrôle)', () => {

//   test('CFG chemin 1 — Icon fourni : cercle avec icône rendu', () => {
//     render(<StatCard title="Adhérents" value={120} icon={Users} accent="#e53935" />);
//     expect(screen.getByText('Adhérents')).toBeInTheDocument();
//   });

//   test('CFG chemin 2 — Icon absent : carte rendue sans icône, pas de crash', () => {
//     render(<StatCard title="Adhérents" value={120} accent="#e53935" />);
//     expect(screen.getByText('Adhérents')).toBeInTheDocument();
//     expect(screen.getByText('120')).toBeInTheDocument();
//   });

//   test('CFG chemin 3 — trend fourni : span tendance affiché', () => {
//     render(<StatCard title="Revenus" value={5000} trend="+12% ce mois" />);
//     expect(screen.getByText('+12% ce mois')).toBeInTheDocument();
//   });

//   test('CFG chemin 4 — trend absent : aucun span tendance dans le DOM', () => {
//     render(<StatCard title="Revenus" value={5000} />);
//     expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
//   });

//   test('CFG chemin 5 — sub fourni : texte secondaire affiché', () => {
//     render(<StatCard title="Stock" value={30} sub="produits disponibles" />);
//     expect(screen.getByText('produits disponibles')).toBeInTheDocument();
//   });

//   test('CFG chemin 6 — sub absent : pas de texte secondaire', () => {
//     render(<StatCard title="Stock" value={30} />);
//     expect(screen.queryByText('produits disponibles')).not.toBeInTheDocument();
//   });

// });

// // ─── DFG ──────────────────────────────────────────────────────────────────────
// // DEF title   → USE dans <p>
// // DEF value   → USE dans <h2>
// // DEF trend   → USE dans <span>
// // DEF sub     → USE dans <p>
// // DEF accent  → USE dans style backgroundColor du cercle
// // DEF icon    → USE dans rendu conditionnel {Icon && <Icon />}

// describe('StatCard — DFG (flux de données)', () => {

//   test('DFG — DEF title="Adhérents" → USE : affiché dans le paragraphe', () => {
//     render(<StatCard title="Adhérents" value={0} />);
//     expect(screen.getByText('Adhérents')).toBeInTheDocument();
//   });

//   test('DFG — DEF value=42 → USE : affiché dans le h2', () => {
//     render(<StatCard title="Test" value={42} />);
//     expect(screen.getByText('42')).toBeInTheDocument();
//   });

//   test('DFG — DEF trend="+5%" → USE : affiché dans le span vert', () => {
//     render(<StatCard title="Test" value={10} trend="+5%" />);
//     expect(screen.getByText('+5%')).toBeInTheDocument();
//   });

//   test('DFG — DEF sub="membres actifs" → USE : affiché en bas', () => {
//     render(<StatCard title="Test" value={10} sub="membres actifs" />);
//     expect(screen.getByText('membres actifs')).toBeInTheDocument();
//   });

//   test('DFG — DEF accent="#ff0000" → USE : style backgroundColor appliqué au cercle', () => {
//     const { container } = render(
//       <StatCard title="Test" value={10} accent="#ff0000" icon={Users} />
//     );
//     const cercle = container.querySelector('[style*="background"]');
//     expect(cercle).toBeInTheDocument();
//   });

//   test('DFG — DEF title modifié → USE : nouveau titre affiché', () => {
//     const { rerender } = render(<StatCard title="Ancien" value={0} />);
//     rerender(<StatCard title="Nouveau" value={0} />);
//     expect(screen.getByText('Nouveau')).toBeInTheDocument();
//     expect(screen.queryByText('Ancien')).not.toBeInTheDocument();
//   });

//   test('DFG — DEF value modifié → USE : nouvelle valeur affichée', () => {
//     const { rerender } = render(<StatCard title="Test" value={10} />);
//     rerender(<StatCard title="Test" value={99} />);
//     expect(screen.getByText('99')).toBeInTheDocument();
//     expect(screen.queryByText('10')).not.toBeInTheDocument();
//   });

// });

// // ─── EP (Equivalence Partitioning) ────────────────────────────────────────────
// // Partitions :
// //   title  : [string non vide] | [string vide] | [absent]
// //   value  : [nombre positif]  | [zéro]        | [nombre négatif] | [string]
// //   icon   : [composant React] | [absent]
// //   trend  : [string non vide] | [absent]
// //   sub    : [string non vide] | [absent]

// describe('StatCard — EP (partitionnement en classes)', () => {

//   describe('Partition title', () => {

//     test('EP — title valide (string) : affiché correctement', () => {
//       render(<StatCard title="Membres actifs" value={50} />);
//       expect(screen.getByText('Membres actifs')).toBeInTheDocument();
//     });

//     test('EP — title vide ("") : carte rendue sans crash', () => {
//       render(<StatCard title="" value={50} />);
//       expect(screen.getByText('50')).toBeInTheDocument();
//     });

//     test('EP — title absent : carte rendue sans crash', () => {
//       render(<StatCard value={50} />);
//       expect(screen.getByText('50')).toBeInTheDocument();
//     });

//   });

//   describe('Partition value', () => {

//     test('EP — value = nombre positif : affiché', () => {
//       render(<StatCard title="Test" value={150} />);
//       expect(screen.getByText('150')).toBeInTheDocument();
//     });

//     test('EP — value = 0 : affiché comme zéro', () => {
//       render(<StatCard title="Test" value={0} />);
//       expect(screen.getByText('0')).toBeInTheDocument();
//     });

//     test('EP — value = string "N/A" : affiché tel quel', () => {
//       render(<StatCard title="Test" value="N/A" />);
//       expect(screen.getByText('N/A')).toBeInTheDocument();
//     });

//     test('EP — value = string chiffre "500 DZD" : affiché tel quel', () => {
//       render(<StatCard title="Test" value="500 DZD" />);
//       expect(screen.getByText('500 DZD')).toBeInTheDocument();
//     });

//   });

//   describe('Partition icon', () => {

//     test('EP — icon = composant Lucide valide : rendu sans crash', () => {
//       render(<StatCard title="Test" value={1} icon={Users} accent="#333" />);
//       expect(screen.getByText('Test')).toBeInTheDocument();
//     });

//     test('EP — icon absent : rendu sans crash, pas de SVG orphelin', () => {
//       render(<StatCard title="Test" value={1} accent="#333" />);
//       expect(screen.getByText('Test')).toBeInTheDocument();
//     });

//   });

//   describe('Partition trend', () => {

//     test('EP — trend = string positif : affiché', () => {
//       render(<StatCard title="Test" value={10} trend="+20% ce mois" />);
//       expect(screen.getByText('+20% ce mois')).toBeInTheDocument();
//     });

//     test('EP — trend = string négatif : affiché', () => {
//       render(<StatCard title="Test" value={10} trend="-5% ce mois" />);
//       expect(screen.getByText('-5% ce mois')).toBeInTheDocument();
//     });

//     test('EP — trend absent : aucun élément trend dans le DOM', () => {
//       render(<StatCard title="Test" value={10} />);
//       expect(screen.queryByText(/%/)).not.toBeInTheDocument();
//     });

//   });

// });

// // ─── BVA (Boundary Value Analysis) ────────────────────────────────────────────
// // Frontières sur value numérique

// describe('StatCard — BVA (analyse des valeurs limites)', () => {

//   test('BVA — value = 0 (borne min)', () => {
//     render(<StatCard title="Stock" value={0} />);
//     expect(screen.getByText('0')).toBeInTheDocument();
//   });

//   test('BVA — value = 1 (juste au-dessus du min)', () => {
//     render(<StatCard title="Stock" value={1} />);
//     expect(screen.getByText('1')).toBeInTheDocument();
//   });

//   test('BVA — value = -1 (juste en-dessous du min)', () => {
//     render(<StatCard title="Stock" value={-1} />);
//     expect(screen.getByText('-1')).toBeInTheDocument();
//   });

//   test('BVA — value = 999 (grande valeur courante)', () => {
//     render(<StatCard title="Revenus" value={999} />);
//     expect(screen.getByText('999')).toBeInTheDocument();
//   });

//   test('BVA — value = 1000 (borne millier)', () => {
//     render(<StatCard title="Revenus" value={1000} />);
//     expect(screen.getByText('1000')).toBeInTheDocument();
//   });

//   test('BVA — value = 1001 (juste au-dessus du millier)', () => {
//     render(<StatCard title="Revenus" value={1001} />);
//     expect(screen.getByText('1001')).toBeInTheDocument();
//   });

// });

// // ─── BVA ROBUSTE ──────────────────────────────────────────────────────────────
// // Valeurs hors domaine / types incorrects

// describe('StatCard — BVA Robuste (valeurs hors domaine)', () => {

//   test('BVA robuste — value = null : pas de crash', () => {
//     render(<StatCard title="Test" value={null} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = undefined : pas de crash', () => {
//     render(<StatCard title="Test" value={undefined} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = NaN : pas de crash', () => {
//     render(<StatCard title="Test" value={NaN} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = Infinity : pas de crash', () => {
//     render(<StatCard title="Test" value={Infinity} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = objet : pas de crash', () => {
//     expect(() =>
//       render(<StatCard title="Test" value={{}} />)
//     ).not.toThrow();
//   });

//   test('BVA robuste — value = tableau vide : pas de crash', () => {
//     render(<StatCard title="Test" value={[]} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = très grand nombre (999999999) : pas de crash', () => {
//     render(<StatCard title="Test" value={999999999} />);
//     expect(screen.getByText('999999999')).toBeInTheDocument();
//   });

//   test('BVA robuste — value = nombre négatif très grand (-999999) : pas de crash', () => {
//     render(<StatCard title="Test" value={-999999} />);
//     expect(screen.getByText('-999999')).toBeInTheDocument();
//   });

//   test('BVA robuste — accent = valeur invalide "#ZZZZZZ" : pas de crash', () => {
//     render(<StatCard title="Test" value={10} accent="#ZZZZZZ" icon={Users} />);
//     expect(screen.getByText('Test')).toBeInTheDocument();
//   });

//   test('BVA robuste — toutes les props absentes : rendu minimal sans crash', () => {
//     render(<StatCard />);
//     expect(document.body).toBeTruthy();
//   });

// });

// // ─── PAIRWISE ─────────────────────────────────────────────────────────────────
// // Paramètres : icon (présent|absent) × trend (présent|absent) × sub (présent|absent)
// // 4 tests couvrent toutes les paires

// describe('StatCard — Pairwise (combinaisons de paramètres)', () => {

//   test('Pairwise 1 — icon=présent, trend=présent, sub=présent', () => {
//     render(
//       <StatCard
//         title="Adhérents"
//         value={200}
//         icon={Users}
//         accent="#e53935"
//         trend="+10%"
//         sub="ce mois"
//       />
//     );
//     expect(screen.getByText('Adhérents')).toBeInTheDocument();
//     expect(screen.getByText('+10%')).toBeInTheDocument();
//     expect(screen.getByText('ce mois')).toBeInTheDocument();
//   });

//   test('Pairwise 2 — icon=présent, trend=absent, sub=absent', () => {
//     render(
//       <StatCard
//         title="Revenus"
//         value={5000}
//         icon={TrendingUp}
//         accent="#43a047"
//       />
//     );
//     expect(screen.getByText('Revenus')).toBeInTheDocument();
//     expect(screen.getByText('5000')).toBeInTheDocument();
//   });

//   test('Pairwise 3 — icon=absent, trend=présent, sub=absent', () => {
//     render(
//       <StatCard
//         title="Stock"
//         value={30}
//         trend="-3 unités"
//       />
//     );
//     expect(screen.getByText('-3 unités')).toBeInTheDocument();
//     expect(screen.getByText('30')).toBeInTheDocument();
//   });

//   test('Pairwise 4 — icon=absent, trend=absent, sub=présent', () => {
//     render(
//       <StatCard
//         title="Produits"
//         value={15}
//         sub="en rupture de stock"
//       />
//     );
//     expect(screen.getByText('en rupture de stock')).toBeInTheDocument();
//     expect(screen.getByText('15')).toBeInTheDocument();
//   });

//   test('Pairwise 5 — icon=présent, trend=présent, sub=absent', () => {
//     render(
//       <StatCard
//         title="Ventes"
//         value={88}
//         icon={ShoppingBag}
//         accent="#1e88e5"
//         trend="+8% cette semaine"
//       />
//     );
//     expect(screen.getByText('+8% cette semaine')).toBeInTheDocument();
//     expect(screen.queryByText('en rupture')).not.toBeInTheDocument();
//   });

//   test('Pairwise 6 — icon=absent, trend=présent, sub=présent', () => {
//     render(
//       <StatCard
//         title="Séances"
//         value={44}
//         trend="+2 aujourd'hui"
//         sub="séances planifiées"
//       />
//     );
//     expect(screen.getByText("+2 aujourd'hui")).toBeInTheDocument();
//     expect(screen.getByText('séances planifiées')).toBeInTheDocument();
//   });

// });

// // ─── STRUCTURE ET ACCESSIBILITÉ ───────────────────────────────────────────────

// describe('StatCard — Structure et accessibilité', () => {

//   test('la carte est présente dans le DOM', () => {
//     render(<StatCard title="Test" value={1} />);
//     expect(document.body.firstChild).toBeInTheDocument();
//   });

//   test('le titre est dans un élément <p>', () => {
//     const { container } = render(<StatCard title="Mon titre" value={1} />);
//     const p = container.querySelector('p');
//     expect(p).toHaveTextContent('Mon titre');
//   });

//   test('la valeur est dans un élément <h2>', () => {
//     const { container } = render(<StatCard title="Test" value={777} />);
//     const h2 = container.querySelector('h2');
//     expect(h2).toHaveTextContent('777');
//   });

//   test('trend est dans un <span> quand fourni', () => {
//     const { container } = render(
//       <StatCard title="Test" value={1} trend="+15%" />
//     );
//     const span = container.querySelector('span');
//     expect(span).toHaveTextContent('+15%');
//   });

//   test('plusieurs StatCard rendues simultanément : pas de conflit', () => {
//     render(
//       <div>
//         <StatCard title="Card 1" value={10} />
//         <StatCard title="Card 2" value={20} />
//         <StatCard title="Card 3" value={30} />
//       </div>
//     );
//     expect(screen.getByText('Card 1')).toBeInTheDocument();
//     expect(screen.getByText('Card 2')).toBeInTheDocument();
//     expect(screen.getByText('Card 3')).toBeInTheDocument();
//   });

// });



import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../../renderer/components/StatCard';
import { Users, TrendingUp, ShoppingBag } from 'lucide-react';

// ─── DESCRIPTION ──────────────────────────────────────────────────────────────
// Props du composant :
//   title  : string    — label de la carte
//   value  : any       — valeur principale affichée
//   color  : string    — couleur texte (non utilisée directement dans le JSX visible)
//   bg     : string    — couleur fond (non utilisée directement dans le JSX visible)
//   accent : string    — couleur fond du cercle icône
//   icon   : component — composant icône Lucide (optionnel)
//   trend  : string    — texte tendance (optionnel, affiché en vert)
//   sub    : string    — texte secondaire (optionnel)
//
// Techniques appliquées :
//   CFG          — chemins : icon présent/absent, trend présent/absent
//   DFG          — def → use sur title, value, trend, sub, accent, icon
//   EP           — classes valides/invalides par prop
//   BVA          — frontières sur value (0, 1, négatif, grand nombre)
//   BVA Robuste  — types incorrects (null, undefined, objet, tableau)
//   Pairwise     — combinaisons icon × trend × sub

// ─── CFG ──────────────────────────────────────────────────────────────────────
// Chemin 1 : Icon fourni     → rendu du cercle avec icône
// Chemin 2 : Icon absent     → cercle rendu sans icône
// Chemin 3 : trend fourni    → span vert affiché
// Chemin 4 : trend absent    → span vert non affiché

describe('StatCard — CFG (chemins de contrôle)', () => {

  test('CFG chemin 1 — Icon fourni : cercle avec icône rendu', () => {
    render(<StatCard title="Adhérents" value={120} icon={Users} accent="#e53935" />);
    expect(screen.getByText('Adhérents')).toBeInTheDocument();
  });

  test('CFG chemin 2 — Icon absent : carte rendue sans icône, pas de crash', () => {
    render(<StatCard title="Adhérents" value={120} accent="#e53935" />);
    expect(screen.getByText('Adhérents')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  test('CFG chemin 3 — trend fourni : span tendance affiché', () => {
    render(<StatCard title="Revenus" value={5000} trend="+12% ce mois" />);
    expect(screen.getByText('+12% ce mois')).toBeInTheDocument();
  });

  test('CFG chemin 4 — trend absent : aucun span tendance dans le DOM', () => {
    render(<StatCard title="Revenus" value={5000} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  test('CFG chemin 5 — sub fourni : texte secondaire affiché', () => {
    render(<StatCard title="Stock" value={30} sub="produits disponibles" />);
    expect(screen.getByText('produits disponibles')).toBeInTheDocument();
  });

  test('CFG chemin 6 — sub absent : pas de texte secondaire', () => {
    render(<StatCard title="Stock" value={30} />);
    expect(screen.queryByText('produits disponibles')).not.toBeInTheDocument();
  });

});

// ─── DFG ──────────────────────────────────────────────────────────────────────
// DEF title   → USE dans <p>
// DEF value   → USE dans <h2>
// DEF trend   → USE dans <span>
// DEF sub     → USE dans <p>
// DEF accent  → USE dans style backgroundColor du cercle
// DEF icon    → USE dans rendu conditionnel {Icon && <Icon />}

describe('StatCard — DFG (flux de données)', () => {

  test('DFG — DEF title="Adhérents" → USE : affiché dans le paragraphe', () => {
    render(<StatCard title="Adhérents" value={0} />);
    expect(screen.getByText('Adhérents')).toBeInTheDocument();
  });

  test('DFG — DEF value=42 → USE : affiché dans le h2', () => {
    render(<StatCard title="Test" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('DFG — DEF trend="+5%" → USE : affiché dans le span vert', () => {
    render(<StatCard title="Test" value={10} trend="+5%" />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  test('DFG — DEF sub="membres actifs" → USE : affiché en bas', () => {
    render(<StatCard title="Test" value={10} sub="membres actifs" />);
    expect(screen.getByText('membres actifs')).toBeInTheDocument();
  });

  test('DFG — DEF accent="#ff0000" → USE : style backgroundColor appliqué au cercle', () => {
    const { container } = render(
      <StatCard title="Test" value={10} accent="#ff0000" icon={Users} />
    );
    const cercle = container.querySelector('[style*="background"]');
    expect(cercle).toBeInTheDocument();
  });

  test('DFG — DEF title modifié → USE : nouveau titre affiché', () => {
    const { rerender } = render(<StatCard title="Ancien" value={0} />);
    rerender(<StatCard title="Nouveau" value={0} />);
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
    expect(screen.queryByText('Ancien')).not.toBeInTheDocument();
  });

  test('DFG — DEF value modifié → USE : nouvelle valeur affichée', () => {
    const { rerender } = render(<StatCard title="Test" value={10} />);
    rerender(<StatCard title="Test" value={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

});

// ─── EP (Equivalence Partitioning) ────────────────────────────────────────────
// Partitions :
//   title  : [string non vide] | [string vide] | [absent]
//   value  : [nombre positif]  | [zéro]        | [nombre négatif] | [string]
//   icon   : [composant React] | [absent]
//   trend  : [string non vide] | [absent]
//   sub    : [string non vide] | [absent]

describe('StatCard — EP (partitionnement en classes)', () => {

  describe('Partition title', () => {

    test('EP — title valide (string) : affiché correctement', () => {
      render(<StatCard title="Membres actifs" value={50} />);
      expect(screen.getByText('Membres actifs')).toBeInTheDocument();
    });

    test('EP — title vide ("") : carte rendue sans crash', () => {
      render(<StatCard title="" value={50} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    test('EP — title absent : carte rendue sans crash', () => {
      render(<StatCard value={50} />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

  });

  describe('Partition value', () => {

    test('EP — value = nombre positif : affiché', () => {
      render(<StatCard title="Test" value={150} />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    test('EP — value = 0 : affiché comme zéro', () => {
      render(<StatCard title="Test" value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('EP — value = string "N/A" : affiché tel quel', () => {
      render(<StatCard title="Test" value="N/A" />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test('EP — value = string chiffre "500 DZD" : affiché tel quel', () => {
      render(<StatCard title="Test" value="500 DZD" />);
      expect(screen.getByText('500 DZD')).toBeInTheDocument();
    });

  });

  describe('Partition icon', () => {

    test('EP — icon = composant Lucide valide : rendu sans crash', () => {
      render(<StatCard title="Test" value={1} icon={Users} accent="#333" />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    test('EP — icon absent : rendu sans crash, pas de SVG orphelin', () => {
      render(<StatCard title="Test" value={1} accent="#333" />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

  });

  describe('Partition trend', () => {

    test('EP — trend = string positif : affiché', () => {
      render(<StatCard title="Test" value={10} trend="+20% ce mois" />);
      expect(screen.getByText('+20% ce mois')).toBeInTheDocument();
    });

    test('EP — trend = string négatif : affiché', () => {
      render(<StatCard title="Test" value={10} trend="-5% ce mois" />);
      expect(screen.getByText('-5% ce mois')).toBeInTheDocument();
    });

    test('EP — trend absent : aucun élément trend dans le DOM', () => {
      render(<StatCard title="Test" value={10} />);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

  });

});

// ─── BVA (Boundary Value Analysis) ────────────────────────────────────────────
// Frontières sur value numérique

describe('StatCard — BVA (analyse des valeurs limites)', () => {

  test('BVA — value = 0 (borne min)', () => {
    render(<StatCard title="Stock" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('BVA — value = 1 (juste au-dessus du min)', () => {
    render(<StatCard title="Stock" value={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('BVA — value = -1 (juste en-dessous du min)', () => {
    render(<StatCard title="Stock" value={-1} />);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  test('BVA — value = 999 (grande valeur courante)', () => {
    render(<StatCard title="Revenus" value={999} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  test('BVA — value = 1000 (borne millier)', () => {
    render(<StatCard title="Revenus" value={1000} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  test('BVA — value = 1001 (juste au-dessus du millier)', () => {
    render(<StatCard title="Revenus" value={1001} />);
    expect(screen.getByText('1001')).toBeInTheDocument();
  });

});

// ─── BVA ROBUSTE ──────────────────────────────────────────────────────────────
// Valeurs hors domaine / types incorrects

describe('StatCard — BVA Robuste (valeurs hors domaine)', () => {

  test('BVA robuste — value = null : pas de crash', () => {
    render(<StatCard title="Test" value={null} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — value = undefined : pas de crash', () => {
    render(<StatCard title="Test" value={undefined} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — value = NaN : pas de crash', () => {
    render(<StatCard title="Test" value={NaN} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — value = Infinity : pas de crash', () => {
    render(<StatCard title="Test" value={Infinity} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — value = objet : React lève une erreur (comportement attendu)', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<StatCard title="Test" value={{}} />)
    ).toThrow();
    consoleError.mockRestore();
  });

  test('BVA robuste — value = tableau vide : pas de crash', () => {
    render(<StatCard title="Test" value={[]} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — value = très grand nombre (999999999) : pas de crash', () => {
    render(<StatCard title="Test" value={999999999} />);
    expect(screen.getByText('999999999')).toBeInTheDocument();
  });

  test('BVA robuste — value = nombre négatif très grand (-999999) : pas de crash', () => {
    render(<StatCard title="Test" value={-999999} />);
    expect(screen.getByText('-999999')).toBeInTheDocument();
  });

  test('BVA robuste — accent = valeur invalide "#ZZZZZZ" : pas de crash', () => {
    render(<StatCard title="Test" value={10} accent="#ZZZZZZ" icon={Users} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('BVA robuste — toutes les props absentes : rendu minimal sans crash', () => {
    render(<StatCard />);
    expect(document.body).toBeTruthy();
  });

});

// ─── PAIRWISE ─────────────────────────────────────────────────────────────────
// Paramètres : icon (présent|absent) × trend (présent|absent) × sub (présent|absent)
// 4 tests couvrent toutes les paires

describe('StatCard — Pairwise (combinaisons de paramètres)', () => {

  test('Pairwise 1 — icon=présent, trend=présent, sub=présent', () => {
    render(
      <StatCard
        title="Adhérents"
        value={200}
        icon={Users}
        accent="#e53935"
        trend="+10%"
        sub="ce mois"
      />
    );
    expect(screen.getByText('Adhérents')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('ce mois')).toBeInTheDocument();
  });

  test('Pairwise 2 — icon=présent, trend=absent, sub=absent', () => {
    render(
      <StatCard
        title="Revenus"
        value={5000}
        icon={TrendingUp}
        accent="#43a047"
      />
    );
    expect(screen.getByText('Revenus')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  test('Pairwise 3 — icon=absent, trend=présent, sub=absent', () => {
    render(
      <StatCard
        title="Stock"
        value={30}
        trend="-3 unités"
      />
    );
    expect(screen.getByText('-3 unités')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('Pairwise 4 — icon=absent, trend=absent, sub=présent', () => {
    render(
      <StatCard
        title="Produits"
        value={15}
        sub="en rupture de stock"
      />
    );
    expect(screen.getByText('en rupture de stock')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('Pairwise 5 — icon=présent, trend=présent, sub=absent', () => {
    render(
      <StatCard
        title="Ventes"
        value={88}
        icon={ShoppingBag}
        accent="#1e88e5"
        trend="+8% cette semaine"
      />
    );
    expect(screen.getByText('+8% cette semaine')).toBeInTheDocument();
    expect(screen.queryByText('en rupture')).not.toBeInTheDocument();
  });

  test('Pairwise 6 — icon=absent, trend=présent, sub=présent', () => {
    render(
      <StatCard
        title="Séances"
        value={44}
        trend="+2 aujourd'hui"
        sub="séances planifiées"
      />
    );
    expect(screen.getByText("+2 aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText('séances planifiées')).toBeInTheDocument();
  });

});

// ─── STRUCTURE ET ACCESSIBILITÉ ───────────────────────────────────────────────

describe('StatCard — Structure et accessibilité', () => {

  test('la carte est présente dans le DOM', () => {
    render(<StatCard title="Test" value={1} />);
    expect(document.body.firstChild).toBeInTheDocument();
  });

  test('le titre est dans un élément <p>', () => {
    const { container } = render(<StatCard title="Mon titre" value={1} />);
    const p = container.querySelector('p');
    expect(p).toHaveTextContent('Mon titre');
  });

  test('la valeur est dans un élément <h2>', () => {
    const { container } = render(<StatCard title="Test" value={777} />);
    const h2 = container.querySelector('h2');
    expect(h2).toHaveTextContent('777');
  });

  test('trend est dans un <span> quand fourni', () => {
    const { container } = render(
      <StatCard title="Test" value={1} trend="+15%" />
    );
    const span = container.querySelector('span');
    expect(span).toHaveTextContent('+15%');
  });

  test('plusieurs StatCard rendues simultanément : pas de conflit', () => {
    render(
      <div>
        <StatCard title="Card 1" value={10} />
        <StatCard title="Card 2" value={20} />
        <StatCard title="Card 3" value={30} />
      </div>
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

});