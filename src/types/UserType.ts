export type UpdateProfileReqType = {
  avatar?: File | null;
  user_name?: string;
  email?: string;
  about?: string;
  isPrivate?: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type UpdateProfileType = {
  avatar?: string;
  user_name?: string;
  email?: string;
  about?: string;
  avatar_key?: string;
  isPrivate?: boolean;
  password?: string;
};
export type ChangePasswordType = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
