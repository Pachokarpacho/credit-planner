import React from 'react';

interface ExportPanelProps {
  onExport: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport }) => {
  return (
    <div className="mb-3">
      <button onClick={onExport} className="btn btn-primary">
        Экспорт в PDF
      </button>
    </div>
  );
};

export default ExportPanel;