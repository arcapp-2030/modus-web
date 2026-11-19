'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UserProfileForm {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  cpf: string;
  rg: string;
  rgIssueDate: string;
  cnh: string;
  cnhExpiry: string;
  passportNumber: string;
  passportExpiry: string;
  usVisaNumber: string;
  usVisaExpiry: string;
  proofOfResidenceUrl: string;
  cpfDocumentUrl: string;
  rgDocumentUrl: string;
  cnhDocumentUrl: string;
  passportDocumentUrl: string;
  usVisaDocumentUrl: string;
}

const initialForm: UserProfileForm = {
  name: '',
  email: '',
  phone: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
  cpf: '',
  rg: '',
  rgIssueDate: '',
  cnh: '',
  cnhExpiry: '',
  passportNumber: '',
  passportExpiry: '',
  usVisaNumber: '',
  usVisaExpiry: '',
  proofOfResidenceUrl: '',
  cpfDocumentUrl: '',
  rgDocumentUrl: '',
  cnhDocumentUrl: '',
  passportDocumentUrl: '',
  usVisaDocumentUrl: '',
};

function toDateInputValue(value?: string | Date | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export default function SettingsPage() {
  const [form, setForm] = useState<UserProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof UserProfileForm | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar perfil');
        const data = await res.json();

        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          zipCode: data.zipCode || '',
          street: data.street || '',
          number: data.number || '',
          complement: data.complement || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Brasil',
          cpf: data.cpf || '',
          rg: data.rg || '',
          rgIssueDate: toDateInputValue(data.rgIssueDate),
          cnh: data.cnh || '',
          cnhExpiry: toDateInputValue(data.cnhExpiry),
          passportNumber: data.passportNumber || '',
          passportExpiry: toDateInputValue(data.passportExpiry),
          usVisaNumber: data.usVisaNumber || '',
          usVisaExpiry: toDateInputValue(data.usVisaExpiry),
          proofOfResidenceUrl: data.proofOfResidenceUrl || '',
          cpfDocumentUrl: data.cpfDocumentUrl || '',
          rgDocumentUrl: data.rgDocumentUrl || '',
          cnhDocumentUrl: data.cnhDocumentUrl || '',
          passportDocumentUrl: data.passportDocumentUrl || '',
          usVisaDocumentUrl: data.usVisaDocumentUrl || '',
        });
      } catch {
        setError('Não foi possível carregar os dados da conta.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const updateField = <K extends keyof UserProfileForm>(field: K, value: UserProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    field: keyof UserProfileForm,
    file?: File
  ) => {
    if (!file) return;
    setUploadingField(field);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'user-documents');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Falha ao enviar arquivo');
      }

      updateField(field, data.url);
      setMessage('Arquivo enviado com sucesso. Clique em "Salvar Alterações" para gravar no perfil.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar arquivo.';
      setError(msg);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        rgIssueDate: form.rgIssueDate || null,
        cnhExpiry: form.cnhExpiry || null,
        passportExpiry: form.passportExpiry || null,
        usVisaExpiry: form.usVisaExpiry || null,
      };

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar alterações');

      if (form.name) {
        localStorage.setItem('modus_user_name', form.name);
      }

      setMessage('Dados cadastrais e documentos atualizados com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar alterações.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors';

  const cardClass =
    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl transition-colors';

  const labelClass =
    'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Carregando configurações...
        </p>
      </div>
    );
  }

  const documentAttachments: Array<{
    label: string;
    field: keyof UserProfileForm;
    placeholder: string;
  }> = [
    {
      label: 'Comprovante de Residência',
      field: 'proofOfResidenceUrl',
      placeholder: 'URL do comprovante (conta de luz, água, contrato)',
    },
    {
      label: 'Documento CPF',
      field: 'cpfDocumentUrl',
      placeholder: 'URL da imagem ou PDF do CPF',
    },
    {
      label: 'Documento RG',
      field: 'rgDocumentUrl',
      placeholder: 'URL da imagem ou PDF do RG',
    },
    {
      label: 'Documento CNH',
      field: 'cnhDocumentUrl',
      placeholder: 'URL da imagem ou PDF da CNH',
    },
    {
      label: 'Página do Passaporte',
      field: 'passportDocumentUrl',
      placeholder: 'URL da imagem ou PDF do passaporte',
    },
    {
      label: 'Visto Americano',
      field: 'usVisaDocumentUrl',
      placeholder: 'URL da imagem ou PDF do visto americano',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      {/* Sidebar para navegação interna */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 hidden md:block shrink-0">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-8">
          Modus Viagens
        </h2>
        <nav className="space-y-2 text-sm">
          <Link
            href="/dashboard"
            className="block px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium"
          >
            Configurações
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configurações da Conta & Documentos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gerencie seus dados pessoais, endereço completo, documentos de viagem e comprovantes.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Dados Pessoais */}
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User size={18} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                1. Dados Pessoais & Contato
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>E-mail da Conta</label>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  O e-mail não pode ser alterado por motivos de segurança.
                </p>
              </div>

              <div>
                <label className={labelClass}>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(44) 99999-9999"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>País de Residência</label>
                <input
                  type="text"
                  placeholder="Brasil"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* 2. Endereço */}
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <MapPin size={18} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                2. Endereço Residencial
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>CEP</label>
                <input
                  type="text"
                  placeholder="87000-000"
                  value={form.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Logradouro / Rua</label>
                <input
                  type="text"
                  placeholder="Av. Brasil"
                  value={form.street}
                  onChange={(e) => updateField('street', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Número</label>
                <input
                  type="text"
                  placeholder="123"
                  value={form.number}
                  onChange={(e) => updateField('number', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Complemento</label>
                <input
                  type="text"
                  placeholder="Apto 402 / Bloco B"
                  value={form.complement}
                  onChange={(e) => updateField('complement', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Bairro</label>
                <input
                  type="text"
                  placeholder="Zona 01"
                  value={form.neighborhood}
                  onChange={(e) => updateField('neighborhood', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Cidade</label>
                <input
                  type="text"
                  placeholder="Maringá"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="PR"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value.toUpperCase())}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* 3. Documentos e Vistos */}
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <FileText size={18} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                3. Documentos Pessoais, Passaporte e Visto
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => updateField('cpf', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>RG</label>
                <input
                  type="text"
                  placeholder="00.000.000-0"
                  value={form.rg}
                  onChange={(e) => updateField('rg', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Data de Emissão do RG</label>
                <input
                  type="date"
                  value={form.rgIssueDate}
                  onChange={(e) => updateField('rgIssueDate', e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>

              <div>
                <label className={labelClass}>CNH</label>
                <input
                  type="text"
                  placeholder="Número da CNH"
                  value={form.cnh}
                  onChange={(e) => updateField('cnh', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Data de Validade da CNH</label>
                <input
                  type="date"
                  value={form.cnhExpiry}
                  onChange={(e) => updateField('cnhExpiry', e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Número do Passaporte</label>
                <input
                  type="text"
                  placeholder="Ex: FX123456"
                  value={form.passportNumber}
                  onChange={(e) => updateField('passportNumber', e.target.value.toUpperCase())}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Validade do Passaporte</label>
                <input
                  type="date"
                  value={form.passportExpiry}
                  onChange={(e) => updateField('passportExpiry', e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Visto Americano (Número / Tipo)</label>
                <input
                  type="text"
                  placeholder="Ex: B1/B2 - 123456789"
                  value={form.usVisaNumber}
                  onChange={(e) => updateField('usVisaNumber', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Expiração do Visto Americano</label>
                <input
                  type="date"
                  value={form.usVisaExpiry}
                  onChange={(e) => updateField('usVisaExpiry', e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>
            </div>
          </section>

          {/* 4. Arquivos de Documentos e Comprovante de Residência */}
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Upload size={18} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                4. Arquivos de Documentos & Comprovante de Residência
              </h2>
            </div>

            <div className="space-y-4">
              {documentAttachments.map((doc) => {
                const currentUrl = form[doc.field];
                const isUploading = uploadingField === doc.field;

                return (
                  <div
                    key={doc.field}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {doc.label}
                      </label>
                      {currentUrl && (
                        <a
                          href={currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          Abrir arquivo <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder={doc.placeholder}
                        value={currentUrl}
                        onChange={(e) => updateField(doc.field, e.target.value)}
                        className={inputClass}
                      />

                      <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                        <Upload size={14} />
                        <span>{isUploading ? 'Enviando...' : 'Anexar'}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(doc.field, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploadingField !== null}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}