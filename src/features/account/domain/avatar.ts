export const farmerAvatarKeys = Array.from({ length: 10 }, (_, index) => `farmer-${String(index + 1).padStart(2, "0")}`);

export function avatarImagePath(avatarKey: string): string {
  return `/avatars/${avatarKey}.svg`;
}
