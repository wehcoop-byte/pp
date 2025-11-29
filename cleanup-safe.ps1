
# List of files confirmed safe to delete
$files = @(
    "src\components\BeforeAfter.tsx",
    "src\components\GalleryStrip.tsx",
    "src\components\HeroScene.tsx",
    "src\components\QuantumScenes.tsx",
    "src\components\uploads.ts",
    "src\pages\BuilderPage.tsx",
    "src\pipeline\generationPipeline.ts",
    "src\services\clipScorerService.ts",
    "src\services\gemini.ts",
    "src\services\Jobs.ts",
    "src\services\likeness.ts",
    "src\services\upscaler.ts",
    "src\services\upscalerservice.ts",
    "src\types\Job.ts",
    "src\server.js",
    "src\server.jsx"
)

Write-Host "Deleting confirmed-unused files..."

foreach ($f in $files) {
    if (Test-Path $f -PathType Leaf) {
        Remove-Item $f -Force
        Write-Host "Deleted: $f"
    } else {
        Write-Host "Skip (not found): $f"
    }
}

Write-Host "Cleanup complete."
