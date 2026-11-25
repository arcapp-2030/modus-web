'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { authStorage } from '@/lib/auth-storage';

export interface UploadedFileResult {
  url: string;
  filename?: string;
  originalName?: string;
  mime?: string;
  size?: number;
}

interface UploadFileButtonProps {
  value?: string | null;
  onUploaded: (result: UploadedFileResult) => void;
  onClear?: () => void;
  label?: string;
  accept?: string;
  className?: string;
}

export function UploadFileButton({
  value,
  onUploaded,
  onClear,
  label = 'Anexar Arquivo (PDF / Imagem)',
  accept = 'application/pdf,image/jpeg,image/png,image/webp',
  className = '',
}: UploadFileButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = authStorage.getToken?.();
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Falha ao enviar arquivo.');
      }

      onUploaded({
        url: data.url,
        filename: data.filename,
        originalName: data.originalName || file.name,
        mime: data.mime || file.type,
        size: data.size || file.size,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro no upload.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <FileUp size={14} />
              <span>{value ? 'Substituir Arquivo' : label}</span>
            </>
          )}
        </button>

        {value && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[11px] font-semibold max-w-full">
            <CheckCircle2 size={13} className="shrink-0" />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate max-w-[200px] underline"
            >
              Arquivo anexado
            </a>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-0.5 rounded hover:bg-emerald-500/20"
                title="Remover anexo"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}