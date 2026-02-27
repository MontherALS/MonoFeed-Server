export type SignUpRequestType = {
  email: string;
  password: string;
  confirmPassword: string;
  user_name: string;
};
export type SignUpType = {
  user_name: string;
  email: string;
  password: string;
};
export type LogInDataType = {
  email: string;
  password: string;
};
export type LogInUserDataType = {
  id: string;
  user_name: string;
  email: string;
  createdAt: Date;
};
