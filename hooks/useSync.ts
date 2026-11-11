'use client';

import { useState } from 'react';

export function useSync(syncKey: string) {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      // Simula uma sincronização ou chamada de refresh com o servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, triggerSync };
}