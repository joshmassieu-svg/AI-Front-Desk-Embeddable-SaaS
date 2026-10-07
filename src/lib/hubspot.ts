/**
 * HubSpot CRM helper (server-side only).
 *
 * Creates a contact, or updates it if the email already exists (no duplicates).
 * It NEVER throws: if HubSpot is down or the token is missing, we only log,
 * so sign-up / billing flows are never broken by the CRM.
 *
 * Required env var: HUBSPOT_ACCESS_TOKEN (Legacy App / Private App token)
 * Token scopes: crm.objects.contacts.read, crm.objects.contacts.write,
 *               crm.schemas.contacts.write (to auto-create custom fields)
 */

const HUBSPOT_API = 'https://api.hubapi.com';

// Custom fields we create in HubSpot (Contacts). Prefixed to avoid clashes.
const CUSTOM_PROPERTIES: { name: string; label: string; type: 'string' | 'datetime' | 'enumeration'; options?: string[] }[] = [
  { name: 'flowdexx_signup_method', label: 'Flowdexx Sign-up Method', type: 'string' },
  { name: 'flowdexx_signup_date', label: 'Flowdexx Sign-up Date', type: 'string' },
  { name: 'flowdexx_website_name', label: 'Flowdexx Website Name', type: 'string' },
  { name: 'flowdexx_website_domain', label: 'Flowdexx Website Domain', type: 'string' },
  { name: 'flowdexx_onboarded', label: 'Flowdexx Onboarding Finished', type: 'string' },
  { name: 'flowdexx_onboarded_date', label: 'Flowdexx Onboarding Date', type: 'string' },
  { name: 'flowdexx_plan', label: 'Flowdexx Plan', type: 'string' },
  { name: 'flowdexx_billing_cycle', label: 'Flowdexx Billing Cycle', type: 'string' },
  { name: 'flowdexx_subscription_status', label: 'Flowdexx Subscription Status', type: 'string' },
];

// Standard HubSpot fields that always exist.
const STANDARD_KEYS = new Set(['email', 'firstname', 'lastname', 'company', 'website']);

let propertiesEnsured = false;

function token(): string | null {
  const t = process.env.HUBSPOT_ACCESS_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

async function ensureCustomProperties(authHeader: string) {
  if (propertiesEnsured) return;
  for (const p of CUSTOM_PROPERTIES) {
    try {
      const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/contacts`, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: p.name,
          label: p.label,
          type: 'string',
          fieldType: 'text',
          groupName: 'contactinformation',
        }),
      });
      // 409 = already exists (fine). Anything else is logged but not fatal.
      if (!res.ok && res.status !== 409) {
        console.warn(`[hubspot] could not create property ${p.name}: ${res.status}`);
      }
    } catch (err) {
      console.warn(`[hubspot] property create failed for ${p.name}:`, err);
    }
  }
  propertiesEnsured = true;
}

export interface HubSpotContactInput {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  website?: string;
  flowdexx_signup_method?: string;
  flowdexx_signup_date?: string;
  flowdexx_website_name?: string;
  flowdexx_website_domain?: string;
  flowdexx_onboarded?: string;
  flowdexx_onboarded_date?: string;
  flowdexx_plan?: string;
  flowdexx_billing_cycle?: string;
  flowdexx_subscription_status?: string;
}

async function upsert(authHeader: string, email: string, properties: Record<string, string>): Promise<Response> {
  // Update by email; if the contact doesn't exist (404), create it.
  const updateUrl = `${HUBSPOT_API}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`;
  const upd = await fetch(updateUrl, {
    method: 'PATCH',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties }),
  });
  if (upd.status !== 404) return upd;

  return fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { email, ...properties } }),
  });
}

export async function syncHubSpotContact(input: HubSpotContactInput): Promise<boolean> {
  const t = token();
  if (!t) {
    console.warn('[hubspot] HUBSPOT_ACCESS_TOKEN not set — skipping CRM sync');
    return false;
  }
  const email = input.email?.trim().toLowerCase();
  if (!email) return false;

  const authHeader = `Bearer ${t}`;
  try {
    await ensureCustomProperties(authHeader);

    const all: Record<string, string> = {};
    for (const [k, v] of Object.entries(input)) {
      if (k === 'email' || v === undefined || v === null || v === '') continue;
      all[k] = String(v);
    }

    let res = await upsert(authHeader, email, all);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[hubspot] sync with custom fields failed (${res.status}): ${body.slice(0, 300)}`);
      // Retry with only standard fields so the contact still lands in the CRM.
      const standardOnly: Record<string, string> = {};
      for (const [k, v] of Object.entries(all)) if (STANDARD_KEYS.has(k)) standardOnly[k] = v;
      res = await upsert(authHeader, email, standardOnly);
      if (!res.ok) {
        console.error(`[hubspot] standard-field sync also failed (${res.status})`);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('[hubspot] sync threw:', err);
    return false;
  }
}
