import type { Connection } from "snowflake-sdk";
import type { Snowflake } from "core/snowflake";

export type Env = {
  Variables: {
    snowflake: Snowflake;
  };
};
