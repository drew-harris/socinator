/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "DB_HOST": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "DB_PASS": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "SNOWFLAKE_PASSWORD": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "Server": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "Site": {
      "type": "sst.aws.StaticSite"
      "url": string
    }
    "db": {
      "dbUrl": string
      "type": "postgresql.index/database.Database"
    }
  }
}