export const roleMap = {
  admin: ['me230003007@iiti.ac.in', 'admin2@gmail.com'],
  professor: ['prof1@gmail.com', 'prof2@gmail.com'],
  student: ['student1@gmail.com', 'student2@gmail.com']
};

export function getRoleByEmail(email) {
  for (const [role, emails] of Object.entries(roleMap)) {
    if (emails.includes(email)) return role;
  }
  return 'student'; // default fallback
}
