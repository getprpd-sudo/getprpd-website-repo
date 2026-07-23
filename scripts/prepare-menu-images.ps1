param(
  [string]$SourceDirectory = 'C:\Users\aazim\Dropbox\PRPD PRINT\Menu Images',
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\assets\images\meals\menu'),
  [int]$OutputSize = 1200,
  [int]$JpegQuality = 90
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Apply-ExifOrientation {
  param([System.Drawing.Image]$Image)

  $orientationId = 0x0112
  if ($Image.PropertyIdList -notcontains $orientationId) { return }

  $orientation = $Image.GetPropertyItem($orientationId).Value[0]
  $rotation = switch ($orientation) {
    2 { [System.Drawing.RotateFlipType]::RotateNoneFlipX }
    3 { [System.Drawing.RotateFlipType]::Rotate180FlipNone }
    4 { [System.Drawing.RotateFlipType]::Rotate180FlipX }
    5 { [System.Drawing.RotateFlipType]::Rotate90FlipX }
    6 { [System.Drawing.RotateFlipType]::Rotate90FlipNone }
    7 { [System.Drawing.RotateFlipType]::Rotate270FlipX }
    8 { [System.Drawing.RotateFlipType]::Rotate270FlipNone }
    default { [System.Drawing.RotateFlipType]::RotateNoneFlipNone }
  }
  $Image.RotateFlip($rotation)
}

function Save-WebMenuImage {
  param(
    [string]$SourcePath,
    [string]$DestinationPath
  )

  $source = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    Apply-ExifOrientation -Image $source

    # Detect the real tray/food against the light studio sweep, then retain a
    # controlled margin. This fills the card without inventing or removing food.
    $sampleMax = 320
    $sampleScale = [Math]::Min(1, $sampleMax / [double][Math]::Max($source.Width, $source.Height))
    $sampleWidth = [Math]::Max(1, [Math]::Round($source.Width * $sampleScale))
    $sampleHeight = [Math]::Max(1, [Math]::Round($source.Height * $sampleScale))
    $sample = New-Object System.Drawing.Bitmap($source, $sampleWidth, $sampleHeight)
    try {
      $minX = $sampleWidth
      $minY = $sampleHeight
      $maxX = -1
      $maxY = -1

      for ($y = 0; $y -lt $sampleHeight; $y += 2) {
        for ($x = 0; $x -lt $sampleWidth; $x += 2) {
          $pixel = $sample.GetPixel($x, $y)
          $maximum = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
          $minimum = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
          $luma = 0.2126 * $pixel.R + 0.7152 * $pixel.G + 0.0722 * $pixel.B
          $chroma = $maximum - $minimum
          $isForeground = $luma -lt 185 -or ($chroma -gt 38 -and $luma -lt 245)
          if ($isForeground) {
            $minX = [Math]::Min($minX, $x)
            $minY = [Math]::Min($minY, $y)
            $maxX = [Math]::Max($maxX, $x)
            $maxY = [Math]::Max($maxY, $y)
          }
        }
      }

      if ($maxX -ge 0) {
        $contentLeft = [Math]::Floor($minX / $sampleWidth * $source.Width)
        $contentTop = [Math]::Floor($minY / $sampleHeight * $source.Height)
        $contentRight = [Math]::Ceiling(($maxX + 2) / $sampleWidth * $source.Width)
        $contentBottom = [Math]::Ceiling(($maxY + 2) / $sampleHeight * $source.Height)
        $contentWidth = $contentRight - $contentLeft
        $contentHeight = $contentBottom - $contentTop
        $padding = [Math]::Round([Math]::Max($contentWidth, $contentHeight) * 0.075)
        $cropSize = [Math]::Min(
          [Math]::Max($contentWidth, $contentHeight) + (2 * $padding),
          [Math]::Min($source.Width, $source.Height)
        )
        $centerX = ($contentLeft + $contentRight) / 2
        $centerY = ($contentTop + $contentBottom) / 2
        $cropX = [Math]::Max(0, [Math]::Min($source.Width - $cropSize, [Math]::Round($centerX - ($cropSize / 2))))
        $cropY = [Math]::Max(0, [Math]::Min($source.Height - $cropSize, [Math]::Round($centerY - ($cropSize / 2))))
      }
      else {
        $cropSize = [Math]::Min($source.Width, $source.Height)
        $cropX = [Math]::Floor(($source.Width - $cropSize) / 2)
        $cropY = [Math]::Max(0, $source.Height - $cropSize)
      }
    }
    finally {
      $sample.Dispose()
    }

    $output = New-Object System.Drawing.Bitmap($OutputSize, $OutputSize)
    try {
      $output.SetResolution(96, 96)
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

        $attributes = New-Object System.Drawing.Imaging.ImageAttributes
        try {
          # Studio correction: stronger color separation, midtone contrast, and
          # slight warmth. No content is added, removed, redrawn, or reshaped.
          $saturation = 1.20
          $contrast = 1.08
          $midtoneLift = 0.018
          $warmRed = 1.035
          $warmGreen = 1.010
          $warmBlue = 0.970

          # A few authentic photo pairs were shot under different light. Keep
          # their treatment reproducible while matching color and detail across
          # Lean/Bulk cards. These profiles only adjust tone and color.
          switch ([System.IO.Path]::GetFileNameWithoutExtension($SourcePath)) {
            'bbq-chicken-mac-and-cheese-bulk' {
              $saturation = 1.38
              $contrast = 1.10
              $midtoneLift = 0.026
              $warmRed = 1.055
              $warmGreen = 1.015
              $warmBlue = 0.965
            }
            'premium-ny-strip-steak-lean' {
              $saturation = 1.32
              $contrast = 1.06
              $midtoneLift = 0.030
              $warmRed = 1.045
              $warmGreen = 1.012
              $warmBlue = 0.965
            }
            'premium-ny-strip-steak-bulk' {
              $saturation = 1.14
              $contrast = 0.92
              $midtoneLift = 0.044
              $warmRed = 1.025
              $warmGreen = 1.005
              $warmBlue = 0.980
            }
          }
          $inverseSaturation = 1 - $saturation
          $redLuma = 0.3086 * $inverseSaturation
          $greenLuma = 0.6094 * $inverseSaturation
          $blueLuma = 0.0820 * $inverseSaturation
          $translation = ((1 - $contrast) / 2) + $midtoneLift
          $matrix = New-Object System.Drawing.Imaging.ColorMatrix
          $matrix.Matrix00 = ($redLuma + $saturation) * $contrast * $warmRed
          $matrix.Matrix01 = $redLuma * $contrast * $warmRed
          $matrix.Matrix02 = $redLuma * $contrast * $warmRed
          $matrix.Matrix10 = $greenLuma * $contrast * $warmGreen
          $matrix.Matrix11 = ($greenLuma + $saturation) * $contrast * $warmGreen
          $matrix.Matrix12 = $greenLuma * $contrast * $warmGreen
          $matrix.Matrix20 = $blueLuma * $contrast * $warmBlue
          $matrix.Matrix21 = $blueLuma * $contrast * $warmBlue
          $matrix.Matrix22 = ($blueLuma + $saturation) * $contrast * $warmBlue
          $matrix.Matrix33 = 1.000
          $matrix.Matrix44 = 1.000
          $matrix.Matrix40 = $translation + 0.008
          $matrix.Matrix41 = $translation
          $matrix.Matrix42 = $translation - 0.006
          $attributes.SetColorMatrix($matrix)

          $destination = New-Object System.Drawing.Rectangle(0, 0, $OutputSize, $OutputSize)
          $graphics.DrawImage(
            $source,
            $destination,
            $cropX,
            $cropY,
            $cropSize,
            $cropSize,
            [System.Drawing.GraphicsUnit]::Pixel,
            $attributes
          )
        }
        finally {
          $attributes.Dispose()
        }
      }
      finally {
        $graphics.Dispose()
      }

      $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object MimeType -eq 'image/jpeg' |
        Select-Object -First 1
      $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      try {
        $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
          [System.Drawing.Imaging.Encoder]::Quality,
          [long]$JpegQuality
        )
        $output.Save($DestinationPath, $encoder, $encoderParameters)
      }
      finally {
        $encoderParameters.Dispose()
      }
    }
    finally {
      $output.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

$sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path
$outputRoot = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($outputRoot) | Out-Null

$files = Get-ChildItem -LiteralPath $sourceRoot -File |
  Where-Object {
    $_.Extension -match '^\.(jpe?g)$' -and
    $_.Name -notmatch 'don.t know what this is'
  } |
  Sort-Object Name

foreach ($file in $files) {
  $destination = Join-Path $outputRoot ($file.BaseName + '.jpg')
  Save-WebMenuImage -SourcePath $file.FullName -DestinationPath $destination
  $sizeKb = [Math]::Round((Get-Item -LiteralPath $destination).Length / 1KB)
  Write-Output ("{0} -> {1} KB" -f $file.Name, $sizeKb)
}

$legacyShrimpSource = Join-Path $PSScriptRoot '..\assets\images\garlic-butter-shrimp.jpg'
if (Test-Path -LiteralPath $legacyShrimpSource) {
  $legacyShrimpDestination = Join-Path $outputRoot 'garlic-butter-shrimp.jpg'
  Save-WebMenuImage -SourcePath $legacyShrimpSource -DestinationPath $legacyShrimpDestination
  $legacyShrimpSizeKb = [Math]::Round((Get-Item -LiteralPath $legacyShrimpDestination).Length / 1KB)
  Write-Output ("garlic-butter-shrimp.jpg -> {0} KB" -f $legacyShrimpSizeKb)
}

Write-Output ("Prepared {0} Dropbox menu photos plus the existing shrimp photo in {1}" -f $files.Count, $outputRoot)
