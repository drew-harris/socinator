import { JobData } from "core/types";

export interface SOCGroup {
  SOCCode: string;
  SOCTitle: string;
  SOCGroup: string;
  SOCDefinition: string;
}

export interface SOCMatch {
  SOCCode: string;
  SOCTitle: string;
  explanation: string;
}

export interface SOCMatchResult {
  jobData: JobData;
  socMatch: SOCMatch;
}

export interface SOCMatchResponse {
  SOCCode: string;
  SOCTitle: string;
  error?: string;
}

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
