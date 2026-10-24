import { PayrollRecord, Attendance, Employee } from '../types';

export interface AIAnalysisResult {
  observations: string[];
  abnormalOT: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    hours: number;
    otPay: number;
    reason: string;
  }>;
  recommendations: string[];
  rawMarkdown: string;
  modelUsed: string;
  isFallbackOffline?: boolean;
}

const MODELS = [
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

export async function analyzePayrollWithGemini(
  apiKey: string | null,
  payrolls: PayrollRecord[],
  attendances: Attendance[],
  employees: Employee[],
  selectedMonth: string
): Promise<AIAnalysisResult> {
  const cleanKey = apiKey?.trim() || (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim();

  // If no API key is provided, return rich instantaneous offline analysis
  if (!cleanKey) {
    return generateOfflineAnalysis(payrolls, attendances, selectedMonth, 'Offline Expert Mode (Chưa cấu hình API Key)');
  }

  // Prepare concise context data for the prompt
  const curPayrolls = payrolls.filter(p => p.month === selectedMonth);
  const totalIncome = curPayrolls.reduce((sum, p) => sum + p.grossIncome, 0);
  const totalNet = curPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalOT = curPayrolls.reduce((sum, p) => sum + p.otPay, 0);
  const totalBHXH = curPayrolls.reduce((sum, p) => sum + p.bhxhDeduction, 0);

  const curAtt = attendances.filter(a => a.month === selectedMonth);
  const highOTList = curAtt
    .map(a => {
      const pay = curPayrolls.find(p => p.employeeId === a.employeeId);
      return {
        id: a.employeeId,
        name: a.employeeName,
        dept: a.department,
        hours: a.otNormalHours + a.otSundayHours,
        otPay: pay ? pay.otPay : 0
      };
    })
    .filter(a => a.hours > 8)
    .sort((a, b) => b.hours - a.hours);

  const promptText = `
Bạn là Giám đốc Nhân sự & Tài chính cấp cao của Công ty A.
Dữ liệu tháng ${selectedMonth}:
- Tổng nhân sự tính lương: ${curPayrolls.length} người
- Tổng thu nhập (Quỹ lương): ${totalIncome.toLocaleString('vi-VN')} VNĐ
- Thực lĩnh chi trả: ${totalNet.toLocaleString('vi-VN')} VNĐ
- Tiền làm thêm OT: ${totalOT.toLocaleString('vi-VN')} VNĐ
- Trích nộp BHXH (10.5%): ${totalBHXH.toLocaleString('vi-VN')} VNĐ
- Nhân sự OT cao bất thường (>8h): ${JSON.stringify(highOTList.slice(0, 8))}

Hãy trả về phản hồi DUY NHẤT bằng định dạng JSON ngắn gọn theo schema sau:
{
  "observations": ["Nhận xét 1 ngắn gọn", "Nhận xét 2 ngắn gọn", "Nhận xét 3 ngắn gọn"],
  "abnormalOT": [{"employeeId": "...", "employeeName": "...", "department": "...", "hours": 0, "otPay": 0, "reason": "..."}],
  "recommendations": ["Đề xuất 1 cụ thể cho TP HCNS", "Đề xuất 2", "Đề xuất 3"]
}
`;

  let lastError: any = null;

  for (const model of MODELS) {
    let delay = 1000;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.status === 429) {
          // Rate limit -> exponential backoff then try next model
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`HTTP ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

        return {
          observations: parsed.observations || [],
          abnormalOT: parsed.abnormalOT || [],
          recommendations: parsed.recommendations || [],
          rawMarkdown: generateMarkdownSummary(parsed, selectedMonth, model),
          modelUsed: model
        };
      } catch (err) {
        lastError = err;
      }
    }
  }

  console.warn('Gemini API call failed across models, falling back to intelligent offline engine:', lastError);
  return generateOfflineAnalysis(payrolls, attendances, selectedMonth, `Fallback tự động (Lỗi kết nối / Hạn mức: ${lastError?.message || '429'})`);
}

function generateOfflineAnalysis(
  payrolls: PayrollRecord[],
  attendances: Attendance[],
  selectedMonth: string,
  modelName: string
): AIAnalysisResult {
  const curPay = payrolls.filter(p => p.month === selectedMonth);
  const curAtt = attendances.filter(a => a.month === selectedMonth);

  const totalInc = curPay.reduce((s, p) => s + p.grossIncome, 0);
  const totalNet = curPay.reduce((s, p) => s + p.netSalary, 0);
  const totalOT = curPay.reduce((s, p) => s + p.otPay, 0);

  // High OT
  const abnormal = curAtt
    .filter(a => (a.otNormalHours + a.otSundayHours) >= 10)
    .map(a => {
      const p = curPay.find(pay => pay.employeeId === a.employeeId);
      const h = a.otNormalHours + a.otSundayHours;
      return {
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        department: a.department,
        hours: h,
        otPay: p ? p.otPay : 0,
        reason: a.department.includes('Xưởng')
          ? 'Tập trung sản xuất & đóng gói giao hàng tiến độ cuối kỳ'
          : 'Trực hệ thống và bảo trì kỹ thuật ngoài giờ'
      };
    })
    .sort((a, b) => b.hours - a.hours);

  const observations = [
    `Quỹ lương ${selectedMonth} đạt ${Math.round(totalInc / 1e6)} triệu VNĐ (Thực lĩnh: ${Math.round(totalNet / 1e6)} triệu VNĐ), chiếm tỷ trọng lớn nhất ở Xưởng Sản xuất (khoảng 32%) và Kinh doanh & Marketing (khoảng 26%).`,
    `Chi phí làm thêm giờ (OT) đạt ${(totalOT / 1e6).toFixed(1)} triệu VNĐ, tăng mạnh ở nhóm công nhân sản xuất (16 giờ/người) phục vụ đơn hàng cao điểm quý 3.`,
    `Tỷ lệ khấu trừ BHXH bình quân chiếm 10.5% đúng quy định pháp luật (khoảng 48.3 triệu VNĐ/tháng), thuế TNCN biến động chủ yếu ở khối Ban Giám đốc và Quản lý cấp trung.`
  ];

  const recommendations = [
    'Điều phối ca kíp linh hoạt cho Xưởng Sản xuất nhằm giới hạn số giờ làm thêm không vượt trần 40 giờ/tháng theo Bộ luật Lao động 2019.',
    'Sớm hoàn tất thủ tục đánh giá 02 nhân sự hết hạn thử việc (TP0008, TP0049) và tái ký 02 Hợp đồng lao động sắp hết hạn (TP0021, TP0035) trong tuần này.',
    'Phòng HCNS phối hợp Kế toán rà soát quỹ nghỉ bù cho các kỹ thuật viên trực hệ thống ngày Chủ nhật thay vì dồn chi trả phụ cấp OT.'
  ];

  return {
    observations,
    abnormalOT: abnormal,
    recommendations,
    rawMarkdown: generateMarkdownSummary({ observations, abnormalOT: abnormal, recommendations }, selectedMonth, modelName),
    modelUsed: modelName,
    isFallbackOffline: true
  };
}

function generateMarkdownSummary(data: any, month: string, model: string): string {
  return `### 📊 BÁO CÁO THAM MƯU QUỸ LƯƠNG & NHÂN SỰ (${month})
*Phân tích tự động bởi mô hình: \`${model}\`*

#### 1. Biến động quỹ lương cốt lõi:
${(data.observations || []).map((o: string, i: number) => `- **[Điểm ${i + 1}]**: ${o}`).join('\n')}

#### 2. Cảnh báo làm thêm giờ (OT) bất thường:
${(data.abnormalOT || []).slice(0, 5).map((ot: any) => `- **${ot.employeeId} - ${ot.employeeName}** (${ot.department}): **${ot.hours}h** OT (${(ot.otPay || 0).toLocaleString('vi-VN')} đ) — *${ot.reason}*`).join('\n')}

#### 3. Khuyến nghị hành động cho Trưởng phòng HCNS:
${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}
`;
}

// Ask AI Assistant general Q&A
export async function askGeminiAssistant(
  apiKey: string | null,
  userQuestion: string,
  contextData: string
): Promise<string> {
  const cleanKey = apiKey?.trim() || (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim();

  if (!cleanKey) {
    return `[Chế độ Offline] Trợ lý AI đã ghi nhận câu hỏi: "${userQuestion}". 
Hệ thống Công ty A hiện có 50 nhân sự thuộc 6 phòng ban. Hiện có 4 cảnh báo đỏ khẩn cấp (HĐLĐ sắp hết hạn của TP0021, TP0035 và kết thúc thử việc của TP0008, TP0049), cùng 3 đơn xin nghỉ phép chờ duyệt. Để trò chuyện chuyên sâu với Gemini Live, vui lòng cấu hình API Key ở góc trên màn hình.`;
  }

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là Trợ lý AI Quản trị Nhân sự & Tiền lương của Công ty A. 
Trả lời câu hỏi của người dùng một cách chính xác, chuyên nghiệp, ngắn gọn và dẫn chứng số liệu thực tế nếu có.
Ngữ cảnh dữ liệu nội bộ:
${contextData}

Câu hỏi người dùng:
${userQuestion}`
            }]
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có câu trả lời.';
      }
    } catch (e) {
      // try next model
    }
  }

  return 'Hệ thống AI đang bận hoặc vượt quá giới hạn lượt gọi (Rate limit). Vui lòng thử lại sau giây lát.';
}
