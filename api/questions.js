import { put, list, del } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

/**
 * Tạo hash từ nội dung câu hỏi để so sánh duplicate
 * Sử dụng Web Crypto API (compatible với Edge Runtime)
 */
async function generateQuestionHash(question, options) {
  // Chuẩn hóa: lowercase, trim, loại bỏ ký tự đặc biệt
  const normalizedQuestion = question.toLowerCase().trim().replace(/[^\w\s]/gi, '');
  const normalizedOptions = options.map(opt => 
    opt.toLowerCase().trim().replace(/[^\w\s]/gi, '')
  ).sort().join('|');
  
  const combined = `${normalizedQuestion}|||${normalizedOptions}`;
  
  // Tạo SHA-256 hash bằng Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.substring(0, 16); // Lấy 16 ký tự đầu
}

/**
 * Tìm câu hỏi duplicate trong Blob Storage
 */
async function findDuplicateQuestion(questionHash) {
  try {
    const { blobs } = await list({
      prefix: 'questions/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Tìm trong tất cả câu hỏi
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const data = await response.json();
      
      // So sánh hash
      if (data.hash === questionHash) {
        return {
          found: true,
          question: data
        };
      }
    }
    
    return { found: false };
  } catch (error) {
    console.error('Error finding duplicate:', error);
    return { found: false };
  }
}

/**
 * API để quản lý câu hỏi trên Vercel Blob Storage
 *
 * GET /api/questions - Lấy danh sách tất cả câu hỏi
 * GET /api/questions?id=<id> - Lấy một câu hỏi cụ thể
 * POST /api/questions - Tạo/lưu câu hỏi mới (có kiểm tra duplicate)
 * DELETE /api/questions?id=<id> - Xóa một câu hỏi
 */
export default async function handler(request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const url = new URL(request.url);
    const questionId = url.searchParams.get('id');

    // GET - Lấy danh sách hoặc một câu hỏi
    if (request.method === 'GET') {
      if (questionId) {
        // Lấy một câu hỏi cụ thể
        const { blobs } = await list({
          prefix: `questions/${questionId}`,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        if (blobs.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Không tìm thấy câu hỏi' }),
            { status: 404, headers }
          );
        }

        // Fetch nội dung từ blob URL
        const response = await fetch(blobs[0].url);
        const question = await response.json();

        return new Response(
          JSON.stringify({ success: true, data: question }),
          { status: 200, headers }
        );
      } else {
        // Lấy tất cả câu hỏi
        const { blobs } = await list({
          prefix: 'questions/',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        // Fetch tất cả câu hỏi
        const questions = await Promise.all(
          blobs.map(async (blob) => {
            const response = await fetch(blob.url);
            const data = await response.json();
            return {
              id: blob.pathname.replace('questions/', '').replace('.json', ''),
              uploadedAt: blob.uploadedAt,
              ...data,
            };
          })
        );

        return new Response(
          JSON.stringify({
            success: true,
            count: questions.length,
            data: questions
          }),
          { status: 200, headers }
        );
      }
    }

    // POST - Tạo/lưu câu hỏi mới (với kiểm tra duplicate)
    if (request.method === 'POST') {
      const body = await request.json();

      // Validate dữ liệu
      if (!body.question || !body.options) {
        return new Response(
          JSON.stringify({
            error: 'Thiếu dữ liệu bắt buộc (question, options)'
          }),
          { status: 400, headers }
        );
      }

      // ✨ KIỂM TRA DUPLICATE
      const questionHash = await generateQuestionHash(body.question, body.options);
      const duplicateCheck = await findDuplicateQuestion(questionHash);

      if (duplicateCheck.found) {
        // Trả về câu hỏi cũ
        return new Response(
          JSON.stringify({
            success: true,
            duplicate: true,
            message: '⚠️ Câu hỏi đã tồn tại trong database',
            data: duplicateCheck.question
          }),
          { status: 200, headers }
        );
      }

      // Tạo ID duy nhất nếu không có
      const id = body.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const questionData = {
        id,
        hash: questionHash, // ✨ Lưu hash để check duplicate sau
        question: body.question,
        options: body.options,
        correctAnswer: body.correctAnswer || null,
        subject: body.subject || '',
        difficulty: body.difficulty || 'medium',
        tags: body.tags || [],
        createdAt: new Date().toISOString(),
      };

      // Lưu vào Vercel Blob
      const blob = await put(
        `questions/${id}.json`,
        JSON.stringify(questionData),
        {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: 'application/json',
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          duplicate: false,
          message: '✅ Câu hỏi mới đã được lưu thành công',
          data: { id, url: blob.url, ...questionData }
        }),
        { status: 201, headers }
      );
    }

    // DELETE - Xóa câu hỏi
    if (request.method === 'DELETE') {
      if (!questionId) {
        return new Response(
          JSON.stringify({ error: 'Thiếu ID câu hỏi' }),
          { status: 400, headers }
        );
      }

      await del(`questions/${questionId}.json`, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Câu hỏi đã được xóa thành công'
        }),
        { status: 200, headers }
      );
    }

    // Method không được hỗ trợ
    return new Response(
      JSON.stringify({ error: 'Method không được hỗ trợ' }),
      { status: 405, headers }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Lỗi server',
        message: error.message
      }),
      { status: 500, headers }
    );
  }
}
