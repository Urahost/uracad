/**
 * Generates a random SSN in the format XXX-XX-XXXX
 */
export function generateSSN(): string {
  // Generate 3 random numbers for the first part
  const part1 = Math.floor(Math.random() * 900 + 100).toString();
  
  // Generate 2 random numbers for the second part
  const part2 = Math.floor(Math.random() * 90 + 10).toString();
  
  // Generate 4 random numbers for the third part
  const part3 = Math.floor(Math.random() * 9000 + 1000).toString();
  
  // Combine all parts with hyphens
  return `${part1}-${part2}-${part3}`;
} 