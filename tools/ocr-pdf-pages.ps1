param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,

  [int]$FirstPage = 1,
  [int]$LastPage = 0,
  [int]$DestinationWidth = 1800,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrResult, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]

$asTaskMethods = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object Name -eq "AsTask"
$asTaskGeneric = ($asTaskMethods | Where-Object {
    $_.IsGenericMethod -and
    $_.GetGenericArguments().Count -eq 1 -and
    $_.GetParameters().Count -eq 1
  })[0]
$asTaskAction = ($asTaskMethods | Where-Object {
    -not $_.IsGenericMethod -and
    $_.GetParameters().Count -eq 1
  })[0]

function Wait-WinRtOperation {
  param($Operation, [Type]$ResultType)

  $task = $asTaskGeneric.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.Wait() | Out-Null
  return $task.Result
}

function Wait-WinRtAction {
  param($Operation)

  $task = $asTaskAction.Invoke($null, @($Operation))
  $task.Wait() | Out-Null
}

$resolvedInput = (Resolve-Path -LiteralPath $InputFile).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$resolvedOutput = (Resolve-Path -LiteralPath $OutputDirectory).Path

$language = [Windows.Globalization.Language]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($language)
if ($null -eq $engine) {
  throw "Windows English OCR engine is unavailable."
}

$inputStorageFile = Wait-WinRtOperation (
  [Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedInput)
) ([Windows.Storage.StorageFile])
$document = Wait-WinRtOperation (
  [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($inputStorageFile)
) ([Windows.Data.Pdf.PdfDocument])

if ($LastPage -le 0) {
  $LastPage = [int]$document.PageCount
}
if ($FirstPage -lt 1 -or $LastPage -gt $document.PageCount -or $FirstPage -gt $LastPage) {
  throw "Requested pages $FirstPage-$LastPage are outside PDF page range 1-$($document.PageCount)."
}

for ($pageNumber = $FirstPage; $pageNumber -le $LastPage; $pageNumber += 1) {
  $outputPath = Join-Path $resolvedOutput ("page-{0:D4}.json" -f $pageNumber)
  if (-not $Force -and (Test-Path -LiteralPath $outputPath)) {
    Write-Output ("Skipped OCR page {0:D4}/{1}: checkpoint exists" -f $pageNumber, $document.PageCount)
    continue
  }

  $page = $null
  $stream = $null
  $bitmap = $null
  try {
    $page = $document.GetPage([uint32]($pageNumber - 1))
    $stream = [Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
    $options = [Windows.Data.Pdf.PdfPageRenderOptions]::new()
    $options.DestinationWidth = [uint32]$DestinationWidth
    $options.BitmapEncoderId = [Windows.Graphics.Imaging.BitmapEncoder]::JpegEncoderId
    Wait-WinRtAction ($page.RenderToStreamAsync($stream, $options))
    $stream.Seek(0)

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
      pdfPageCount = [int]$document.PageCount
      imageWidth = [int]$bitmap.PixelWidth
      imageHeight = [int]$bitmap.PixelHeight
      destinationWidth = $DestinationWidth
      language = $language.LanguageTag
      textAngle = if ($null -eq $result.TextAngle) { $null } else { [double]$result.TextAngle }
      text = $result.Text
      lines = @($lines | Sort-Object y, x)
    }

    $json = $payload | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($outputPath, $json, [Text.UTF8Encoding]::new($false))
    Write-Output ("OCR page {0:D4}/{1}: {2} lines" -f $pageNumber, $document.PageCount, @($lines).Count)
  } finally {
    if ($null -ne $bitmap) { $bitmap.Dispose() }
    if ($null -ne $stream) { $stream.Dispose() }
    if ($null -ne $page) { $page.Dispose() }
  }
}
