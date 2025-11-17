import PDFDocument from "pdfkit";

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
    this.doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });
    this.pageWidth = this.doc.page.width;
    this.pageHeight = this.doc.page.height;
    this.margin = 50;
    this.currentY = this.margin + 60; // Start below header space
  }

  async generateReport(data: PDFReportData): Promise<PDFKit.PDFDocument> {
    // Add header to first page
    this.addPageHeader();

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

    // Add footers to all pages
    // this.addFootersToAllPages();

    // Finalize the PDF
    this.doc.end();

    return this.doc;
  }

  private addGoalOverview(goal: any): void {
    // Section title
    this.addSectionTitle("Goal Overview");

    // Goal title with decorative box
    const titleBoxHeight = 40;
    this.doc
      .roundedRect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        titleBoxHeight,
        8
      )
      .fillAndStroke("#F0F9FF", "#0EA5E9");

    this.doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#0C4A6E")
      .text(goal.title, this.margin + 15, this.currentY + 12, {
        width: this.pageWidth - 2 * this.margin - 30,
      });

    this.currentY += titleBoxHeight + 15;

    // Description
    if (goal.description) {
      this.doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#4B5563")
        .text(goal.description, this.margin, this.currentY, {
          width: this.pageWidth - 2 * this.margin,
        });
      this.currentY = this.doc.y + 10;
    }

    // Goal details with colorful cards
    this.currentY += 5;
    const cardWidth = (this.pageWidth - 2 * this.margin - 30) / 3;
    const cardHeight = 65;

    const cards = [
      {
        label: "Duration",
        value: `${goal.duration} days`,
        color: "#FEF3C7",
        border: "#F59E0B",
      },
      {
        label: "Hours/Day",
        value: `${goal.hoursPerDay} hours`,
        color: "#DBEAFE",
        border: "#3B82F6",
      },
      {
        label: "Start Date",
        value: new Date(goal.startDate).toLocaleDateString(),
        color: "#E0E7FF",
        border: "#6366F1",
      },
    ];

    let cardX = this.margin;
    cards.forEach((card) => {
      this.doc
        .roundedRect(cardX, this.currentY, cardWidth, cardHeight, 6)
        .fillAndStroke(card.color, card.border);

      this.doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1F2937")
        .text(card.value, cardX, this.currentY + 20, {
          width: cardWidth,
          align: "center",
        });

      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(card.label, cardX, this.currentY + 45, {
          width: cardWidth,
          align: "center",
        });

      cardX += cardWidth + 15;
    });

    this.currentY += cardHeight + 15;

    // Status badge
    const statusBadgeY = this.currentY;
    const statusColor = goal.status === "completed" ? "#10B981" : "#3B82F6";
    const statusBg = goal.status === "completed" ? "#D1FAE5" : "#DBEAFE";

    this.doc
      .roundedRect(this.margin, statusBadgeY, 180, 30, 15)
      .fillAndStroke(statusBg, statusColor);

    this.doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor(statusColor)
      .text(
        goal.status === "completed" ? "COMPLETED" : "IN PROGRESS",
        this.margin,
        statusBadgeY + 9,
        {
          width: 180,
          align: "center",
        }
      );

    this.currentY += 45;
  }

  private addStatistics(stats: ProgressStats): void {
    this.checkPageBreak(100);
    this.addSectionTitle("Progress Statistics");

    const statsData = [
      {
        label: "Completed Days",
        value: stats.completedDays,
        color: "#10B981",
        bg: "#D1FAE5",
      },
      {
        label: "Completion Rate",
        value: `${stats.completionRate}%`,
        color: "#3B82F6",
        bg: "#DBEAFE",
      },
      {
        label: "Current Streak",
        value: `${stats.currentStreak}`,
        color: "#F97316",
        bg: "#FFEDD5",
      },
      {
        label: "Total Days",
        value: stats.totalDays,
        color: "#6B7280",
        bg: "#F3F4F6",
      },
      {
        label: "Hours Spent",
        value: `${stats.totalHoursSpent}h`,
        color: "#8B5CF6",
        bg: "#EDE9FE",
      },
      {
        label: "Avg. Sentiment",
        value:
          stats.averageSentiment > 0
            ? `+${(stats.averageSentiment * 100).toFixed(0)}`
            : `${(stats.averageSentiment * 100).toFixed(0)}`,
        color: stats.averageSentiment > 0 ? "#22C55E" : "#EF4444",
        bg: stats.averageSentiment > 0 ? "#D1FAE5" : "#FEE2E2",
      },
    ];

    const boxWidth = (this.pageWidth - 2 * this.margin - 20) / 3;
    const boxHeight = 60;
    let boxX = this.margin;
    let boxY = this.currentY;

    statsData.forEach((stat, index) => {
      if (index === 3) {
        boxX = this.margin;
        boxY += boxHeight + 10;
      }

      // Box with rounded corners
      this.doc
        .roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
        .fillAndStroke(stat.bg, stat.color);

      // Value
      this.doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(stat.color)
        .text(String(stat.value), boxX, boxY + 15, {
          width: boxWidth,
          align: "center",
        });

      // Label
      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#374151")
        .text(stat.label, boxX, boxY + 42, {
          width: boxWidth,
          align: "center",
        });

      boxX += boxWidth + 10;
    });

    this.currentY = boxY + boxHeight + 25;
  }

  private addProgressSummary(progress: any[], goal: any): void {
    this.checkPageBreak(150);
    this.addSectionTitle("Daily Progress Summary");

    // Table header
    const tableTop = this.currentY;
    this.doc
      .roundedRect(
        this.margin,
        tableTop,
        this.pageWidth - 2 * this.margin,
        30,
        6
      )
      .fill("#4F46E5");

    this.doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Day", this.margin + 10, tableTop + 10)
      .text("Status", this.margin + 60, tableTop + 10)
      .text("Hours", this.margin + 120, tableTop + 10)
      .text("Comment", this.margin + 180, tableTop + 10);

    this.currentY = tableTop + 30;

    // Table rows
    const completedProgress = progress.filter((p) => p.completed);
    const recentProgress = completedProgress.slice(-10); // Last 10 entries

    recentProgress.forEach((p, index) => {
      this.checkPageBreak(30);

      const rowY = this.currentY;

      // Alternate row colors with rounded corners
      const rowBg = index % 2 === 0 ? "#F0F9FF" : "#FFFFFF";
      const rowBorder = index % 2 === 0 ? "#BFDBFE" : "#E5E7EB";

      this.doc
        .roundedRect(this.margin, rowY, this.pageWidth - 2 * this.margin, 25, 4)
        .fillAndStroke(rowBg, rowBorder);

      // Day number with badge
      this.doc
        .roundedRect(this.margin + 8, rowY + 6, 30, 14, 7)
        .fillAndStroke("#E0E7FF", "#6366F1");

      this.doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#4338CA")
        .text(`${p.day}`, this.margin + 8, rowY + 9, {
          width: 30,
          align: "center",
        });

      // Status checkmark
      this.doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#10B981")
        .text("Done", this.margin + 60, rowY + 9);

      // Hours with color coding
      const hoursText = p.hoursSpent ? `${p.hoursSpent}h` : "-";
      const hoursColor = p.hoursSpent ? "#374151" : "#9CA3AF";
      this.doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(hoursColor)
        .text(hoursText, this.margin + 125, rowY + 9);

      // Comment
      if (p.comment) {
        const commentText =
          p.comment.length > 35
            ? p.comment.substring(0, 32) + "..."
            : p.comment;
        this.doc
          .fontSize(8)
          .fillColor("#4B5563")
          .text(commentText, this.margin + 185, rowY + 9, {
            width: this.pageWidth - this.margin - 195,
          });
      } else {
        this.doc
          .fontSize(8)
          .fillColor("#9CA3AF")
          .font("Helvetica-Oblique")
          .text("No comment", this.margin + 185, rowY + 9);
        this.doc.font("Helvetica");
      }

      this.currentY += 28;
    });

    this.currentY += 15;
  }

  private addInsights(insights: any[]): void {
    this.addSectionTitle("AI-Generated Insights");

    const latestInsight = insights[0];

    // Summary box with header
    const summaryHeaderHeight = 35;
    this.doc
      .roundedRect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        summaryHeaderHeight,
        8
      )
      .fill("#6366F1");

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Key Summary", this.margin + 15, this.currentY + 10);

    this.currentY += summaryHeaderHeight;

    const summaryBodyHeight = 70;
    this.doc
      .rect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        summaryBodyHeight
      )
      .fillAndStroke("#EFF6FF", "#BFDBFE");

    this.doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#1E40AF")
      .text(latestInsight.summary, this.margin + 15, this.currentY + 12, {
        width: this.pageWidth - 2 * this.margin - 30,
      });

    this.currentY += summaryBodyHeight + 20;

    // Highlights
    if (latestInsight.highlights && latestInsight.highlights.length > 0) {
      // Highlights section with colored background
      this.doc
        .roundedRect(
          this.margin,
          this.currentY,
          this.pageWidth - 2 * this.margin,
          28,
          6
        )
        .fillAndStroke("#D1FAE5", "#10B981");

      this.doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#065F46")
        .text("Highlights", this.margin + 12, this.currentY + 8);

      this.currentY += 35;

      this.doc.fontSize(9).font("Helvetica").fillColor("#1F2937");

      latestInsight.highlights
        .slice(0, 3)
        .forEach((highlight: string, idx: number) => {
          this.checkPageBreak(30);

          // Bullet point with circle
          this.doc
            .circle(this.margin + 15, this.currentY + 5, 3)
            .fillAndStroke("#10B981", "#10B981");

          this.doc.text(highlight, this.margin + 25, this.currentY, {
            width: this.pageWidth - 2 * this.margin - 35,
          });
          this.currentY = this.doc.y + 8;
        });

      this.currentY += 10;
    }

    // Recommendations
    if (
      latestInsight.recommendations &&
      latestInsight.recommendations.length > 0
    ) {
      this.checkPageBreak(50);

      // Recommendations section with colored background
      this.doc
        .roundedRect(
          this.margin,
          this.currentY,
          this.pageWidth - 2 * this.margin,
          28,
          6
        )
        .fillAndStroke("#DBEAFE", "#3B82F6");

      this.doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#1E3A8A")
        .text("Recommendations", this.margin + 12, this.currentY + 8);

      this.currentY += 35;

      this.doc.fontSize(9).font("Helvetica").fillColor("#1F2937");

      latestInsight.recommendations.slice(0, 3).forEach((rec: string) => {
        this.checkPageBreak(30);

        // Bullet point with circle
        this.doc
          .circle(this.margin + 15, this.currentY + 5, 3)
          .fillAndStroke("#3B82F6", "#3B82F6");

        this.doc.text(rec, this.margin + 25, this.currentY, {
          width: this.pageWidth - 2 * this.margin - 35,
        });
        this.currentY = this.doc.y + 8;
      });

      this.currentY += 10;
    }

    // Blockers
    if (latestInsight.blockers && latestInsight.blockers.length > 0) {
      this.checkPageBreak(50);

      // Blockers section with colored background
      this.doc
        .roundedRect(
          this.margin,
          this.currentY,
          this.pageWidth - 2 * this.margin,
          28,
          6
        )
        .fillAndStroke("#FEE2E2", "#EF4444");

      this.doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#991B1B")
        .text("Challenges", this.margin + 12, this.currentY + 8);

      this.currentY += 35;

      this.doc.fontSize(9).font("Helvetica").fillColor("#1F2937");

      latestInsight.blockers.slice(0, 3).forEach((blocker: string) => {
        this.checkPageBreak(30);

        // Bullet point with circle
        this.doc
          .circle(this.margin + 15, this.currentY + 5, 3)
          .fillAndStroke("#EF4444", "#EF4444");

        this.doc.text(blocker, this.margin + 25, this.currentY, {
          width: this.pageWidth - 2 * this.margin - 35,
        });
        this.currentY = this.doc.y + 8;
      });
    }
  }

  private addSectionTitle(title: string): void {
    // Add a decorative line before section
    this.doc
      .strokeColor("#E0E7FF")
      .lineWidth(2)
      .moveTo(this.margin, this.currentY)
      .lineTo(this.margin + 50, this.currentY)
      .stroke();

    this.currentY += 8;

    this.doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#4338CA")
      .text(title, this.margin, this.currentY);

    this.currentY += 25;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 80) {
      this.doc.addPage();
      this.addPageHeader();
      this.currentY = this.margin + 60;
    }
  }

  private addPageHeader(): void {
    // Add header to current page
    this.doc.rect(0, 0, this.pageWidth, 50).fill("#4F46E5");

    this.doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Aivora", 50, 18);

    this.doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#C7D2FE")
      .text("Goal Achievement Report", 130, 22);

    this.doc
      .fontSize(8)
      .fillColor("#E0E7FF")
      .text(
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        this.pageWidth - 120,
        22,
        { width: 100, align: "right" }
      );
  }

  getDocument(): PDFKit.PDFDocument {
    return this.doc;
  }
}

export async function generateGoalReportPDF(
  data: PDFReportData
): Promise<PDFKit.PDFDocument> {
  const pdfService = new PDFService();
  return await pdfService.generateReport(data);
}
