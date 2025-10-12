@echo off
echo ========================================
echo Deploying Firebase Firestore Rules
echo ========================================
echo.

echo Checking Firebase CLI...
firebase --version
if errorlevel 1 (
    echo.
    echo ERROR: Firebase CLI is not installed!
    echo Please install it with: npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo.
echo Deploying rules...
firebase deploy --only firestore:rules

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo Make sure you are logged in: firebase login
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Rules deployed successfully!
echo ========================================
echo.
pause
