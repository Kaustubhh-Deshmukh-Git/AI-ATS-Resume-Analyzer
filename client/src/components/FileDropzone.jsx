import { useState, useRef } from 'react';
import api from '../api/http.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function FileDropzone({ onParsed, onError, disabled = false }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected';

    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf' || file.type === '';

    if (!isPdfExt || !isPdfMime) {
      return 'Invalid file type. Only PDF documents (.pdf) are supported.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 5MB.`;
    }

    return null;
  };

  const processFile = async (file) => {
    setErrorMessage('');
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      if (onError) onError(validationError);
      return;
    }

    setSelectedFile(file);
    setParsing(true);
    setParseResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const data = await api.post('/resumes/parse', formData);
      setParseResult(data);
      if (onParsed) {
        onParsed({
          ...data,
          filename: file.name,
          fileSize: file.size,
        });
      }
    } catch (err) {
      const msg = err.message || 'Failed to upload and parse PDF resume';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setParsing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !parsing) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (disabled || parsing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setParseResult(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onParsed) {
      onParsed(null);
    }
  };

  const triggerPicker = () => {
    if (!disabled && !parsing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        data-testid="resume-file-input"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled || parsing}
      />

      {errorMessage && (
        <div className="alert-error" role="alert" id="upload-error-alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          id="dropzone-trigger"
          data-testid="dropzone-trigger"
          className={`dropzone-container ${dragOver ? 'is-dragover' : ''}`}
          onClick={triggerPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerPicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload resume PDF file"
        >
          <div className="dropzone-icon">📄</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
            Drop your resume PDF here, or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Supports PDF files up to 5MB (max 10 pages). Text-based resumes only.
          </p>
        </div>
      ) : (
        <div className="file-preview-card" id="selected-file-preview">
          <div className="file-info-group">
            <span className="file-badge-pdf">PDF</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatFileSize(selectedFile.size)}
                </span>
                {parseResult && (
                  <span className="parsed-badge">
                    ✓ {parseResult.pages} {parseResult.pages === 1 ? 'page' : 'pages'} · {parseResult.charCount.toLocaleString()} chars
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {parsing ? (
              <span className="spinner" />
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-secondary"
                id="remove-file-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                title="Remove and select another file"
              >
                Change File
              </button>
            )}
          </div>
        </div>
      )}

      {parsing && (
        <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Extracting text and validating PDF structure...
          </p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" />
          </div>
        </div>
      )}
    </div>
  );
}
