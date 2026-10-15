import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Programmatically create a valid PDF binary buffer without third-party dependencies.
 * @param {string[][]} pagesLines Array of string arrays, each representing lines of text for one page.
 * @returns {Buffer}
 */
export const createPdfBuffer = (pagesLines) => {
  const pageObjNums = [];
  let currentObj = 3;
  const pageContentMap = [];

  for (let i = 0; i < pagesLines.length; i++) {
    const pageNum = currentObj++;
    const contentNum = currentObj++;
    pageObjNums.push(pageNum);
    pageContentMap.push({ pageNum, contentNum, lines: pagesLines[i] });
  }

  const catalog = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj';
  const kids = pageObjNums.map((n) => `${n} 0 R`).join(' ');
  const pages = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pagesLines.length} >>\nendobj`;

  const body = [catalog, pages];

  for (const p of pageContentMap) {
    let stream = '';
    if (p.lines && p.lines.length > 0) {
      stream = 'BT /F1 12 Tf 50 750 Td 14 TL ';
      for (const line of p.lines) {
        const sanitized = line.replace(/[()\\\r\n]/g, ' ').trim();
        if (sanitized) {
          stream += `(${sanitized}) ' `;
        }
      }
      stream += 'ET';
    }

    const pageObj = `${p.pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${p.contentNum} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj`;
    const contentObj = `${p.contentNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`;
    body.push(pageObj);
    body.push(contentObj);
  }

  let pdf = '%PDF-1.4\n';
  const offsets = ['0000000000 65535 f '];

  for (let i = 0; i < body.length; i++) {
    const offset = Buffer.byteLength(pdf);
    offsets.push(`${String(offset).padStart(10, '0')} 00000 n `);
    pdf += `${body[i]}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  const xref = `xref\n0 ${body.length + 1}\n${offsets.join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${body.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf + xref + trailer);
};

export const generateAllFixtures = (targetDir = __dirname) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Good resume (>200 chars, standard sections)
  const goodResumeLines = [
    'Alex Morgan - Senior Full Stack Software Engineer',
    'Email: alex.morgan@example.com | Phone: 555-123-4567 | San Francisco, CA | LinkedIn: linkedin.com/in/alexmorgan',
    'Professional Summary:',
    'Results-driven Software Engineer with over 6 years of experience architecting high-performance web applications, distributed microservices, and modern user interfaces. Proven track record in TypeScript, Node.js, React, Express, and PostgreSQL, reducing latency by 45% and optimizing database queries.',
    'Technical Skills:',
    'Languages: JavaScript ES6+, TypeScript, Python, SQL, HTML5, CSS3',
    'Frameworks & Libraries: React, Node.js, Express, Next.js, Redux, Vitest, Jest',
    'Databases & Tools: MongoDB, PostgreSQL, Redis, Docker, Git, AWS, CI/CD pipelines',
    'Work Experience:',
    'Senior Software Engineer | TechCorp Inc. | 2021 - Present',
    '- Architected scalable RESTful APIs serving 2M+ active daily requests with 99.99% uptime.',
    '- Led migration of legacy monolith to microservices using Node.js and Docker, reducing build time by 60%.',
    '- Mentored junior engineers and conducted comprehensive code reviews adhering to industry best practices.',
    'Education:',
    'Bachelor of Science in Computer Science | University of California, Berkeley | 2015 - 2019',
  ];

  const goodResumePdf = createPdfBuffer([goodResumeLines]);
  fs.writeFileSync(path.join(targetDir, 'resume-good.pdf'), goodResumePdf);

  // 2. Scanned resume (0 characters of readable text)
  const scannedResumePdf = createPdfBuffer([[]]);
  fs.writeFileSync(path.join(targetDir, 'resume-scanned.pdf'), scannedResumePdf);

  // 3. Not a PDF (renamed text file lacking %PDF- magic bytes)
  const notPdfContent = 'This is a plain text file that was maliciously renamed to not-a-pdf.pdf to bypass naive extension checks.';
  fs.writeFileSync(path.join(targetDir, 'not-a-pdf.pdf'), notPdfContent);

  // 4. 11-page PDF (exceeding 10 page limit)
  const elevenPages = Array.from({ length: 11 }, (_, i) => [
    `Page ${i + 1} content of a lengthy multi-page document exceeding standard resume bounds.`,
  ]);
  const elevenPagePdf = createPdfBuffer(elevenPages);
  fs.writeFileSync(path.join(targetDir, 'resume-11pages.pdf'), elevenPagePdf);

  console.log('Test fixtures successfully generated in:', targetDir);
};

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAllFixtures();
}
