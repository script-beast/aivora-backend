import PDFDocument from 'pdfkit';

interface ProgressStats {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  totalHoursSpent: number;
  averageSentiment: number;
}

interface PDFReportData {
  goal: any;
  progress: any[];
  insights: any[];
  stats: ProgressStats;
}

export class PDFService {
  private doc: PDFKit.PDFDocument;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new PDFDocument({ size: 'A4', margin: 20 });
    this.pageWidth = this.doc.page.width;
    this.pageHeight = this.doc.page.height;
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateReport(data: PDFReportData): Promise<PDFKit.PDFDocument> {
    // Header
    this.addHeader();

    // Goal Overview
    this.addGoalOverview(data.goal);

    // Statistics
    this.addStatistics(data.stats);

    // Progress Summary
    this.addProgressSummary(data.progress, data.goal);

    // Insights
    if (data.insights.length > 0) {
      this.checkPageBreak(150);
      this.addInsights(data.insights);
    }

    // Footer
    this.addFooter();

    // Finalize the PDF
    this.doc.end();

    return this.doc;
  }

  private addHeader(): void {
    // Logo/Title
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#4F46E5') // Indigo
      .text('Aivora', this.margin, this.currentY);

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280') // Gray
      .text('Goal Achievement Report', this.margin, this.currentY + 25);

    // Date
    this.doc
      .fontSize(9)
      .text(
        `Generated: ${new Date().toLocaleDateString()}`,
        this.pageWidth - this.margin - 100,
        this.currentY,
        { width: 100, align: 'right' }
      );

    // Line separator
    this.currentY += 40;
    this.doc
      .strokeColor('#E5E7EB')
      .moveTo(this.margin, this.currentY)
      .lineTo(this.pageWidth - this.margin, this.currentY)
      .stroke();
    this.currentY += 15;
  }

  private addGoalOverview(goal: any): void {
    // Section title
    this.addSectionTitle('Goal Overview');

    // Goal title
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(goal.title, this.margin, this.currentY, {
        width: this.pageWidth - 2 * this.margin,
      });

    this.currentY = this.doc.y + 10;

    // Description
    if (goal.description) {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(goal.description, this.margin, this.currentY, {
          width: this.pageWidth - 2 * this.margin,
        });
      this.currentY = this.doc.y + 10;
    }

    // Goal details box
    this.currentY += 5;
    const boxHeight = 70;
    this.doc
      .rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight)
      .fillAndStroke('#F3F4F6', '#E5E7EB');

    const leftX = this.margin + 10;
    const rightX = this.pageWidth / 2 + 10;
    let detailY = this.currentY + 15;

    this.doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151');

    // Left column
    this.doc.text('Duration:', leftX, detailY);
    this.doc.font('Helvetica').text(`${goal.duration} days`, leftX + 80, detailY);

    detailY += 20;
    this.doc.font('Helvetica-Bold').text('Hours/Day:', leftX, detailY);
    this.doc.font('Helvetica').text(`${goal.hoursPerDay} hours`, leftX + 80, detailY);

    detailY += 20;
    this.doc.font('Helvetica-Bold').text('Start Date:', leftX, detailY);
    this.doc
      .font('Helvetica')
      .text(new Date(goal.startDate).toLocaleDateString(), leftX + 80, detailY);

    // Right column
    detailY = this.currentY + 15;
    this.doc.font('Helvetica-Bold').text('Status:', rightX, detailY);
    const statusColor = goal.status === 'completed' ? '#10B981' : '#3B82F6';
    this.doc
      .font('Helvetica')
      .fillColor(statusColor)
      .text(goal.status.toUpperCase(), rightX + 80, detailY);
    this.doc.fillColor('#4B5563');

    detailY += 20;
    this.doc.font('Helvetica-Bold').fillColor('#374151').text('Total Days:', rightX, detailY);
    this.doc
      .font('Helvetica')
      .fillColor('#4B5563')
      .text(`${goal.plan.length} planned`, rightX + 80, detailY);

