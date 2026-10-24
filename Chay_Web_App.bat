@echo off
chcp 65001 >nul
title Khởi chạy Smart HRM & Payroll Dashboard - Công ty A
echo =====================================================================
echo  HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
echo =====================================================================
echo.
echo Đang mở ứng dụng trên trình duyệt web mặc định của bạn...
start "" "%~dp0Ung_dung_HRM_Offline.html"
echo.
echo Ứng dụng đã được mở thành công!
echo Bạn cũng có thể mở tệp "Ung_dung_HRM_Offline.html" hoặc truy cập http://127.0.0.1:3000/
timeout /t 3 >nul
exit
