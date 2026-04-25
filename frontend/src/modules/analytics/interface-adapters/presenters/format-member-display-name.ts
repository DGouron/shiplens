export function formatMemberDisplayName(memberName: string): string {
  const trimmed = memberName.trim();
  if (trimmed === '') return '';
  const atIndex = trimmed.indexOf('@');
  const localPart = atIndex === -1 ? trimmed : trimmed.slice(0, atIndex);
  if (localPart === '') return '';
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}
