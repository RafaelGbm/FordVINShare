import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Valid icon names for the icon set the app uses throughout.
 *
 * Typing icon maps and props with this instead of `string` turns a misspelled
 * glyph into a compile error rather than a blank square at runtime.
 */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type UserRole = 'client' | 'analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cpf?: string;
  phone?: string;
  created_at: string;
}
