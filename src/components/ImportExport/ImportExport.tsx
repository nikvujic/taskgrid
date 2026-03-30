import { useRef, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { exportData, importData } from '../../store/boardsSlice';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './ImportExport.css';

type ImportState =
  | { step: 'idle' }
  | { step: 'confirm'; json: string; boardCount: number }
  | { step: 'error'; kind: 'parse' | 'format' | 'empty' };

export default function ImportExport() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ step: 'idle' });

  function handleExport() {
    dispatch(exportData());
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      try {
        const parsed = JSON.parse(raw) as { boards?: unknown };
        if (!parsed || !Array.isArray(parsed.boards)) {
          setState({ step: 'error', kind: 'format' });
          return;
        }
        if (parsed.boards.length === 0) {
          setState({ step: 'error', kind: 'empty' });
          return;
        }
        setState({ step: 'confirm', json: raw, boardCount: parsed.boards.length });
      } catch {
        setState({ step: 'error', kind: 'parse' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleConfirmImport() {
    if (state.step !== 'confirm') return;
    dispatch(importData(state.json));
    setState({ step: 'idle' });
  }

  return (
    <div className="import-export">
      <button className="ie-btn" onClick={handleExport} title="Export boards as JSON">
        Export
      </button>
      <button className="ie-btn" onClick={handleImportClick} title="Import boards from JSON">
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {state.step === 'confirm' && (
        <ConfirmModal
          title="Import data"
          message={`This will replace all your current boards with ${state.boardCount} imported ${state.boardCount === 1 ? 'board' : 'boards'}. Continue?`}
          confirmLabel="Import"
          variant="primary"
          onConfirm={handleConfirmImport}
          onClose={() => setState({ step: 'idle' })}
        />
      )}
      {state.step === 'error' && (
        <ConfirmModal
          title="Import failed"
          message={
            state.kind === 'parse' ? 'Could not parse file. Make sure it is valid JSON.' :
            state.kind === 'empty' ? 'The imported file contains no boards.' :
            <>
              <p>Invalid JSON format. Expected:</p>
              <pre className="import-example">
{`{
  "boards": [
    {
      "name": "My Board",
      "lists": [ ... ]
    }
  ]
}`}
              </pre>
            </>
          }
          confirmLabel="Close"
          variant="dismiss"
          onConfirm={() => setState({ step: 'idle' })}
          onClose={() => setState({ step: 'idle' })}
        />
      )}
    </div>
  );
}
