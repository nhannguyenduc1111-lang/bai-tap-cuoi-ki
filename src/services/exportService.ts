import { Employee, Contract, PayrollRecord } from '../types';

export function openGoogleCalendarReminder(contract: Contract) {
  // Parse expiry date or default to 30 days ahead
  let dueDate = contract.expiryDate;
  if (!dueDate) {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    dueDate = today.toISOString().split('T')[0];
  }

  // Format for Google Calendar: YYYYMMDD
  const cleanDate = dueDate.replace(/-/g, '');
  const title = encodeURIComponent(`[CÔNG TY A] Nhắc việc: Tái ký HĐLĐ cho ${contract.employeeId} - ${contract.employeeName}`);
  const details = encodeURIComponent(
    `Nhân viên: ${contract.employeeName} (${contract.employeeId})\n` +
    `Phòng ban: ${contract.department}\n` +
    `Chức vụ: ${contract.jobTitle}\n` +
    `Hợp đồng hiện tại: ${contract.contractType} (Số: ${contract.contractNumber})\n` +
    `Ngày hết hạn: ${contract.expiryDate}\n` +
    `Vui lòng chuẩn bị Tờ trình đánh giá và dự thảo Hợp đồng mới trước thời hạn.`
  );
  const location = encodeURIComponent('Văn phòng Hà Nội - Phòng HCNS');
  
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}/${cleanDate}&details=${details}&location=${location}`;
  window.open(gcalUrl, '_blank');
}

export function openGmailComposePayslip(employee: Employee, payroll: PayrollRecord) {
  const email = employee.email || `${employee.id.toLowerCase()}@congtya.vn`;
  const subject = encodeURIComponent(`[CÔNG TY A] Phiếu thanh toán tiền lương kỳ ${payroll.month} - ${employee.fullName}`);
  const body = encodeURIComponent(
    `Kính gửi Anh/Chị ${employee.fullName} (${employee.id}),\n\n` +
    `Phòng Hành chính - Nhân sự xin gửi thông báo chi tiết phiếu lương kỳ ${payroll.month} như sau:\n\n` +
    `--------------------------------------------------\n` +
    `1. Mức lương hợp đồng: ${payroll.baseSalary.toLocaleString('vi-VN')} VNĐ\n` +
    `2. Số ngày công thực tế: ${payroll.workDays}/26 ngày\n` +
    `3. Lương theo thời gian: ${payroll.timeSalary.toLocaleString('vi-VN')} VNĐ\n` +
    `4. Phụ cấp trách nhiệm: ${payroll.responsibilityAllowance.toLocaleString('vi-VN')} VNĐ\n` +
    `5. Phụ cấp ăn trưa: ${payroll.lunchAllowance.toLocaleString('vi-VN')} VNĐ\n` +
    `6. Tiền làm thêm giờ (OT): ${payroll.otPay.toLocaleString('vi-VN')} VNĐ\n` +
    `7. Thưởng hiệu quả: ${payroll.performanceBonus.toLocaleString('vi-VN')} VNĐ\n` +
    `=> TỔNG THU NHẬP: ${payroll.grossIncome.toLocaleString('vi-VN')} VNĐ\n\n` +
    `CÁC KHOẢN KHẤU TRỪ:\n` +
    `- Trừ BHXH, BHYT, BHTN (10.5%): ${payroll.bhxhDeduction.toLocaleString('vi-VN')} VNĐ\n` +
    `- Thuế TNCN: ${payroll.pitTax.toLocaleString('vi-VN')} VNĐ\n\n` +
    `=> THỰC LĨNH CHUYỂN KHOẢN: ${payroll.netSalary.toLocaleString('vi-VN')} VNĐ\n` +
    `Số tài khoản nhận: ${employee.bankAccount} - ${employee.bankName}\n` +
    `--------------------------------------------------\n\n` +
    `Mọi thắc mắc về bảng tính lương, Anh/Chị vui lòng phản hồi lại email này trong vòng 03 ngày làm việc.\n\n` +
    `Trân trọng,\n` +
    `Phòng Hành chính - Nhân sự Công ty A`
  );

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');
}

export function exportWordDocument(htmlContent: string, fileName: string) {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${fileName}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #111; }
        h1, h2, h3, h4 { color: #0F291E; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        table, th, td { border: 1px solid #333; }
        th { background-color: #f1f5f9; padding: 8px; text-align: left; }
        td { padding: 7px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .header-top { text-align: center; margin-bottom: 25px; }
      </style>
    </head>
    <body>
  `;
  const footer = '</body></html>';
  const fullHtml = header + htmlContent + footer;

  const blob = new Blob(['\ufeff' + fullHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}
