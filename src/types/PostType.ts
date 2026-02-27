export type PostType = {
  key: string;
  post_title: string;
  description?: string | null;
  category?: string[];
};

export type UpdatePostType = {
  post_title?: string;
  description?: string | null;
  category?: string[];
};
