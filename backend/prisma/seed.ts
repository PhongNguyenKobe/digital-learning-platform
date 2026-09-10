import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const seedPasswordHash = '$2b$12$vmKvBgVCD6jJiSRfuT.V0.Vrj49j9F85YiipcJQDxkmI3Nt1g/2Rm'; // Admin123!

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function clearDatabase() {
  await prisma.$transaction([
    prisma.documentProcessingJob.deleteMany(),
    prisma.documentVersion.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.report.deleteMany(),
    prisma.documentReview.deleteMany(),
    prisma.documentView.deleteMany(),
    prisma.download.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.documentTag.deleteMany(),
    prisma.documentCategory.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.document.deleteMany(),
    prisma.user.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.category.deleteMany(),
    prisma.faculty.deleteMany(),
    prisma.university.deleteMany(),
  ]);
}

async function main() {
  await clearDatabase();

  const universities = await Promise.all([
    prisma.university.create({
      data: {
        code: 'HUST',
        name: 'Đại học Bách khoa Hà Nội',
        shortName: 'HUST',
        logoUrl: '/uploads/universities/hust.png',
        website: 'https://hust.edu.vn',
      },
    }),
    prisma.university.create({
      data: {
        code: 'NEU',
        name: 'Đại học Kinh tế Quốc dân',
        shortName: 'NEU',
        logoUrl: '/uploads/universities/neu.png',
        website: 'https://neu.edu.vn',
      },
    }),
    prisma.university.create({
      data: {
        code: 'VNU-UET',
        name: 'Đại học Công nghệ - Đại học Quốc gia Hà Nội',
        shortName: 'UET',
        logoUrl: '/uploads/universities/uet.png',
        website: 'https://uet.vnu.edu.vn',
      },
    }),
    prisma.university.create({ data: { code: 'HCMUE', name: 'Trường Đại học Sư phạm Thành phố Hồ Chí Minh', shortName: 'HCMUE', website: 'https://hcmue.edu.vn' } }),
    prisma.university.create({ data: { code: 'UAH', name: 'Trường Đại học Kiến trúc Thành phố Hồ Chí Minh', shortName: 'UAH', website: 'https://uah.edu.vn' } }),
    prisma.university.create({ data: { code: 'VNU-HN', name: 'Đại học Quốc gia Hà Nội', shortName: 'VNU-HN', website: 'https://vnu.edu.vn' } }),
    prisma.university.create({ data: { code: 'VNU-HCM', name: 'Đại học Quốc gia Thành phố Hồ Chí Minh', shortName: 'VNU-HCM', website: 'https://vnuhcm.edu.vn' } }),
    prisma.university.create({ data: { code: 'UEH', name: 'Đại học Kinh tế Thành phố Hồ Chí Minh', shortName: 'UEH', website: 'https://ueh.edu.vn' } }),
    prisma.university.create({ data: { code: 'TDTU', name: 'Trường Đại học Tôn Đức Thắng', shortName: 'TDTU', website: 'https://tdtu.edu.vn' } }),
    prisma.university.create({ data: { code: 'DTU', name: 'Đại học Duy Tân', shortName: 'DTU', website: 'https://duytan.edu.vn' } }),
    prisma.university.create({ data: { code: 'USTH', name: 'Trường Đại học Khoa học và Công nghệ Hà Nội', shortName: 'USTH', website: 'https://usth.edu.vn' } }),
    prisma.university.create({ data: { code: 'CTU', name: 'Đại học Cần Thơ', shortName: 'CTU', website: 'https://ctu.edu.vn' } }),
    prisma.university.create({ data: { code: 'TMU', name: 'Trường Đại học Thương mại', shortName: 'TMU', website: 'https://tmu.edu.vn' } }),
    prisma.university.create({ data: { code: 'HUE', name: 'Đại học Huế', shortName: 'HUE', website: 'https://hueuni.edu.vn' } }),
    prisma.university.create({ data: { code: 'NTTU', name: 'Trường Đại học Nguyễn Tất Thành', shortName: 'NTTU', website: 'https://ntt.edu.vn' } }),
  ]);

  const [hust, neu, uet, hcmue, uah, vnuHn, vnuHcm, ueh, tdtu, dtu, usth, ctu, tmu, hue, nttu] = universities;
  const faculties = await Promise.all([
    prisma.faculty.create({ data: { universityId: hust.id, code: 'SOICT', name: 'Công nghệ thông tin' } }),
    prisma.faculty.create({ data: { universityId: hust.id, code: 'SEEE', name: 'Điện - Điện tử' } }),
    prisma.faculty.create({ data: { universityId: neu.id, code: 'TKT', name: 'Toán kinh tế' } }),
    prisma.faculty.create({ data: { universityId: neu.id, code: 'QTKD', name: 'Quản trị kinh doanh' } }),
    prisma.faculty.create({ data: { universityId: uet.id, code: 'FIT', name: 'Công nghệ thông tin' } }),
    prisma.faculty.create({ data: { universityId: hcmue.id, code: 'FIT', name: 'Khoa Công nghệ thông tin' } }),
    prisma.faculty.create({ data: { universityId: uah.id, code: 'ARCH', name: 'Khoa Kiến trúc' } }),
    prisma.faculty.create({ data: { universityId: vnuHn.id, code: 'USSH', name: 'Trường Đại học Khoa học Xã hội và Nhân văn' } }),
    prisma.faculty.create({ data: { universityId: vnuHcm.id, code: 'UIT', name: 'Trường Đại học Công nghệ Thông tin' } }),
    prisma.faculty.create({ data: { universityId: ueh.id, code: 'ISB', name: 'Viện Đào tạo quốc tế' } }),
    prisma.faculty.create({ data: { universityId: tdtu.id, code: 'FCS', name: 'Khoa Khoa học máy tính' } }),
    prisma.faculty.create({ data: { universityId: dtu.id, code: 'SCE', name: 'Trường Công nghệ và Kỹ thuật' } }),
    prisma.faculty.create({ data: { universityId: usth.id, code: 'ICT', name: 'Khoa Công nghệ thông tin và Truyền thông' } }),
    prisma.faculty.create({ data: { universityId: ctu.id, code: 'CIT', name: 'Khoa Công nghệ thông tin và Truyền thông' } }),
    prisma.faculty.create({ data: { universityId: tmu.id, code: 'FE', name: 'Khoa Kinh tế' } }),
    prisma.faculty.create({ data: { universityId: hue.id, code: 'KHTN', name: 'Trường Đại học Khoa học' } }),
    prisma.faculty.create({ data: { universityId: nttu.id, code: 'IT', name: 'Khoa Công nghệ thông tin' } }),
  ]);

  const [soict, seee, tkt, qtkd, fit, hcmueFit, uahArch, vnuHnUssh, vnuHcmUit, uehIsb, tdtuFcs, dtuSce, usthIct, ctuCit, tmuFe, hueKhtn, nttuIt] = faculties;
  const subjects = await Promise.all([
    prisma.subject.create({ data: { facultyId: soict.id, code: 'IT3080', name: 'Cơ sở dữ liệu', credits: 3, description: 'Mô hình dữ liệu, SQL và thiết kế cơ sở dữ liệu.' } }),
    prisma.subject.create({ data: { facultyId: soict.id, code: 'IT4062', name: 'Công nghệ phần mềm', credits: 3, description: 'Quy trình và kỹ thuật phát triển phần mềm.' } }),
    prisma.subject.create({ data: { facultyId: seee.id, code: 'ET2020', name: 'Tín hiệu và hệ thống', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: tkt.id, code: 'KE301', name: 'Kinh tế lượng', credits: 3, description: 'Hồi quy tuyến tính và phân tích dữ liệu kinh tế.' } }),
    prisma.subject.create({ data: { facultyId: qtkd.id, code: 'QTKD101', name: 'Marketing căn bản', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: fit.id, code: 'INT2204', name: 'Lập trình Python', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: fit.id, code: 'INT3306', name: 'Trí tuệ nhân tạo', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: fit.id, code: 'INT3401', name: 'Phát triển ứng dụng web', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: hcmueFit.id, code: 'CTDLGT', name: 'Cấu trúc dữ liệu và giải thuật', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: uahArch.id, code: 'KTA201', name: 'Thiết kế kiến trúc 1', credits: 4 } }),
    prisma.subject.create({ data: { facultyId: vnuHnUssh.id, code: 'XHH101', name: 'Nhập môn Xã hội học', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: vnuHcmUit.id, code: 'CS114', name: 'Lập trình hướng đối tượng', credits: 4 } }),
    prisma.subject.create({ data: { facultyId: uehIsb.id, code: 'MKT201', name: 'Nguyên lý Marketing', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: tdtuFcs.id, code: 'CSC101', name: 'Nhập môn lập trình', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: dtuSce.id, code: 'CSE301', name: 'Kỹ nghệ phần mềm', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: usthIct.id, code: 'ICT201', name: 'Cơ sở dữ liệu', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: ctuCit.id, code: 'CT101', name: 'Lập trình căn bản', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: tmuFe.id, code: 'KTCT101', name: 'Kinh tế chính trị Mác - Lênin', credits: 2 } }),
    prisma.subject.create({ data: { facultyId: hueKhtn.id, code: 'TIN101', name: 'Nhập môn Tin học', credits: 3 } }),
    prisma.subject.create({ data: { facultyId: nttuIt.id, code: 'CSC102', name: 'Lập trình C++', credits: 3 } }),
  ]);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@digital-learning.test', username: 'admin', fullName: 'Nguyễn Minh Quân', passwordHash: seedPasswordHash, role: 'ADMIN', emailVerifiedAt: daysAgo(120) } }),
    prisma.user.create({ data: { email: 'moderator@digital-learning.test', username: 'moderator', fullName: 'Trần Thu Hà', passwordHash: seedPasswordHash, role: 'STUDENT', universityId: neu.id, facultyId: tkt.id, emailVerifiedAt: daysAgo(110) } }),
    prisma.user.create({ data: { email: 'an.nguyen@hust.edu.vn', username: 'annguyen', fullName: 'Nguyễn Hoàng An', passwordHash: seedPasswordHash, role: 'STUDENT', universityId: hust.id, facultyId: soict.id, bio: 'Sinh viên K66 ngành Công nghệ thông tin.', emailVerifiedAt: daysAgo(90) } }),
    prisma.user.create({ data: { email: 'linh.tran@neu.edu.vn', username: 'linhtran', fullName: 'Trần Ngọc Linh', passwordHash: seedPasswordHash, role: 'STUDENT', universityId: neu.id, facultyId: tkt.id, emailVerifiedAt: daysAgo(80) } }),
    prisma.user.create({ data: { email: 'bao.le@uet.vnu.edu.vn', username: 'lebao', fullName: 'Lê Quốc Bảo', passwordHash: seedPasswordHash, role: 'STUDENT', universityId: uet.id, facultyId: fit.id, emailVerifiedAt: daysAgo(70) } }),
    prisma.user.create({ data: { email: 'mai.pham@student.test', username: 'maipham', fullName: 'Phạm Thùy Mai', passwordHash: seedPasswordHash, universityId: hust.id, facultyId: soict.id, emailVerifiedAt: daysAgo(60) } }),
    prisma.user.create({ data: { email: 'duc.ho@student.test', username: 'duc.ho', fullName: 'Hồ Minh Đức', passwordHash: seedPasswordHash, universityId: neu.id, facultyId: qtkd.id, emailVerifiedAt: daysAgo(50) } }),
    prisma.user.create({ data: { email: 'yen.vo@student.test', username: 'yenvo', fullName: 'Võ Khánh Yến', passwordHash: seedPasswordHash, universityId: uet.id, facultyId: fit.id, emailVerifiedAt: daysAgo(40) } }),
  ]);

  const [admin, moderator, an, linh, bao, mai, duc, yen] = users;
  const categories = [];
  const technology = await prisma.category.create({ data: { name: 'Công nghệ thông tin', slug: 'cong-nghe-thong-tin', icon: 'computer', sortOrder: 1 } });
  const business = await prisma.category.create({ data: { name: 'Kinh tế và quản trị', slug: 'kinh-te-quan-tri', icon: 'business', sortOrder: 2 } });
  categories.push(technology, business);
  categories.push(await prisma.category.create({ data: { parentId: technology.id, name: 'Cơ sở dữ liệu', slug: 'co-so-du-lieu', icon: 'database', sortOrder: 1 } }));
  categories.push(await prisma.category.create({ data: { parentId: technology.id, name: 'Lập trình', slug: 'lap-trinh', icon: 'code', sortOrder: 2 } }));
  categories.push(await prisma.category.create({ data: { parentId: business.id, name: 'Kinh tế học', slug: 'kinh-te-hoc', icon: 'query_stats', sortOrder: 1 } }));
  categories.push(await prisma.category.create({ data: { parentId: business.id, name: 'Quản trị kinh doanh', slug: 'quan-tri-kinh-doanh', icon: 'groups', sortOrder: 2 } }));

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Đề thi', slug: 'de-thi' } }),
    prisma.tag.create({ data: { name: 'Bài giảng', slug: 'bai-giang' } }),
    prisma.tag.create({ data: { name: 'Ôn tập', slug: 'on-tap' } }),
    prisma.tag.create({ data: { name: 'SQL', slug: 'sql' } }),
    prisma.tag.create({ data: { name: 'Python', slug: 'python' } }),
    prisma.tag.create({ data: { name: 'Giáo trình', slug: 'giao-trinh' } }),
    prisma.tag.create({ data: { name: 'Có đáp án', slug: 'co-dap-an' } }),
    prisma.tag.create({ data: { name: '2024-2025', slug: '2024-2025' } }),
  ]);

  const documentInputs = [
    { uploaderId: an.id, universityId: hust.id, facultyId: soict.id, subjectId: subjects[0].id, title: 'Giáo trình Cơ sở dữ liệu nâng cao', slug: 'giao-trinh-co-so-du-lieu-nang-cao', type: 'TEXTBOOK', file: 'PDF', category: categories[2], tags: [tags[1], tags[3], tags[5]], rating: 4.8 },
    { uploaderId: an.id, universityId: hust.id, facultyId: soict.id, subjectId: subjects[0].id, title: 'Đề thi Cơ sở dữ liệu cuối kỳ 2024', slug: 'de-thi-co-so-du-lieu-cuoi-ky-2024', type: 'EXAM', file: 'PDF', category: categories[2], tags: [tags[0], tags[3], tags[6]], rating: 4.6 },
    { uploaderId: bao.id, universityId: uet.id, facultyId: fit.id, subjectId: subjects[5].id, title: 'Bài giảng lập trình Python cơ bản', slug: 'bai-giang-lap-trinh-python-co-ban', type: 'LECTURE_NOTE', file: 'PPTX', category: categories[3], tags: [tags[1], tags[4]], rating: 4.7 },
    { uploaderId: bao.id, universityId: uet.id, facultyId: fit.id, subjectId: subjects[6].id, title: 'Tóm tắt ôn tập Trí tuệ nhân tạo', slug: 'tom-tat-on-tap-tri-tue-nhan-tao', type: 'SUMMARY', file: 'PDF', category: categories[3], tags: [tags[2], tags[7]], rating: 4.5 },
    { uploaderId: linh.id, universityId: neu.id, facultyId: tkt.id, subjectId: subjects[3].id, title: 'Tổng hợp đề thi Kinh tế lượng 2021-2024', slug: 'tong-hop-de-thi-kinh-te-luong-2021-2024', type: 'EXAM', file: 'PDF', category: categories[4], tags: [tags[0], tags[6], tags[7]], rating: 4.9 },
    { uploaderId: linh.id, universityId: neu.id, facultyId: tkt.id, subjectId: subjects[3].id, title: 'Giáo trình Kinh tế lượng thực hành', slug: 'giao-trinh-kinh-te-luong-thuc-hanh', type: 'TEXTBOOK', file: 'PDF', category: categories[4], tags: [tags[1], tags[5]], rating: 4.4 },
    { uploaderId: linh.id, universityId: neu.id, facultyId: qtkd.id, subjectId: subjects[4].id, title: 'Slide Marketing căn bản', slug: 'slide-marketing-can-ban', type: 'LECTURE_NOTE', file: 'PPTX', category: categories[5], tags: [tags[1], tags[7]], rating: 4.2 },
    { uploaderId: an.id, universityId: hust.id, facultyId: soict.id, subjectId: subjects[1].id, title: 'Bài tập Công nghệ phần mềm có lời giải', slug: 'bai-tap-cong-nghe-phan-mem-co-loi-giai', type: 'ASSIGNMENT', file: 'DOCX', category: categories[3], tags: [tags[2], tags[6]], rating: 4.3 },
    { uploaderId: bao.id, universityId: uet.id, facultyId: fit.id, subjectId: subjects[7].id, title: 'Đồ án phát triển ứng dụng web', slug: 'do-an-phat-trien-ung-dung-web', type: 'THESIS', file: 'PDF', category: categories[3], tags: [tags[5], tags[7]], rating: 4.6 },
    { uploaderId: an.id, universityId: hust.id, facultyId: seee.id, subjectId: subjects[2].id, title: 'Tài liệu ôn tập Tín hiệu và hệ thống', slug: 'tai-lieu-on-tap-tin-hieu-va-he-thong', type: 'SUMMARY', file: 'PDF', category: technology, tags: [tags[2], tags[5]], rating: 4.1 },
  ];

  const documents = [];
  for (let index = 0; index < documentInputs.length; index += 1) {
    const input = documentInputs[index];
    const document = await prisma.document.create({
      data: {
        uploaderId: input.uploaderId,
        universityId: input.universityId,
        facultyId: input.facultyId,
        subjectId: input.subjectId,
        title: input.title,
        slug: input.slug,
        description: `Tài liệu mẫu phục vụ sinh viên tra cứu và học tập môn ${input.title}.`,
        documentType: input.type,
        fileFormat: input.file,
        fileUrl: `/uploads/documents/${input.slug}.${input.file.toLowerCase()}`,
        thumbnailUrl: `/uploads/thumbnails/${input.slug}.jpg`,
        originalFileName: `${input.slug}.${input.file.toLowerCase()}`,
        fileSizeBytes: BigInt(1500000 + index * 425000),
        pageCount: 35 + index * 8,
        academicYear: index % 2 === 0 ? '2024-2025' : '2023-2024',
        status: index === 7 ? 'PENDING_REVIEW' : 'PUBLISHED',
        visibility: 'PUBLIC',
        isVerified: index !== 7,
        verifiedAt: index === 7 ? null : daysAgo(20 + index),
        publishedAt: index === 7 ? null : daysAgo(15 + index),
        downloadCount: 30 + index * 17,
        viewCount: 100 + index * 53,
        commentCount: 2,
        ratingAverage: input.rating,
        ratingCount: 2,
        processingStatus: 'COMPLETED',
        checksum: `seed-checksum-${index + 1}`,
        extractedText: `Nội dung OCR mẫu của tài liệu ${input.title}.`,
        metadata: { source: 'seed', language: 'vi', chapters: 4 + index },
        citationCount: index * 2,
        createdAt: daysAgo(60 - index),
      },
    });
    documents.push(document);

    await prisma.documentCategory.create({ data: { documentId: document.id, categoryId: input.category.id } });
    await prisma.documentTag.createMany({ data: input.tags.map((tag) => ({ documentId: document.id, tagId: tag.id })) });
  }

  const comments = [];
  for (let index = 0; index < 10; index += 1) {
    const comment = await prisma.comment.create({
      data: {
        documentId: documents[index].id,
        authorId: users[(index + 5) % users.length].id,
        content: index % 2 === 0 ? 'Tài liệu trình bày rõ ràng, phần ví dụ rất hữu ích.' : 'Bạn có thể bổ sung thêm đáp án cho chương cuối không?',
        status: 'VISIBLE',
        createdAt: daysAgo(index + 2),
      },
    });
    comments.push(comment);
  }
  await prisma.comment.createMany({
    data: [
      { documentId: documents[0].id, authorId: linh.id, parentId: comments[0].id, content: 'Mình cũng thấy phần SQL rất dễ theo dõi.', status: 'VISIBLE' },
      { documentId: documents[4].id, authorId: mai.id, parentId: comments[4].id, content: 'Cảm ơn bạn, mình đã tải về để ôn thi.', status: 'VISIBLE' },
    ],
  });

  await prisma.rating.createMany({
    data: documents.map((document, index) => ({
      documentId: document.id,
      userId: users[(index + 5) % users.length].id,
      score: Math.min(5, Math.max(4, Math.round(Number(documentInputs[index].rating)))),
      review: index % 2 === 0 ? 'Nội dung hữu ích và dễ đọc.' : 'Tài liệu tốt, nên bổ sung thêm ví dụ.',
    })),
  });
  await prisma.rating.createMany({
    data: documents.map((document, index) => ({
      documentId: document.id,
      userId: users[(index + 6) % users.length].id,
      score: 4,
      review: 'Phù hợp để tham khảo khi ôn tập.',
    })),
  });

  await prisma.favorite.createMany({
    data: documents.map((document, index) => ({ documentId: document.id, userId: users[(index + 5) % users.length].id })),
  });
  await prisma.download.createMany({
    data: documents.map((document, index) => ({ documentId: document.id, userId: users[(index + 5) % users.length].id, ipAddress: `192.168.1.${20 + index}`, userAgent: 'Seed Browser' })),
  });
  await prisma.documentView.createMany({
    data: documents.map((document, index) => ({ documentId: document.id, userId: users[(index + 6) % users.length].id, sessionId: `seed-session-${index + 1}`, ipAddress: `192.168.2.${20 + index}` })),
  });

  await prisma.documentReview.createMany({
    data: documents.slice(0, 6).map((document, index) => ({
      documentId: document.id,
      reviewerId: moderator.id,
      decision: 'APPROVED',
      note: 'Đã kiểm tra metadata, định dạng file và nội dung cơ bản.',
      createdAt: daysAgo(18 + index),
    })),
  });
  await prisma.documentReview.create({
    data: { documentId: documents[7].id, reviewerId: moderator.id, decision: 'CHANGES_REQUESTED', note: 'Vui lòng bổ sung nguồn tham khảo trước khi xuất bản.' },
  });

  await prisma.documentVersion.createMany({
    data: documents.map((document, index) => ({
      documentId: document.id,
      createdById: documentInputs[index].uploaderId,
      versionNumber: 1,
      fileUrl: document.fileUrl,
      originalFileName: document.originalFileName,
      fileFormat: document.fileFormat,
      fileSizeBytes: document.fileSizeBytes,
      checksum: document.checksum,
      pageCount: document.pageCount,
      changeNote: 'Phiên bản đầu tiên từ dữ liệu mẫu.',
    })),
  });

  await prisma.documentProcessingJob.createMany({
    data: documents.map((document, index) => ({
      documentId: document.id,
      requestedById: document.uploaderId,
      status: index === 7 ? 'PROCESSING' : 'COMPLETED',
      scanStatus: 'CLEAN',
      extractedText: document.extractedText,
      result: { ocrPages: document.pageCount, detectedLanguage: 'vi', tables: index + 1 },
      startedAt: daysAgo(16 + index),
      completedAt: index === 7 ? null : daysAgo(15 + index),
    })),
  });

  await prisma.report.createMany({
    data: [
      { documentId: documents[1].id, reporterId: mai.id, reason: 'BROKEN_FILE', description: 'Một số trang trong file bị lỗi hiển thị.', status: 'OPEN' },
      { documentId: documents[4].id, reporterId: duc.id, reason: 'INCORRECT_INFORMATION', description: 'Có một công thức cần được kiểm tra lại.', status: 'IN_REVIEW' },
      { commentId: comments[2].id, reporterId: yen.id, reason: 'SPAM', description: 'Bình luận không liên quan đến tài liệu.', status: 'RESOLVED', resolvedById: moderator.id, resolutionNote: 'Đã ẩn bình luận vi phạm.', resolvedAt: daysAgo(3) },
      { documentId: documents[6].id, reporterId: mai.id, reason: 'COPYRIGHT', description: 'Cần xác minh nguồn của slide.', status: 'DISMISSED', resolvedById: moderator.id, resolutionNote: 'Người đóng góp đã cung cấp nguồn tham khảo.', resolvedAt: daysAgo(5) },
      { documentId: documents[8].id, reporterId: duc.id, reason: 'OTHER', description: 'Thông tin môn học chưa đầy đủ.', status: 'OPEN' },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { recipientId: an.id, actorId: moderator.id, type: 'DOCUMENT_APPROVED', title: 'Tài liệu đã được duyệt', message: `Tài liệu "${documents[0].title}" đã được xuất bản.`, documentId: documents[0].id },
      { recipientId: linh.id, actorId: moderator.id, type: 'DOCUMENT_APPROVED', title: 'Tài liệu đã được duyệt', message: `Tài liệu "${documents[4].title}" đã được xuất bản.`, documentId: documents[4].id },
      { recipientId: an.id, actorId: moderator.id, type: 'DOCUMENT_REJECTED', title: 'Tài liệu cần chỉnh sửa', message: `Tài liệu "${documents[7].title}" cần bổ sung nguồn tham khảo.`, documentId: documents[7].id },
      { recipientId: linh.id, actorId: mai.id, type: 'DOCUMENT_COMMENT', title: 'Có bình luận mới', message: 'Tài liệu của bạn có một bình luận mới.', documentId: documents[4].id, commentId: comments[4].id },
      { recipientId: mai.id, actorId: linh.id, type: 'COMMENT_REPLY', title: 'Có phản hồi bình luận', message: 'Bình luận của bạn đã nhận được phản hồi.', documentId: documents[0].id, commentId: comments[0].id },
      { recipientId: bao.id, type: 'SYSTEM', title: 'Chào mừng người đóng góp', message: 'Cảm ơn bạn đã chia sẻ học liệu với cộng đồng.' },
      { recipientId: duc.id, type: 'SYSTEM', title: 'Tài liệu mới theo dõi', message: 'Có tài liệu mới phù hợp với môn học bạn quan tâm.' },
      { recipientId: yen.id, type: 'SYSTEM', title: 'Cập nhật hệ thống', message: 'Tính năng đọc tài liệu online đã được cập nhật.' },
    ],
  });

  await prisma.refreshToken.createMany({
    data: users.slice(0, 5).map((user, index) => ({ userId: user.id, tokenHash: `seed-refresh-token-hash-${index + 1}`, expiresAt: daysAgo(-30) })),
  });
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'CREATE', entityType: 'USER', entityId: an.id, metadata: { source: 'seed' } },
      { userId: admin.id, action: 'CREATE', entityType: 'CATEGORY', entityId: technology.id, metadata: { source: 'seed' } },
      ...documents.slice(0, 8).map((document) => ({ userId: document.uploaderId, action: 'CREATE', entityType: 'DOCUMENT', entityId: document.id, metadata: { source: 'seed' } })),
    ],
  });

  console.log(`Seed completed: ${users.length} users, ${documents.length} documents, ${comments.length + 2} comments.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
