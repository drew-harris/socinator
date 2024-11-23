#!/opt/homebrew/bin/nu
let api_key = $env.API_KEY

let base_url = "https://soc-fulltext.drewh.net";

# Headers as record
let headers = {
    "X-TYPESENSE-API-KEY": $api_key
    "Content-Type": "application/json"
};

let collection_name = 'llm_results'

def httppost [url: string, body: any] {
    http post --content-type application/json $url $body --headers $headers -e
}

###


# DO INFERENCE
let body = {
  jobId: 88676764
}
httppost $"($backend_url)/quick-infer" $body | print

# Get ollama models
http get "https://ollama.drewh.net/api/tags" | get models | flatten


# API Settings

###

# Get Collections


# get specific collection
http get $"https://soc-fulltext.drewh.net/collections/($collection_name)" --headers $headers | table -e

# Delete created collection
http delete $"https://typesense.drewh.net/collections/stufflol" --headers $headers | print

print $new_collection | table -e;

# create new collection
http post $"https://typesense.drewh.net/collections" ($new_collection | to json) --headers $headers | print

# Search
let params = {
  q: "Manager"
  query_by: "title,roles,tags,predictedbroadsoctitle,predictedmajorsoctitle"
}
let url = $"https://soc-fulltext.drewh.net/collections/($collection_name)/documents/search?($params | url build-query)"
http get $url --headers $headers  | get hits | first | to json


zsh -c "curl -s 'https://jsonplaceholder.typicode.com/posts/1' | jq" | from json | table


