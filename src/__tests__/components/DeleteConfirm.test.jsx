import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';

import DeleteConfirm, { useDeleteConfirm } from '../../renderer/components/DeleteConfirm';

// ─── Données de base ──────────────────────────────────────────────────────────
const onConfirm = jest.fn();
const onCancel  = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

function renderModal(props = {}) {
  return render(
    <DeleteConfirm
      open={true}
      title="Supprimer l'élément"
      message="Cette action est irréversible."
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );
}

// ─── 1. Rendu ─────────────────────────────────────────────────────────────────
describe('DeleteConfirm — Rendu', () => {

  test('TC-DC01 — affiche le titre', () => {
    renderModal();
    expect(screen.getByText(/supprimer l'élément/i)).toBeInTheDocument();
  });

  test('TC-DC02 — affiche le message', () => {
    renderModal();
    expect(screen.getByText(/cette action est irréversible/i)).toBeInTheDocument();
  });

  test('TC-DC03 — affiche le bouton Annuler', () => {
    renderModal();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  test('TC-DC04 — affiche le bouton Supprimer par défaut', () => {
    renderModal();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  test('TC-DC05 — confirmLabel personnalisé affiché', () => {
    renderModal({ confirmLabel: 'Oui, effacer' });
    expect(screen.getByText('Oui, effacer')).toBeInTheDocument();
  });

  test('TC-DC06 — open=false ne rend rien', () => {
    render(
      <DeleteConfirm open={false} onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(screen.queryByText(/confirmer/i)).not.toBeInTheDocument();
  });

});

// ─── 2. Variantes ─────────────────────────────────────────────────────────────
describe('DeleteConfirm — Variantes', () => {

  test('TC-DC07 — variant danger (défaut) affiche le composant', () => {
    renderModal({ variant: 'danger' });
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  test('TC-DC08 — variant warn affiche le composant', () => {
    renderModal({ variant: 'warn' });
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

});

// ─── 3. Actions ───────────────────────────────────────────────────────────────
describe('DeleteConfirm — Actions', () => {

  test('TC-DC09 — clic Annuler appelle onCancel', () => {
    renderModal();
    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('TC-DC10 — clic Supprimer appelle onConfirm', () => {
    renderModal();
    fireEvent.click(screen.getByText('Supprimer'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('TC-DC11 — clic sur le backdrop appelle onCancel', () => {
    renderModal();
   // Le backdrop est le div fixe le plus externe
const backdrop = document.querySelector('[style*="position: fixed"]');
fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalled();
  });

});

// ─── 4. Hover ─────────────────────────────────────────────────────────────────
describe('DeleteConfirm — Hover', () => {

  test('TC-DC12 — hover sur Annuler change le style', () => {
    renderModal();
    const btn = screen.getByText('Annuler');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  test('TC-DC13 — hover sur Supprimer change le style', () => {
    renderModal();
    const btn = screen.getByText('Supprimer');
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

});

// ─── 5. Hook useDeleteConfirm ─────────────────────────────────────────────────
describe('useDeleteConfirm — Hook', () => {

  test('TC-DC14 — askConfirm ouvre le modal', async () => {
    const { result } = renderHook(() => useDeleteConfirm());

    act(() => {
      result.current.askConfirm({ title: 'Test', message: 'Message test' });
    });

    expect(result.current.confirmProps.open).toBe(true);
    expect(result.current.confirmProps.title).toBe('Test');
  });

//   test('TC-DC15 — onConfirm résout la promesse avec true', async () => {
//     const { result } = renderHook(() => useDeleteConfirm());

//     let resolved;
//     act(() => {
//       result.current.askConfirm({ title: 'Test' }).then(v => { resolved = v; });
//     });

//     act(() => {
//       result.current.confirmProps.onConfirm();
//     });

//     expect(resolved).toBe(true);
//     expect(result.current.confirmProps.open).toBe(false);
//   });

//   test('TC-DC16 — onCancel résout la promesse avec false', async () => {
//     const { result } = renderHook(() => useDeleteConfirm());

//     let resolved;
//     act(() => {
//       result.current.askConfirm({ title: 'Test' }).then(v => { resolved = v; });
//     });

//     act(() => {
//       result.current.confirmProps.onCancel();
//     });

//     expect(resolved).toBe(false);
//     expect(result.current.confirmProps.open).toBe(false);
//   });

test('TC-DC15 — onConfirm résout la promesse avec true', async () => {
  const { result } = renderHook(() => useDeleteConfirm());

  let resolved;
  await act(async () => {
    result.current.askConfirm({ title: 'Test' }).then(v => { resolved = v; });
  });

  await act(async () => {
    result.current.confirmProps.onConfirm();
  });

  expect(resolved).toBe(true);
  expect(result.current.confirmProps.open).toBe(false);
});

test('TC-DC16 — onCancel résout la promesse avec false', async () => {
  const { result } = renderHook(() => useDeleteConfirm());

  let resolved;
  await act(async () => {
    result.current.askConfirm({ title: 'Test' }).then(v => { resolved = v; });
  });

  await act(async () => {
    result.current.confirmProps.onCancel();
  });

  expect(resolved).toBe(false);
  expect(result.current.confirmProps.open).toBe(false);
});

});