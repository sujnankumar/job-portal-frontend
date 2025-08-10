// Centralized placeholder asset paths
export const DEFAULT_USER_AVATAR = "/default-avatar.png"; // generic user avatar (upload file to public/)
export const DEFAULT_COMPANY_LOGO = "/default-company-logo.png"; // generic company logo
export const DEFAULT_COVER_IMAGE = "/default-cover.jpg"; // generic cover/banner image

// Helper functions
export const resolveUserAvatar = (avatar?: string | null, isEmployer?: boolean) => {
  if (avatar && avatar.trim() !== "") return avatar;
  return DEFAULT_USER_AVATAR;
};

export const resolveCompanyLogo = (logo?: string | null) => {
  if (logo && logo.trim() !== "") return logo;
  return DEFAULT_COMPANY_LOGO;
};

export const resolveCoverImage = (cover?: string | null) => {
  if (cover && cover.trim() !== "") return cover;
  return DEFAULT_COVER_IMAGE;
};
