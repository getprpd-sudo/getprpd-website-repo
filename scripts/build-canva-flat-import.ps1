$ErrorActionPreference = 'Stop'

$workspace = 'C:\Users\aazim\Documents\GETPRPD Website'
$marketing = Join-Path $workspace 'assets\marketing'
$output = Join-Path $marketing 'PRPD_Batch_9_Carousel_Canva_Import_flat.html'

$pages = 1..7 | ForEach-Object {
    $imagePath = Join-Path $marketing ("batch-9-studio-carousel-{0}.png" -f $_)
    $base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($imagePath))
    @"
  <section class="page" data-document-role="page" data-label="Carousel page $_">
    <img src="data:image/png;base64,$base64" alt="PRPD Batch 9 carousel page $_">
  </section>
"@
}

$document = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PRPD Batch 9 Instagram Carousel</title>
  <style>
    @page { size: 1080px 1350px; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; }
    .page { width: 1080px; height: 1350px; margin: 0; overflow: hidden; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    img { display: block; width: 1080px; height: 1350px; object-fit: cover; }
  </style>
</head>
<body>
$($pages -join "`n")
</body>
</html>
"@

[IO.File]::WriteAllText($output, $document, [Text.UTF8Encoding]::new($false))
Get-Item -LiteralPath $output | Select-Object FullName, Length
