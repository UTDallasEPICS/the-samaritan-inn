import { prisma } from '@/lib/prisma';
import { can } from '@/lib/permissions';
import type { ServerSessionInfo } from '@/lib/getServerSessionInfo';

// Which pass/curfew/work-schedule requests a user may list:
// - admin / lead lifecoach: every request
// - caseworker: only requests assigned to them
// - everyone else: only their own submissions
export function requestListWhere(session: ServerSessionInfo) {
  if (can(session.role, 'VIEW_ALL_CASEWORKER_REQUESTS')) return undefined;
  if (can(session.role, 'VIEW_ALL_REQUESTS')) return { assignedCaseworkerId: session.id };
  return { userId: session.id };
}

// Attaches the assigned caseworker's name to each request in one query.
export async function withAssignedCaseworkerNames<T extends { assignedCaseworkerId: string | null }>(
  records: T[]
): Promise<(T & { assignedCaseworkerName: string | null })[]> {
  const ids = [...new Set(records.map(r => r.assignedCaseworkerId).filter((id): id is string => !!id))];
  const caseworkers = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
    : [];
  const names = new Map(caseworkers.map(c => [c.id, c.name]));

  return records.map(r => ({
    ...r,
    assignedCaseworkerName: r.assignedCaseworkerId ? names.get(r.assignedCaseworkerId) ?? null : null,
  }));
}
