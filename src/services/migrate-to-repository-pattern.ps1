# Migrate to Repository Pattern

# This script will rename the .new.ts files to replace the original files
# It helps with the migration from direct database access to the repository pattern

# Usage:
#   cd src/services
#   ./migrate-to-repository-pattern.ps1

# Make sure we're in the correct directory
$serviceDir = "d:\PERSONAL PROJECTS\Gastos Hormigas - Sin ingenenieria\Gastos_Hormigas\src\services"
if (-not (Test-Path $serviceDir)) {
    Write-Error "This script must be run from the src/services directory"
    exit 1
}

# Get all .new.ts files
$newFiles = Get-ChildItem -Path $serviceDir -Recurse -Filter "*.new.ts"

foreach ($file in $newFiles) {
    # Get the original filename by removing the .new part
    $originalPath = $file.FullName -replace "\.new\.ts$", ".ts"
    $originalFile = Get-Item $originalPath -ErrorAction SilentlyContinue
    
    Write-Host "Processing: $($file.Name)"
    
    # Check if original file exists and create a backup
    if ($originalFile) {
        $backupPath = $originalPath -replace "\.ts$", ".backup.ts"
        Write-Host "  Creating backup: $backupPath"
        Copy-Item -Path $originalFile.FullName -Destination $backupPath -Force
    }
    
    # Replace the original file with the new one
    Write-Host "  Replacing: $originalPath"
    Copy-Item -Path $file.FullName -Destination $originalPath -Force
    
    # Delete the .new.ts file
    Write-Host "  Removing: $($file.FullName)"
    Remove-Item -Path $file.FullName -Force
}

Write-Host ""
Write-Host "Migration completed!"
Write-Host "Backup files were created with .backup.ts extension."
Write-Host "You can delete them after verifying everything works."
