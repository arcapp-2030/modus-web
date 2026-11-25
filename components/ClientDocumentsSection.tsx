'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, FileText, FolderOpen, Plus } from 'lucide-react';
import { authStorage } from '@/lib/auth-storage';
import { UploadFileButton, type UploadedFileResult } from './UploadFileButton';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface ClientDocumentItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface ClientDocumentsSectionProps {
  clients: ClientOption[];
}

const CATEGORIES = [
  { value: 'PASSPORT', label: 'Passaporte' },
  { value: 'VISA', label: 'Visto' },
  { value: 'INSURANCE', label: 'Seguro Viagem' },
  { value: 'VOUCHER', label: 'Voucher' },
  { value: 'OTHER', label: 'Outro' },
];

export function ClientDocumentsSection({ clients }: ClientDocumentsSectionProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PASSPORT');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileResult | null>(null);

  const [documents, setDocuments] = useState<ClientDocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const loadDocuments = useCallback(async (clientId: string) => {
    if (!clientId) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const token = authStorage.getToken?.();
      const res = await fetch(`/api/admin/clients/${clientId}/documents`, {
        cache: 'no-store',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignora erro transitório
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadDocuments(selectedClientId);
    }
  }, [selectedClientId, loadDocuments]);

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedClientId || !title.trim() || !uploadedFile?.url) {
      setFeedback({
        type: 'err',
        text: 'Selecione o cliente, informe o título e faça o upload do arquivo.',
      });
      return;
    }

    setSaving(true);
    try {
      const token = authStorage.getToken?.();
      const res = await fetch(`/api/admin/clients/${selectedClientId}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          fileUrl: uploadedFile.url,
          fileName: uploadedFile.originalName || uploadedFile.filename || null,
          mimeType: uploadedFile.mime || null,
          fileSize: uploadedFile.size ?? null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar documento.');
      }

      setTitle('');
      setNotes('');
      setUploadedFile(null);
      setFeedback({
        type: 'ok',
        text: 'Documento salvo e vinculado ao cliente com sucesso.',
      });
      await loadDocuments(selectedClientId);
    } catch (err: unknown) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao salvar documento.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <FolderOpen size={18} className="text-sky-600 dark:text-sky-400" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Documentos do Cliente
        </h2>
      </div>

      <form onSubmit={handleSaveDocument} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Cliente
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Título do Documento
          </label>
          <input
            type="text"
            placeholder="Ex.: Passaporte principal, Seguro Europa..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Observações (opcional)
          </label>
          <input
            type="text"
            placeholder="Validade, número ou observação"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <UploadFileButton
            value={uploadedFile?.url}
            onUploaded={(res) => setUploadedFile(res)}
            onClear={() => setUploadedFile(null)}
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Plus size={15} />
            <span>{saving ? 'Salvando...' : 'Salvar Documento'}</span>
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border ${
            feedback.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
              : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Lista de documentos do cliente selecionado */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Arquivos do Cliente ({documents.length})
        </h3>

        {loadingDocs ? (
          <p className="text-xs text-slate-400 py-3">Carregando documentos...</p>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            Nenhum documento anexado para este cliente ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={16} className="text-sky-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{doc.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {doc.category}
                      {doc.notes ? ` • ${doc.notes}` : ''}
                    </p>
                  </div>
                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold shrink-0"
                >
                  <span>Abrir</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}