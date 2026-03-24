import { useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { exportData, importData } from '../../store/boardsSlice';
import './ImportExport.css';

export default function ImportExport() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const json = ev.target?.result as string;
      const confirmed = window.confirm(
        'This will replace ALL your current boards with the imported data. Continue?',
      );
      if (!confirmed) return;
      try {
        dispatch(importData(json));
      } catch {
        alert('Import failed: invalid JSON format.');
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-imported if needed
    e.target.value = '';
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
    </div>
  );
}
