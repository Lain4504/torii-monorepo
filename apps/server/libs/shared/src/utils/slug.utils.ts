import slugify from 'slugify';

/**
 * Generate URL-friendly slug from title
 * Handles Vietnamese characters and special cases like "đ" and "d"
 * @param title - The title to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  // slugify with options to handle Vietnamese characters properly
  // locale: 'vi' handles Vietnamese characters like đ, ư, ơ, etc.
  // lower: true converts to lowercase
  // strict: true removes special characters
  // trim: true removes leading/trailing spaces
  const slug = slugify(title, {
    locale: 'vi',
    lower: true,
    strict: true,
    trim: true,
  });

  // Ensure max length of 255 characters (database constraint)
  return slug.substring(0, 255);
}

/**
 * Ensure unique slug by appending counter suffix if slug already exists
 * @param baseSlug - The base slug to make unique
 * @param checkExists - Async function that checks if a slug exists (returns true if exists)
 * @param maxAttempts - Maximum number of attempts to generate unique slug (default: 100)
 * @returns Unique slug
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 100,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let existing = await checkExists(slug);

  // Nếu slug đã tồn tại, tự động thêm suffix
  while (existing) {
    slug = `${baseSlug}-${counter}`;
    existing = await checkExists(slug);
    counter++;

    // Giới hạn tối đa để tránh vòng lặp vô hạn
    if (counter > maxAttempts) {
      throw new Error(
        `Unable to generate unique slug for "${baseSlug}" after ${maxAttempts} attempts. Please use a different slug.`,
      );
    }
  }

  return slug;
}




