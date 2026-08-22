param(
  [Parameter(Mandatory = $true)]
  [string]$InputDirectory,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,

  [int]$FirstPage = 1,
  [int]$LastPage = 29
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

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$language = [Windows.Globalization.Language]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($language)

if ($null -eq $engine) {
  throw "Windows English OCR engine is unavailable."
}

for ($pageNumber = $FirstPage; $pageNumber -le $LastPage; $pageNumber += 1) {
  $imagePath = Join-Path $InputDirectory ("page-{0:D2}.jpg" -f $pageNumber)
  if (-not (Test-Path -LiteralPath $imagePath)) {
    throw "Missing page image: $imagePath"
  }

  $file = Wait-WinRtOperation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($imagePath)) ([Windows.Storage.StorageFile])
  $stream = Wait-WinRtOperation ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = Wait-WinRtOperation ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Wait-WinRtOperation ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = Wait-WinRtOperation ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

  # The scan's gutter sits slightly left of the geometric midpoint.
  $midpoint = $bitmap.PixelWidth * 0.47
  $lines = @($result.Lines)
  $rows = foreach ($line in $lines) {
    $words = @($line.Words)
    if ($words.Count -eq 0) { continue }
    $firstWord = $words[0].BoundingRect
    [PSCustomObject]@{
      Column = if ($firstWord.X -lt $midpoint) { "LEFT" } else { "RIGHT" }
      X = [int]$firstWord.X
      Y = [int]$firstWord.Y
      Text = $line.Text
    }
  }

  $output = New-Object System.Collections.Generic.List[string]
  $output.Add("PAGE $pageNumber | IMAGE WIDTH $($bitmap.PixelWidth) | IMAGE HEIGHT $($bitmap.PixelHeight)")
  foreach ($column in @("LEFT", "RIGHT")) {
    $output.Add("")
    $output.Add("=== $column COLUMN ===")
    foreach ($row in ($rows | Where-Object Column -eq $column | Sort-Object Y, X)) {
      $output.Add(("[{0,4},{1,4}] {2}" -f $row.X, $row.Y, $row.Text))
    }
  }

  $outputPath = Join-Path $OutputDirectory ("page-{0:D2}.txt" -f $pageNumber)
  [IO.File]::WriteAllLines($outputPath, $output, [Text.UTF8Encoding]::new($false))
  Write-Output ("OCR page {0:D2}: {1} lines" -f $pageNumber, $rows.Count)

  $bitmap.Dispose()
  $stream.Dispose()
}
