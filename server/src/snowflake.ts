import { createConnection } from "snowflake-sdk";
import { Resource } from "sst";

export const snowflake = createConnection({
  account: "NTHBCVT-TALENTEDGE",
  username: "TALENTEDGE",
  warehouse: "TALENTEDGE_WH",
  password: Resource.SNOWFLAKE_PASSWORD.value,
  authenticator: "SNOWFLAKE",
});

snowflake.connect((err, connection) => {
  if (err) {
    console.error("Snowflake connection error:", err);
    process.exit(1);
  } else {
    console.log("connected to snowflake");
  }
});
