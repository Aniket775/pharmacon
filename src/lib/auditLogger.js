import { AuditRepository } from './dataStore';

/**
 * Log an audit event with resilient Supabase and local persistence
 */
export async function logAuditEvent({
  actorName = 'Anonymous User',
  actorRole = 'guest',
  action,
  entity,
  entityId,
  details = '',
  actorId = '',
}) {
  const auditRecord = {
    actor_id: actorId,
    actor_name: actorName,
    actor_role: actorRole,
    action,
    entity,
    entity_id: String(entityId),
    details,
  };

  try {
    return await AuditRepository.logEvent(auditRecord);
  } catch (err) {
    console.warn('Audit log write note:', err);
    return auditRecord;
  }
}

