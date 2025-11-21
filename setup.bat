@echo off
echo ========================================
echo CertiChain - Setup Script
echo ========================================
echo.

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 goto error

echo.
echo [2/4] Installing contract dependencies...
cd contracts
call npm install
if %errorlevel% neq 0 goto error
cd ..

echo.
echo [3/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 goto error
cd ..

echo.
echo [4/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 goto error
cd ..

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure
echo 2. Start Hardhat: cd contracts ^&^& npx hardhat node
echo 3. Deploy contract: cd contracts ^&^& npx hardhat run scripts/deploy.js --network localhost
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm start
echo.
echo Or use Docker: docker-compose up --build
echo.
goto end

:error
echo.
echo ❌ Setup failed! Please check the error above.
exit /b 1

:end
