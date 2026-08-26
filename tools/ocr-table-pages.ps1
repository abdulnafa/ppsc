param(
  [Parameter(Mandatory = $true)]
  [string]$InputDirectory,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,

  [int]$FirstPage = 1,
  [int]$LastPage = 1
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrResult, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and
    $_.IsGenericMethod -and
    $_.GetGenericArguments().Count -eq 1 -and
    $_.ReturnType.IsGenericType -and
    $_.GetParameters().Count -eq 1
  })[0]

function Wait-WinRtOperation {
  param($Operation, [Type]$ResultType)

  $task = $asTaskGeneric.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.Wait() | Out-Null
  return $task.Result
}

$resolvedInput = (Resolve-Path -LiteralPath $InputDirectory).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$resolvedOutput = (Resolve-Path -LiteralPath $OutputDirectory).Path

$language = [Windows.Globalization.Language]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($language)
if ($null -eq $engine) {
  throw "Windows English OCR engine is unavailable."
}

for ($pageNumber = $FirstPage; $pageNumber -le $LastPage; $pageNumber += 1) {
  $imagePath = Join-Path $resolvedInput ("page-{0:D3}.jpg" -f $pageNumber)
  if (-not (Test-Path -LiteralPath $imagePath)) {
    throw "Missing page image: $imagePath"
  }

  $file = Wait-WinRtOperation (
    [Windows.Storage.StorageFile]::GetFileFromPathAsync($imagePath)
  ) ([Windows.Storage.StorageFile])
  $stream = Wait-WinRtOperation (
    $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
  ) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = Wait-WinRtOperation (
    [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
  ) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Wait-WinRtOperation (
    $decoder.GetSoftwareBitmapAsync()
  ) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = Wait-WinRtOperation (
    $engine.RecognizeAsync($bitmap)
  ) ([Windows.Media.Ocr.OcrResult])

  $lines = foreach ($line in @($result.Lines)) {
    $words = @($line.Words)
    if ($words.Count -eq 0) { continue }

    $left = ($words | ForEach-Object { $_.BoundingRect.X } | Measure-Object -Minimum).Minimum
    $top = ($words | ForEach-Object { $_.BoundingRect.Y } | Measure-Object -Minimum).Minimum
    $right = ($words | ForEach-Object { $_.BoundingRect.X + $_.BoundingRect.Width } | Measure-Object -Maximum).Maximum
    $bottom = ($words | ForEach-Object { $_.BoundingRect.Y + $_.BoundingRect.Height } | Measure-Object -Maximum).Maximum

    [ordered]@{
      x = [int]$left
      y = [int]$top
      width = [int]($right - $left)
      height = [int]($bottom - $top)
      text = $line.Text
      words = @($words | ForEach-Object {
          [ordered]@{
            x = [int]$_.BoundingRect.X
            y = [int]$_.BoundingRect.Y
            width = [int]$_.BoundingRect.Width
            height = [int]$_.BoundingRect.Height
            text = $_.Text
          }
        })
    }
  }

  $payload = [ordered]@{
    pageNumber = $pageNumber
    imageWidth = [int]$bitmap.PixelWidth
    imageHeight = [int]$bitmap.PixelHeight
    textAngle = if ($null -eq $result.TextAngle) { $null } else { [double]$result.TextAngle }
    text = $result.Text
    lines = @($lines | Sort-Object y, x)
  }

  $outputPath = Join-Path $resolvedOutput ("page-{0:D3}.json" -f $pageNumber)
  $json = $payload | ConvertTo-Json -Depth 8
  [IO.File]::WriteAllText($outputPath, $json, [Text.UTF8Encoding]::new($false))
  Write-Output ("OCR page {0:D3}: {1} lines" -f $pageNumber, @($lines).Count)

  $bitmap.Dispose()
  $stream.Dispose()
}
