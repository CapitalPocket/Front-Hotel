// components/server/InvoicesTable.tsx
import React from 'react';
import { fetchFilteredCandidatos } from '@/app/lib/data';
import InvoicesTableClient from './tableClient';

export default async function InvoicesTable({
  query,
  currentPage,
  user,
}: {
  query: string;
  currentPage: number;
  user: any;
}) {
  const tickets = await fetchFilteredCandidatos(query, currentPage, user);

  return <InvoicesTableClient tickets={tickets} user={user} />;
}
