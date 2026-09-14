import { createClient } from '@supabase/supabase-js';

const url = 'https://gvlidgvvwpdhocyjigfr.supabase.co';
const key = 'sb_publishable_uJRb1N_Tk6hDIJcqTIi3lg_XCX51eY_';

const supabase = createClient(url, key);

async function testSupabase() {
  console.log('--- Testing Live Supabase Connection ---');
  
  // Test inventory_items
  const { data: inv, error: invError } = await supabase.from('inventory_items').select('*').limit(5);
  if (invError) {
    console.error('inventory_items error:', invError.message, invError.details, invError.hint);
  } else {
    console.log(`inventory_items: ${inv.length} items found:`, inv.map(i => `${i.medicine} (${i.stock})`));
  }

  // Test team_members
  const { data: team, error: teamError } = await supabase.from('team_members').select('*').limit(5);
  if (teamError) {
    console.error('team_members error:', teamError.message);
  } else {
    console.log(`team_members: ${team.length} members found:`, team.map(t => t.name));
  }

  // Test prescriptions
  const { data: rx, error: rxError } = await supabase.from('prescriptions').select('*').limit(5);
  if (rxError) {
    console.error('prescriptions error:', rxError.message);
  } else {
    console.log(`prescriptions: ${rx.length} records found:`, rx.map(r => `${r.id} (${r.status})`));
  }

  // Test refill_requests
  const { data: refills, error: refillError } = await supabase.from('refill_requests').select('*').limit(5);
  if (refillError) {
    console.error('refill_requests error:', refillError.message);
  } else {
    console.log(`refill_requests: ${refills.length} requests found:`, refills.map(r => `${r.id} (${r.status})`));
  }

  // Test audit_events
  const { data: audit, error: auditError } = await supabase.from('audit_events').select('*').limit(5);
  if (auditError) {
    console.error('audit_events error:', auditError.message);
  } else {
    console.log(`audit_events: ${audit.length} events found:`, audit.map(a => a.action));
  }

  // Test storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('storage listBuckets error:', bucketsError.message);
  } else {
    console.log(`Storage buckets:`, buckets.map(b => b.name));
  }
}

testSupabase().catch(console.error);
