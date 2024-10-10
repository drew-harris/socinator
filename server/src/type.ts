import type { Connection } from "snowflake-sdk";

export type Env = {
  Variables: {
    snowflake: Connection;
  };
};
