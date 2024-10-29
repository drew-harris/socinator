export type Inference = (input: {
  metadata: Partial<JobData>;
  jobId: number;
}) => Promise<SOCCodeResult>;

export interface SOCCodeResult {
  jobId: string;
  jobTitle: string;
  majorSOCCode: string;
  majorSOCTitle: string;
  minorSOCCode?: string;
  minorSOCTitle?: string;
  broadSOCCode?: string;
  broadSOCTitle?: string;
  detailedSOCCode?: string;
  detailedSOCTitle?: string;
}

export interface JobData {
  job_id: string;
  vertical: string;
  role_primary: string;
  company: string;
  post_date: string;
  salary: number | null;
  salary_modeled: number | null;
  location: string;
  city: string;
  state: string;
  state_long: string;
  zip: string;
  county: string;
  region_state: string;
  country: string;
  latitude: string;
  longitude: string;
  sic_primary: string;
  naics_primary: string;
  company_ref: string | null;
  ticker: string;
  company_parent: string;
  region_country: string;
  region_global: string;
  region_local: string;
  currency: string;
  language: string;
  scrape_timestamp: string;
  modify_timestamp: string;
  meta_num_roles: string;
  meta_num_tags: string;
  meta_num_titles: string;
  title: string;
  title_clean: string;
  industry: string | null;
  role_primary_co: string | null;
  role_primary_ind: string | null;
  seniority: string | null;
  soc6d: string | null;
  soc6d_title: string | null;
  career_stream: string | null;
  job_family: string | null;
  sub_job_family: string | null;
  role_extended: string | null;
  roles: string[];
  tags: string[];
  job_summary?: string;
  [key: string]: any;
}
