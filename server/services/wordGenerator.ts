import { 
  Document, Paragraph, TextRun, Table, TableRow, TableCell, 
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType 
} from 'docx';
import fs from 'fs';
import path from 'path';
import { db } from '../db';

export async function generateWordReport(dateStr: string): Promise<{ filePath: string; filename: string }> {
  const settings = db.getSettings();
  const sessions = db.getLabSessions(dateStr);

  const filename = `BCA_Lab_Daily_Attendance_Report_${dateStr}.docx`;
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const filePath = path.join(reportsDir, filename);

  const primaryNavy = '0F294A';     // Deep Oxford Navy
  const secondaryBlue = '1D4ED8';   // Academic Blue
  const headerBg = '1E3A8A';        // Header dark blue
  const subHeaderBg = '2563EB';     // Session table header
  const tableBorderColor = 'CBD5E1';// Slate border
  const altRowBg = 'F8FAFC';        // Soft light row background
  const presentGreen = '15803D';    // Green
  const absentRed = 'B91C1C';       // Red

  const standardBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: tableBorderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: tableBorderColor },
    left: { style: BorderStyle.SINGLE, size: 4, color: tableBorderColor },
    right: { style: BorderStyle.SINGLE, size: 4, color: tableBorderColor }
  };

  const docChildren: any[] = [
    // College Main Header
    new Paragraph({
      children: [
        new TextRun({ 
          text: (settings.collegeName || 'SRN MEHTA COLLEGE OF COMMERCE AND SCIENCE').toUpperCase(), 
          bold: true, 
          size: 32, // 16pt
          color: primaryNavy,
          font: 'Calibri'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: settings.address || 'Kalaburagi, Karnataka - 585102', 
          size: 20, // 10pt
          color: '475569',
          font: 'Calibri'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: (settings.department || 'DEPARTMENT OF COMPUTER APPLICATIONS (BCA)').toUpperCase(), 
          bold: true, 
          size: 24, // 12pt
          color: secondaryBlue,
          font: 'Calibri'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 }
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: 'COMPUTER LAB DAILY ATTENDANCE & CONDUCT REPORT', 
          bold: true, 
          size: 26, // 13pt
          color: primaryNavy,
          font: 'Calibri'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }),

    // Metadata Bar
    new Table({
      columnWidths: [3500, 3500, 3400],
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3500, type: WidthType.DXA },
              borders: standardBorders,
              shading: { fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Report Date: ', bold: true, size: 20, font: 'Calibri' }),
                    new TextRun({ text: dateStr, bold: true, color: primaryNavy, size: 20, font: 'Calibri' })
                  ],
                  spacing: { before: 80, after: 80 }
                })
              ]
            }),
            new TableCell({
              width: { size: 3500, type: WidthType.DXA },
              borders: standardBorders,
              shading: { fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Academic Year: ', bold: true, size: 20, font: 'Calibri' }),
                    new TextRun({ text: settings.academicYear || '2026-2027', size: 20, font: 'Calibri' })
                  ],
                  spacing: { before: 80, after: 80 }
                })
              ]
            }),
            new TableCell({
              width: { size: 3400, type: WidthType.DXA },
              borders: standardBorders,
              shading: { fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Generated On: ', bold: true, size: 20, font: 'Calibri' }),
                    new TextRun({ text: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), size: 20, font: 'Calibri' })
                  ],
                  spacing: { before: 80, after: 80 }
                })
              ]
            })
          ]
        })
      ]
    }),

    new Paragraph({ spacing: { before: 180, after: 60 } }),

    // Section 1: Executive Summary
    new Paragraph({
      children: [
        new TextRun({ 
          text: '1. EXECUTIVE LAB SESSIONS SUMMARY', 
          bold: true, 
          size: 24, 
          color: primaryNavy,
          font: 'Calibri'
        })
      ],
      spacing: { before: 160, after: 100 }
    })
  ];

  // Summary Table Header (9 columns, widths in dxa totaling 10900)
  const sumColWidths = [500, 1400, 2400, 1800, 1900, 700, 800, 700, 700];
  const summaryTableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: sumColWidths[0], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[1], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[2], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Subject & Code', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[3], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Teacher / Faculty', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[4], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Lab Room & Time', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[5], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[6], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Present', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[7], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Absent', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[8], type: WidthType.DXA }, borders: standardBorders, shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Attd. %', bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })] })] }),
      ]
    })
  ];

  let totalEntries = 0;
  let totalPresentGlobal = 0;
  let totalAbsentGlobal = 0;

  sessions.forEach((session, idx) => {
    totalEntries += (session.totalStudents || 0);
    totalPresentGlobal += (session.presentCount || 0);
    totalAbsentGlobal += (session.absentCount || 0);
    const rowShading = idx % 2 === 1 ? { fill: altRowBg } : undefined;

    summaryTableRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: sumColWidths[0], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[1], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: session.semesterName || 'Semester', bold: true, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[2], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: `${session.subjectName} (${session.subjectCode})`, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[3], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: session.teacherName || '', size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[4], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: `${session.labRoom || 'Lab'} (${session.startTime} - ${session.endTime})`, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[5], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(session.totalStudents || 0), bold: true, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[6], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(session.presentCount || 0), bold: true, color: presentGreen, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[7], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(session.absentCount || 0), bold: true, color: absentRed, size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: sumColWidths[8], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${session.attendancePercentage || 0}%`, bold: true, color: (session.attendancePercentage || 0) >= 75 ? presentGreen : absentRed, size: 18, font: 'Calibri' })] })] }),
        ]
      })
    );
  });

  const overallPercentage = totalEntries > 0 ? Number(((totalPresentGlobal / totalEntries) * 100).toFixed(1)) : 0;
  const mergedTotalsWidth = sumColWidths[0] + sumColWidths[1] + sumColWidths[2] + sumColWidths[3] + sumColWidths[4]; // 500+1400+2400+1800+1900 = 8200

  // Add Grand Total Row
  summaryTableRows.push(
    new TableRow({
      children: [
        new TableCell({ 
          width: { size: mergedTotalsWidth, type: WidthType.DXA },
          borders: standardBorders, 
          shading: { fill: 'E2E8F0' }, 
          columnSpan: 5, 
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TOTALS / OVERALL AVERAGE:', bold: true, size: 19, font: 'Calibri' })] })] 
        }),
        new TableCell({ width: { size: sumColWidths[5], type: WidthType.DXA }, borders: standardBorders, shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(totalEntries), bold: true, size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[6], type: WidthType.DXA }, borders: standardBorders, shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(totalPresentGlobal), bold: true, color: presentGreen, size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[7], type: WidthType.DXA }, borders: standardBorders, shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(totalAbsentGlobal), bold: true, color: absentRed, size: 19, font: 'Calibri' })] })] }),
        new TableCell({ width: { size: sumColWidths[8], type: WidthType.DXA }, borders: standardBorders, shading: { fill: 'E2E8F0' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${overallPercentage}%`, bold: true, color: overallPercentage >= 75 ? presentGreen : absentRed, size: 19, font: 'Calibri' })] })] }),
      ]
    })
  );

  docChildren.push(
    new Table({
      columnWidths: sumColWidths,
      rows: summaryTableRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    }),
    new Paragraph({ spacing: { before: 200, after: 100 } })
  );

  // Section 2: Detailed Student Attendance Rolls for Every Session
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: '2. DETAILED STUDENT ATTENDANCE ROLLS (SESSION-WISE)', 
          bold: true, 
          size: 24, 
          color: primaryNavy,
          font: 'Calibri'
        })
      ],
      spacing: { before: 200, after: 120 }
    })
  );

  if (sessions.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ 
            text: 'No laboratory sessions recorded for this date.', 
            italics: true, 
            color: '64748B', 
            size: 20,
            font: 'Calibri' 
          })
        ],
        spacing: { before: 100, after: 200 }
      })
    );
  }

  sessions.forEach((session, idx) => {
    const attRecords = db.getAttendanceRecordsForSession(session.id);
    const presentRecs = attRecords.filter(r => r.attendanceStatus === 'Present');
    const absentRecs = attRecords.filter(r => r.attendanceStatus === 'Absent');

    docChildren.push(
      // Session Title Banner
      new Paragraph({
        children: [
          new TextRun({ 
            text: `SESSION ${idx + 1}: ${session.semesterName?.toUpperCase()} — ${session.subjectName?.toUpperCase()} (${session.subjectCode})`, 
            bold: true, 
            size: 22, 
            color: secondaryBlue,
            font: 'Calibri' 
          })
        ],
        spacing: { before: 240, after: 60 }
      }),
      // Session Details Paragraph
      new Paragraph({
        children: [
          new TextRun({ text: 'Teacher: ', bold: true, size: 19, font: 'Calibri' }),
          new TextRun({ text: `${session.teacherName}   |   `, size: 19, font: 'Calibri' }),
          new TextRun({ text: 'Lab Room: ', bold: true, size: 19, font: 'Calibri' }),
          new TextRun({ text: `${session.labRoom || 'Main Lab'}   |   `, size: 19, font: 'Calibri' }),
          new TextRun({ text: 'Time: ', bold: true, size: 19, font: 'Calibri' }),
          new TextRun({ text: `${session.startTime} - ${session.endTime}   |   `, size: 19, font: 'Calibri' }),
          new TextRun({ text: 'Present: ', bold: true, size: 19, color: presentGreen, font: 'Calibri' }),
          new TextRun({ text: `${presentRecs.length} / ${attRecords.length} (${session.attendancePercentage}%)`, bold: true, size: 19, color: presentGreen, font: 'Calibri' })
        ],
        spacing: { after: 120 }
      })
    );

    // Student Attendance Detailed Table (5 columns, widths totaling 10900)
    const studColWidths = [700, 1800, 4000, 2400, 2000];
    const studentTableRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ width: { size: studColWidths[0], type: WidthType.DXA }, borders: standardBorders, shading: { fill: subHeaderBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Sl No', bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: studColWidths[1], type: WidthType.DXA }, borders: standardBorders, shading: { fill: subHeaderBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Roll No', bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: studColWidths[2], type: WidthType.DXA }, borders: standardBorders, shading: { fill: subHeaderBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Student Name', bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: studColWidths[3], type: WidthType.DXA }, borders: standardBorders, shading: { fill: subHeaderBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Reg / Enrollment No', bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })] })] }),
          new TableCell({ width: { size: studColWidths[4], type: WidthType.DXA }, borders: standardBorders, shading: { fill: subHeaderBg }, children: [new Paragraph({ children: [new TextRun({ text: 'Attendance Status', bold: true, color: 'FFFFFF', size: 18, font: 'Calibri' })] })] }),
        ]
      })
    ];

    attRecords.forEach((rec, sIdx) => {
      const isPresent = rec.attendanceStatus === 'Present';
      const rowShading = sIdx % 2 === 1 ? { fill: altRowBg } : undefined;

      studentTableRows.push(
        new TableRow({
          children: [
            new TableCell({ width: { size: studColWidths[0], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: String(sIdx + 1), size: 18, font: 'Calibri' })] })] }),
            new TableCell({ width: { size: studColWidths[1], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: rec.rollNumber || '-', bold: true, size: 18, font: 'Calibri' })] })] }),
            new TableCell({ width: { size: studColWidths[2], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: rec.studentName || 'Student', bold: true, size: 19, font: 'Calibri' })] })] }),
            new TableCell({ width: { size: studColWidths[3], type: WidthType.DXA }, borders: standardBorders, shading: rowShading, children: [new Paragraph({ children: [new TextRun({ text: rec.enrollmentNumber || '-', size: 18, font: 'Calibri' })] })] }),
            new TableCell({ 
              width: { size: studColWidths[4], type: WidthType.DXA },
              borders: standardBorders,
              shading: isPresent ? { fill: 'F0FDF4' } : { fill: 'FEF2F2' },
              children: [
                new Paragraph({ 
                  children: [
                    new TextRun({ 
                      text: isPresent ? '✓ PRESENT' : '✗ ABSENT', 
                      bold: true, 
                      color: isPresent ? presentGreen : absentRed,
                      size: 18,
                      font: 'Calibri'
                    })
                  ] 
                })
              ] 
            }),
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        columnWidths: studColWidths,
        rows: studentTableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Session Remarks / Experiment Covered: ', bold: true, size: 18, font: 'Calibri' }),
          new TextRun({ text: session.remarks || 'Daily laboratory practical curriculum completed as scheduled.', italics: true, size: 18, font: 'Calibri' })
        ],
        spacing: { before: 100, after: 200 }
      })
    );
  });

  // Section 3: Signatures & Verification Block
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: '3. VERIFICATION & SIGNATURES', 
          bold: true, 
          size: 24, 
          color: primaryNavy,
          font: 'Calibri'
        })
      ],
      spacing: { before: 300, after: 150 }
    }),
    new Table({
      columnWidths: [3600, 3600, 3700],
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '____________________________________', bold: true, size: 20, font: 'Calibri' }),
                  ],
                  spacing: { before: 300, after: 60 }
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'COMPUTER LAB IN-CHARGE', bold: true, size: 19, font: 'Calibri' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: settings.collegeName || 'SRN Mehta College', size: 17, color: '64748B', font: 'Calibri' })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '____________________________________', bold: true, size: 20, font: 'Calibri' }),
                  ],
                  spacing: { before: 300, after: 60 }
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'HOD / LAB FACULTY', bold: true, size: 19, font: 'Calibri' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Dept. of Computer Science', size: 17, color: '64748B', font: 'Calibri' })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 3700, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: '____________________________________', bold: true, size: 20, font: 'Calibri' }),
                  ],
                  spacing: { before: 300, after: 60 }
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'PRINCIPAL / DIRECTOR', bold: true, size: 19, font: 'Calibri' })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Seal & Signature', size: 17, color: '64748B', font: 'Calibri' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  );

  const finalDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const buffer = await import('docx').then(m => m.Packer.toBuffer(finalDoc));
  fs.writeFileSync(filePath, buffer);

  return { filePath, filename };
}
