import type { Redshift } from "core/redshift";

export type Env = {
  Variables: {
    redshift: Redshift;
  };
};
