// Turns a Nigerian phone number into the digits-only format wa.me needs.
// 0803 123 4567 -> 2348031234567
export function toWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  else if (digits.length === 10) digits = "234" + digits;
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}