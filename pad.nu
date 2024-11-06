#!/opt/homebrew/bin/nu
let backend_url = "https://5oeiupv4yhpfazpji6crztorja0cnowd.lambda-url.us-east-1.on.aws"
let headers = {
    "Content-Type": "application/json"
};


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
