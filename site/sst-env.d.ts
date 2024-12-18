/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "CAM_DB_URI": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "REDSHIFT_DATABASE": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "REDSHIFT_HOST": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "REDSHIFT_PASSWORD": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "REDSHIFT_USER": {
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
    "TYPESENSE_HOST": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "TYPESENSE_KEY": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
