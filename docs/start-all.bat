@echo off
title TravelHub Launcher

echo [1/5] Dang khoi dong Eureka Server (8761)...
start "1. EUREKA SERVER (:8761)" cmd /k "cd /d D:\CNTT\Nam4\J2EE\Travel_Tour_System\backend\eureka-server && mvnw.cmd spring-boot:run"

echo Dang cho 12 giay de Eureka Server san sang...
timeout /t 12 /nobreak > nul

echo [2/5] Dang khoi dong Core Service (8081)...
start "2. CORE SERVICE (:8081)" cmd /k "cd /d D:\CNTT\Nam4\J2EE\Travel_Tour_System\backend\core-service && mvnw.cmd spring-boot:run"

echo [3/5] Dang khoi dong Notification Service (8082)...
start "3. NOTIFICATION SERVICE (:8082)" cmd /k "cd /d D:\CNTT\Nam4\J2EE\Travel_Tour_System\backend\notification-service && mvnw.cmd spring-boot:run"

echo [4/5] Dang khoi dong API Gateway (8088)...
start "4. API GATEWAY (:8088)" cmd /k "cd /d D:\CNTT\Nam4\J2EE\Travel_Tour_System\backend\api-gateway && mvnw.cmd spring-boot:run"

echo [5/5] Dang khoi dong Frontend React (5173)...
start "5. FRONTEND (:5173)" cmd /k "cd /d D:\CNTT\Nam4\J2EE\Travel_Tour_System\frontend && npm run dev"

echo Hoan tat! Mo http://localhost:8761 de xem Eureka Dashboard.
pause