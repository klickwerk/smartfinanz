/**
 * Utility functions for family member management
 */

/**
 * Assign a consistent color to a family member based on their index
 * @param index - The index of the member in the list or a random number
 * @returns A Tailwind CSS gradient class string
 */
export function getColorForMember(index: number): string {
  const colors = [
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-pink-500 to-pink-400',
    'from-green-500 to-green-400',
    'from-yellow-500 to-yellow-400',
    'from-red-500 to-red-400',
    'from-indigo-500 to-indigo-400',
    'from-orange-500 to-orange-400',
    'from-teal-500 to-teal-400',
    'from-cyan-500 to-cyan-400'
  ];
  
  // Ensure we get a valid index even if a negative number is provided
  const safeIndex = Math.abs(index) % colors.length;
  return colors[safeIndex];
}

/**
 * Generate avatar initials from a name
 * @param name - The name to generate initials from
 * @returns A string of up to 2 characters representing the initials
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get a display name from an email address
 * @param email - The email address
 * @returns A display name derived from the email
 */
export function getNameFromEmail(email: string): string {
  if (!email) return 'User';
  
  // Extract the part before the @ symbol
  const namePart = email.split('@')[0];
  
  // Convert to title case and replace dots/underscores with spaces
  return namePart
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}