# socinator

# Setup Instructions
This repo is based on SST so it is easy to deploy and run in any aws organization

Add the following to your ~/.aws/credentials
```
[socinator]
aws_access_key_id = <access key here>
aws_secret_access_key = <secret key here>
```

[Sst](https://sst.dev/)

For fulltext search you also need to have a running typesense container somewhere accessible over http. There is a commented out thing to use it in sst but its probably broken.  Please fix that. 

For the fulltext search, thats all in the scripts folder currently. 


# Very important!!!!!!!
Theres also another database of previous things we've inferenced. its called cam db in the code. 
Theres a postgres dump of it available at https://files.drewh.net/api/public/dl/pPsgPD8Y/camdb.sql

lowkey just call me if you need help: 9728492232

Good luck - Drew Harris
