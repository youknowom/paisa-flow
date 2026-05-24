const GRADIENTS = [
  ["#7C3AED", "#5B21B6"],
  ["#00D26A", "#00A855"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#06B6D4", "#0891B2"],
  ["#EC4899", "#DB2777"],
  ["#6366F1", "#4F46E5"],
  ["#14B8A6", "#0D9488"],
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarGradient(name: string): string {
  const index = hashString(name) % GRADIENTS.length;
  const [from, to] = GRADIENTS[index];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}