    this.currentY += boxHeight + 20;
  }

  private addStatistics(stats: ProgressStats): void {
    this.checkPageBreak(100);
    this.addSectionTitle('Progress Statistics');

    const statsData = [
      { label: 'Completed Days', value: stats.completedDays, color: '#10B981' },
      { label: 'Completion Rate', value: `${stats.completionRate}%`, color: '#3B82F6' },
      { label: 'Current Streak', value: stats.currentStreak, color: '#F97316' },
      { label: 'Total Days', value: stats.totalDays, color: '#6B7280' },
      { label: 'Hours Spent', value: `${stats.totalHoursSpent}h`, color: '#8B5CF6' },
      {
        label: 'Avg. Sentiment',
        value:
          stats.averageSentiment > 0
            ? `+${(stats.averageSentiment * 100).toFixed(0)}`
            : `${(stats.averageSentiment * 100).toFixed(0)}`,
        color: stats.averageSentiment > 0 ? '#22C55E' : '#EF4444',
      },
    ];

    const boxWidth = (this.pageWidth - 2 * this.margin - 20) / 3;
    const boxHeight = 50;
    let boxX = this.margin;
    let boxY = this.currentY;

    statsData.forEach((stat, index) => {
      if (index === 3) {
        boxX = this.margin;
        boxY += boxHeight + 10;
      }

      // Box
      this.doc.rect(boxX, boxY, boxWidth, boxHeight).fillAndStroke('#F9FAFB', '#E5E7EB');

      // Value
      this.doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor(stat.color)
        .text(String(stat.value), boxX, boxY + 15, {
          width: boxWidth,
          align: 'center',
        });

      // Label
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(stat.label, boxX, boxY + 38, {
          width: boxWidth,
          align: 'center',
        });

      boxX += boxWidth + 10;
    });

    this.currentY = boxY + boxHeight + 25;
  }

  private addProgressSummary(progress: any[], goal: any): void {
    this.checkPageBreak(150);
    this.addSectionTitle('Daily Progress Summary');

    // Table header
    const tableTop = this.currentY;
    this.doc
      .rect(this.margin, tableTop, this.pageWidth - 2 * this.margin, 25)
      .fill('#4F46E5');

    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('Day', this.margin + 5, tableTop + 8)
      .text('Status', this.margin + 40, tableTop + 8)
      .text('Hours', this.margin + 90, tableTop + 8)
      .text('Comment', this.margin + 140, tableTop + 8);

    this.currentY = tableTop + 25;

    // Table rows
    const completedProgress = progress.filter((p) => p.completed);
    const recentProgress = completedProgress.slice(-10); // Last 10 entries

    recentProgress.forEach((p, index) => {
      this.checkPageBreak(25);

      const rowY = this.currentY;

      // Alternate row colors
      if (index % 2 === 0) {
        this.doc
          .rect(this.margin, rowY, this.pageWidth - 2 * this.margin, 20)
          .fill('#F9FAFB');
      }

      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#374151')
        .text(`${p.day}`, this.margin + 5, rowY + 6)
        .fillColor('#10B981')
        .text('✓', this.margin + 40, rowY + 6)
        .fillColor('#374151')
        .text(p.hoursSpent ? `${p.hoursSpent}h` : '-', this.margin + 90, rowY + 6);

      if (p.comment) {
        const commentText = p.comment.length > 40 ? p.comment.substring(0, 37) + '...' : p.comment;
        this.doc.fontSize(8).text(commentText, this.margin + 140, rowY + 6, {
          width: this.pageWidth - this.margin - 150,
        });
      } else {
        this.doc.fillColor('#9CA3AF').text('No comment', this.margin + 140, rowY + 6);
      }

      this.currentY += 20;
    });

    this.currentY += 20;
  }

  private addInsights(insights: any[]): void {
    this.addSectionTitle('AI-Generated Insights');

    const latestInsight = insights[0];

    // Summary box
    const summaryHeight = 60;
    this.doc
      .rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, summaryHeight)
      .fillAndStroke('#EFF6FF', '#BFDBFE');

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#1E40AF')
      .text(latestInsight.summary, this.margin + 10, this.currentY + 10, {
        width: this.pageWidth - 2 * this.margin - 20,
      });

    this.currentY += summaryHeight + 15;

    // Highlights
    if (latestInsight.highlights && latestInsight.highlights.length > 0) {
      this.doc.fontSize(11).font('Helvetica-Bold').fillColor('#16A34A').text('✓ Highlights', this.margin, this.currentY);
      this.currentY += 15;

      this.doc.fontSize(9).font('Helvetica').fillColor('#4B5563');

      latestInsight.highlights.slice(0, 3).forEach((highlight: string) => {
        this.checkPageBreak(25);
        this.doc.text(`• ${highlight}`, this.margin + 10, this.currentY, {
          width: this.pageWidth - 2 * this.margin - 20,
        });
        this.currentY = this.doc.y + 5;
      });

      this.currentY += 10;
    }

    // Recommendations
    if (latestInsight.recommendations && latestInsight.recommendations.length > 0) {
      this.checkPageBreak(50);
      this.doc.fontSize(11).font('Helvetica-Bold').fillColor('#3B82F6').text('💡 Recommendations', this.margin, this.currentY);
      this.currentY += 15;

      this.doc.fontSize(9).font('Helvetica').fillColor('#4B5563');

      latestInsight.recommendations.slice(0, 3).forEach((rec: string) => {
        this.checkPageBreak(25);
        this.doc.text(`• ${rec}`, this.margin + 10, this.currentY, {
          width: this.pageWidth - 2 * this.margin - 20,
        });
        this.currentY = this.doc.y + 5;
      });

      this.currentY += 10;
    }

    // Blockers
    if (latestInsight.blockers && latestInsight.blockers.length > 0) {
      this.checkPageBreak(50);
      this.doc.fontSize(11).font('Helvetica-Bold').fillColor('#EF4444').text('⚠ Challenges', this.margin, this.currentY);
      this.currentY += 15;

      this.doc.fontSize(9).font('Helvetica').fillColor('#4B5563');

      latestInsight.blockers.slice(0, 3).forEach((blocker: string) => {
        this.checkPageBreak(25);
        this.doc.text(`• ${blocker}`, this.margin + 10, this.currentY, {
          width: this.pageWidth - 2 * this.margin - 20,
        });
        this.currentY = this.doc.y + 5;
      });
    }
  }

  private addSectionTitle(title: string): void {
    this.doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text(title, this.margin, this.currentY);
    this.currentY += 20;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addFooter(): void {
    const pages = this.doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);

      const footerY = this.pageHeight - 30;

      // Footer line
      this.doc
        .strokeColor('#E5E7EB')
        .moveTo(this.margin, footerY)
        .lineTo(this.pageWidth - this.margin, footerY)
        .stroke();

      // Footer text
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#9CA3AF')
        .text(
          'Generated by Aivora - Your AI-Powered Goal Achievement Partner',
          this.margin,
          footerY + 8,
          {
            width: this.pageWidth - 2 * this.margin,
            align: 'center',
          }
        );

      // Page number
      this.doc.text(`Page ${i + 1} of ${pages.count}`, this.pageWidth - this.margin - 50, footerY + 8, {
        width: 50,
        align: 'right',
      });
    }
  }

  getDocument(): PDFKit.PDFDocument {
    return this.doc;
  }
}

export async function generateGoalReportPDF(data: PDFReportData): Promise<PDFKit.PDFDocument> {
  const pdfService = new PDFService();
  return await pdfService.generateReport(data);
}
