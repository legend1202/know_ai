export interface ThirdPartyConfig {
  _id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  [provider: string]: any;  // This line allows dynamic access with string keys.
  google?: {
    token?: {
      access_token?: string;
      expiry_date?: number;
      scope?: string;
      token_type?: string;
    };
  };
}
