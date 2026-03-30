import { useRef, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { exportData, importData } from '../../store/boardsSlice';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './ImportExport.css';

export default function ImportExport() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingJson, setPendingJson] = useState<string | null>(null);

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
      setPendingJson(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleConfirmImport() {
    if (!pendingJson) return;
    dispatch(importData(pendingJson));
    setPendingJson(null);
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
      {pendingJson && (
        <ConfirmModal
          title="Import data"
          message="This will replace all your current boards with the imported data. Continue?"
          confirmLabel="Import"
          variant="primary"
          onConfirm={handleConfirmImport}
          onClose={() => setPendingJson(null)}
        />
      )}
    </div>
  );
}
