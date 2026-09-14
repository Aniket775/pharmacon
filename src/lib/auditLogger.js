import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Log an audit event to Supabase
 *
 * @param {Object} event
 * @param {string} event.actorName
 * @param {string} event.actorRole
 * @param {string} event.action
 * @param {string} event.entity
 * @param {string} event.entityId
 * @param {string} [event.details]
 * @param {string} [event.actorId]
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
    id: 'AE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    actor_id: actorId,
    actor_name: actorName,
    actor_role: actorRole,
    action,
    entity,
    entity_id: String(entityId),
    details,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    console.info('[Audit Log Demo]', auditRecord);
    return auditRecord;
  }

  try {
    const { error } = await supabase.from('audit_events').insert([auditRecord]);
    if (error) {
      console.warn('Audit logging error:', error.message);
    }
  } catch (err) {
    console.warn('Audit log write failed:', err);
  }

  return auditRecord;
}
