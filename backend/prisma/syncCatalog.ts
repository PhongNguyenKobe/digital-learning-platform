import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog = [
  ['HCMUE', 'Trường Đại học Sư phạm Thành phố Hồ Chí Minh', 'HCMUE', 'https://hcmue.edu.vn', 'FIT', 'Khoa Công nghệ thông tin', 'CTDLGT', 'Cấu trúc dữ liệu và giải thuật'],
  ['UAH', 'Trường Đại học Kiến trúc Thành phố Hồ Chí Minh', 'UAH', 'https://uah.edu.vn', 'ARCH', 'Khoa Kiến trúc', 'KTA201', 'Thiết kế kiến trúc 1'],
  ['VNU-HN', 'Đại học Quốc gia Hà Nội', 'VNU-HN', 'https://vnu.edu.vn', 'USSH', 'Trường Đại học Khoa học Xã hội và Nhân văn', 'XHH101', 'Nhập môn Xã hội học'],
  ['VNU-HCM', 'Đại học Quốc gia Thành phố Hồ Chí Minh', 'VNU-HCM', 'https://vnuhcm.edu.vn', 'UIT', 'Trường Đại học Công nghệ Thông tin', 'CS114', 'Lập trình hướng đối tượng'],
  ['UEH', 'Đại học Kinh tế Thành phố Hồ Chí Minh', 'UEH', 'https://ueh.edu.vn', 'ISB', 'Viện Đào tạo quốc tế', 'MKT201', 'Nguyên lý Marketing'],
  ['TDTU', 'Trường Đại học Tôn Đức Thắng', 'TDTU', 'https://tdtu.edu.vn', 'FCS', 'Khoa Khoa học máy tính', 'CSC101', 'Nhập môn lập trình'],
  ['DTU', 'Đại học Duy Tân', 'DTU', 'https://duytan.edu.vn', 'SCE', 'Trường Công nghệ và Kỹ thuật', 'CSE301', 'Kỹ nghệ phần mềm'],
  ['USTH', 'Trường Đại học Khoa học và Công nghệ Hà Nội', 'USTH', 'https://usth.edu.vn', 'ICT', 'Khoa Công nghệ thông tin và Truyền thông', 'ICT201', 'Cơ sở dữ liệu'],
  ['CTU', 'Đại học Cần Thơ', 'CTU', 'https://ctu.edu.vn', 'CIT', 'Khoa Công nghệ thông tin và Truyền thông', 'CT101', 'Lập trình căn bản'],
  ['TMU', 'Trường Đại học Thương mại', 'TMU', 'https://tmu.edu.vn', 'FE', 'Khoa Kinh tế', 'KTCT101', 'Kinh tế chính trị Mác - Lênin'],
  ['HUE', 'Đại học Huế', 'HUE', 'https://hueuni.edu.vn', 'KHTN', 'Trường Đại học Khoa học', 'TIN101', 'Nhập môn Tin học'],
  ['NTTU', 'Trường Đại học Nguyễn Tất Thành', 'NTTU', 'https://ntt.edu.vn', 'IT', 'Khoa Công nghệ thông tin', 'CSC102', 'Lập trình C++'],
] as const;

async function main() {
  for (const [code, name, shortName, website, facultyCode, facultyName, subjectCode, subjectName] of catalog) {
    const university = await prisma.university.upsert({
      where: { code },
      update: { name, shortName, website, isActive: true },
      create: { code, name, shortName, website },
    });
    const faculty = await prisma.faculty.upsert({
      where: { universityId_name: { universityId: university.id, name: facultyName } },
      update: { code: facultyCode, isActive: true },
      create: { universityId: university.id, code: facultyCode, name: facultyName },
    });
    await prisma.subject.upsert({
      where: { facultyId_code: { facultyId: faculty.id, code: subjectCode } },
      update: { name: subjectName, credits: 3, isActive: true },
      create: { facultyId: faculty.id, code: subjectCode, name: subjectName, credits: 3 },
    });
  }
  console.log(`Đã đồng bộ ${catalog.length} trường, khoa/viện và mã học phần vào danh mục.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
