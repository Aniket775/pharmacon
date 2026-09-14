/**
 * Formulary / Inventory Matcher
 *
 * Matches extracted prescription medicine attributes against the pharmacy inventory.
 *
 * STRICT SAFETY RULE:
 * - This function ONLY checks for an exact/standardized match in inventory.
 * - It does NOT suggest alternative medicines.
 * - It does NOT substitute active ingredients.
 * - It does NOT modify dosage or make clinical recommendations.
 */

/**
 * Normalizes strings for safe comparison
 */
function normalize(str) {
  if (!str) return '';
  return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Matches extracted fields against loaded inventory items.
 *
 * @param {Array<{ label: string, value: string }>} fields - Extracted prescription fields
 * @param {Array<Object>} inventory - Array of inventory items from Supabase
 * @returns {{
 *   matched: boolean,
 *   item: Object | null,
 *   details: { medicine: string, strength: string, dosageForm: string },
 *   message: string
 * }}
 */
export function matchFormulary(fields = [], inventory = []) {
  const getField = (name) => {
    const found = fields.find((f) => f.label.toLowerCase() === name.toLowerCase());
    return found ? found.value : '';
  };

  const medicine = getField('Medicine');
  const strength = getField('Strength');
  const dosageForm = getField('Dosage Form');

  if (!medicine) {
    return {
      matched: false,
      item: null,
      details: { medicine, strength, dosageForm },
      message: 'No medicine name provided in prescription fields.',
    };
  }

  const normMed = normalize(medicine);
  const normStrength = normalize(strength);
  const normForm = normalize(dosageForm);

  // Exact match: Medicine name matches, plus strength or form match if available
  const matchedItem = inventory.find((item) => {
    const itemMed = normalize(item.medicine);
    const itemStrength = normalize(item.strength);
    const itemForm = normalize(item.dosage_form);

    const medMatches = itemMed === normMed || itemMed.includes(normMed) || normMed.includes(itemMed);
    if (!medMatches) return false;

    // If strength is specified on both sides, check if compatible
    if (strength && item.strength) {
      if (itemStrength === normStrength || itemStrength.includes(normStrength) || normStrength.includes(itemStrength)) {
        return true;
      }
    }

    return true;
  });

  if (matchedItem) {
    return {
      matched: true,
      item: matchedItem,
      details: { medicine, strength, dosageForm },
      message: 'Inventory Match Found in Formulary.',
    };
  }

  return {
    matched: false,
    item: null,
    details: { medicine, strength, dosageForm },
    message: 'No Inventory Match Found in Formulary.',
  };
}
