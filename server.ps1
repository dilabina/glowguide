$port = 5050
$baseDir = "C:\Users\YOGA\.gemini\antigravity\scratch\glowguide"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server running on all interfaces at port $port (accessible from Laptop, HP, Tablet)"

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()

        if ($requestLine) {
            $parts = $requestLine.Split(" ")
            if ($parts.Length -ge 2) {
                $rawPath = $parts[1].Split("?")[0].Split("#")[0].TrimStart("/")
                if ([string]::IsNullOrEmpty($rawPath) -or $rawPath -eq "/") {
                    $rawPath = "index.html"
                }

                $filePath = Join-Path $baseDir $rawPath
                if (Test-Path $filePath -PathType Leaf) {
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = switch ($ext) {
                        ".html" { "text/html; charset=utf-8" }
                        ".css"  { "text/css; charset=utf-8" }
                        ".js"   { "application/javascript; charset=utf-8" }
                        ".json" { "application/json" }
                        ".png"  { "image/png" }
                        ".jpg"  { "image/jpeg" }
                        ".jpeg" { "image/jpeg" }
                        ".svg"  { "image/svg+xml" }
                        default { "application/octet-stream" }
                    }

                    $header = "HTTP/1.1 200 OK`r`n" +
                              "Content-Type: $mime`r`n" +
                              "Content-Length: " + $bytes.Length + "`r`n" +
                              "Access-Control-Allow-Origin: *`r`n" +
                              "Connection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $notFound = [System.Text.Encoding]::UTF8.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found")
                    $stream.Write($notFound, 0, $notFound.Length)
                }
            }
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # Continue on socket error
    }
}
