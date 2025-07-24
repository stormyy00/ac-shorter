export type links = {
  id: string;
  original: string;
  shortenUrl: string;
  clicks: number;
  createdAt: number;
};

export interface statistics {
  all_links: all[];
  per_links: per_links[];
  total_links: number;
}

export type all = {
 month: string; total_clicks: number;
};
export type per_links = {

    slug_url: string;
    total_clicks: number;
    created_at: string;
};
