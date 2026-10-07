param([string]$PublicPath = 'C:\Users\USER\AppData\Local\Temp\unfrog-reel\public\ui-icons\cozy-v1')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $PublicPath | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot 'optimized') | Out-Null
$files = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'originals') -Filter '*.png'
$sheet = New-Object System.Drawing.Bitmap(780,560)
$canvas = [System.Drawing.Graphics]::FromImage($sheet)
$canvas.Clear([System.Drawing.ColorTranslator]::FromHtml('#17382e'))
$font = New-Object System.Drawing.Font('Arial',12)
$index = 0
foreach ($file in $files) {
    $original = [System.Drawing.Image]::FromFile($file.FullName)
    $small = New-Object System.Drawing.Bitmap(128,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphic = [System.Drawing.Graphics]::FromImage($small)
    $graphic.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphic.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphic.Clear([System.Drawing.Color]::Transparent)
    $graphic.DrawImage($original,0,0,128,128)
    $small.Save((Join-Path $PublicPath $file.Name),[System.Drawing.Imaging.ImageFormat]::Png)
    Copy-Item -LiteralPath (Join-Path $PublicPath $file.Name) -Destination (Join-Path $PSScriptRoot 'optimized')
    $x = ($index % 5) * 156
    $y = [math]::Floor($index / 5) * 184
    $canvas.DrawImage($small,$x+14,$y+8,128,128)
    $canvas.DrawString($file.BaseName,$font,[System.Drawing.Brushes]::White,$x+14,$y+142)
    $graphic.Dispose(); $small.Dispose(); $original.Dispose()
    $index++
}
$sheet.Save((Join-Path $PSScriptRoot 'contact-sheet.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose(); $canvas.Dispose(); $sheet.Dispose()
Write-Output "Optimized $($files.Count) icons to 128px RGBA PNGs."
