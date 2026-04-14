import { useRef, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { exportData, importData } from '../../store/boardsSlice';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './ImportExport.css';

type ImportState =
  | { step: 'idle' }
  | { step: 'confirm'; json: string; boardCount: number }
  | { step: 'importing'; json: string; boardCount: number }
  | { step: 'error'; kind: 'parse' | 'format' | 'empty' | 'api' };

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

  async function handleConfirmImport() {
    if (state.step !== 'confirm') return;
    const { json, boardCount } = state;
    setState({ step: 'importing', json, boardCount });
    try {
      await dispatch(importData(json)).unwrap();
      setState({ step: 'idle' });
    } catch {
      setState({ step: 'error', kind: 'api' });
    }
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
      {(state.step === 'confirm' || state.step === 'importing') && (
        <ConfirmModal
          title="Import data"
          message={`This will replace all your current boards with ${state.boardCount} imported ${state.boardCount === 1 ? 'board' : 'boards'}. Continue?`}
          confirmLabel={state.step === 'importing' ? 'Importing…' : 'Import'}
          variant="primary"
          loading={state.step === 'importing'}
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
            state.kind === 'api' ? 'Could not save imported data to the server. Please try again.' :
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
