param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,

  [int]$FirstPage = 1,
  [int]$LastPage = 0,
  [int]$DestinationWidth = 2400
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]

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
  $outputPath = Join-Path $resolvedOutput ("page-{0:D3}.jpg" -f $pageNumber)
  [IO.File]::WriteAllBytes($outputPath, [byte[]]@())

  $page = $document.GetPage([uint32]($pageNumber - 1))
  $outputStorageFile = Wait-WinRtOperation (
    [Windows.Storage.StorageFile]::GetFileFromPathAsync($outputPath)
  ) ([Windows.Storage.StorageFile])
  $stream = Wait-WinRtOperation (
    $outputStorageFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)
  ) ([Windows.Storage.Streams.IRandomAccessStream])

  $options = [Windows.Data.Pdf.PdfPageRenderOptions]::new()
  $options.DestinationWidth = [uint32]$DestinationWidth
  $options.BitmapEncoderId = [Windows.Graphics.Imaging.BitmapEncoder]::JpegEncoderId

  Wait-WinRtAction ($page.RenderToStreamAsync($stream, $options))
  $null = Wait-WinRtOperation ($stream.FlushAsync()) ([bool])
  $stream.Dispose()
  $page.Dispose()

  $item = Get-Item -LiteralPath $outputPath
  Write-Output ("Rendered page {0:D3}/{1}: {2:N0} bytes" -f $pageNumber, $document.PageCount, $item.Length)
}
