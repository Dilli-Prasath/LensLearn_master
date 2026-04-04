/**
 * LensLearn - Export Service
 * Handles exporting explanations and study notes to text files
 */

class ExportService {
  /**
   * Format a date to a readable string
   */
  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Create a divider line for formatting
   */
  createDivider(length = 60) {
    return '='.repeat(length);
  }

  /**
   * Export a single explanation as a text file
   */
  exportAsText(explanation, metadata = {}) {
    const {
      subject = 'Study Notes',
      language = 'English',
      timestamp = new Date().toISOString(),
      imageHash = null
    } = metadata;

    let content = '';

    // Header
    content += this.createDivider() + '\n';
    content += 'LENSLEARN STUDY NOTES\n';
    content += this.createDivider() + '\n\n';

    // Metadata
    content += `Subject: ${subject}\n`;
    content += `Language: ${language}\n`;
    content += `Date: ${this.formatDate(timestamp)}\n`;
    if (imageHash) {
      content += `Reference ID: ${imageHash}\n`;
    }
    content += '\n' + this.createDivider() + '\n\n';

    // Content
    content += 'EXPLANATION:\n';
    content += this.createDivider() + '\n\n';
    content += explanation;
    content += '\n\n' + this.createDivider() + '\n';
    content += `Exported on ${this.formatDate(new Date().toISOString())}\n`;
    content += this.createDivider() + '\n';

    // Create blob and trigger download
    this.downloadFile(content, `${subject}_notes_${Date.now()}.txt`);
  }

  /**
   * Export all sessions as a combined text file
   */
  exportAllNotes(sessions = []) {
    if (!sessions || sessions.length === 0) {
      alert('No sessions to export');
      return;
    }

    let content = '';

    // Header
    content += this.createDivider(70) + '\n';
    content += 'LENSLEARN - COMPLETE STUDY NOTES\n';
    content += this.createDivider(70) + '\n\n';

    // Summary
    content += `Total Sessions: ${sessions.length}\n`;
    content += `Export Date: ${this.formatDate(new Date().toISOString())}\n`;
    content += '\n' + this.createDivider(70) + '\n\n';

    // Sessions list
    sessions.forEach((session, index) => {
      content += `SESSION ${index + 1} of ${sessions.length}\n`;
      content += this.createDivider() + '\n\n';

      // Metadata
      content += `Subject: ${session.subject || 'General'}\n`;
      content += `Language: ${session.language || 'English'}\n`;
      content += `Date: ${this.formatDate(session.timestamp)}\n`;
      if (session.id) {
        content += `Session ID: ${session.id}\n`;
      }
      content += '\n';

      // Explanation
      content += 'EXPLANATION:\n';
      content += '─'.repeat(60) + '\n';
      content += session.explanation || '';
      content += '\n\n';

      // Quiz results if available
      if (session.quiz && session.quiz.questions) {
        content += 'QUIZ RESULTS:\n';
        content += '─'.repeat(60) + '\n';
        const correct = session.quiz.questions.filter(
          q => q.userAnswer === q.correct
        ).length;
        const total = session.quiz.questions.length;
        const percentage = Math.round((correct / total) * 100);
        content += `Score: ${correct}/${total} (${percentage}%)\n\n`;

        session.quiz.questions.forEach((question, qIndex) => {
          content += `Q${qIndex + 1}: ${question.question}\n`;
          content += `Your answer: ${question.userAnswer}\n`;
          content += `Correct answer: ${question.correct}\n`;
          content += `Status: ${question.userAnswer === question.correct ? 'CORRECT' : 'INCORRECT'}\n\n`;
        });
      }

      // Separator between sessions
      if (index < sessions.length - 1) {
        content += '\n' + this.createDivider(70) + '\n\n';
      }
    });

    // Footer
    content += '\n' + this.createDivider(70) + '\n';
    content += `End of Export - Generated on ${this.formatDate(new Date().toISOString())}\n`;
    content += this.createDivider(70) + '\n';

    // Create blob and trigger download
    const filename = `LensLearn_StudyNotes_${new Date().toISOString().split('T')[0]}.txt`;
    this.downloadFile(content, filename);
  }

  /**
   * Helper method to create and download a file
   */
  downloadFile(content, filename) {
    try {
      // Create a blob from the content
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      // Create an object URL
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export notes:', error);
      alert('Failed to export notes. Please try again.');
    }
  }
}

const exportService = new ExportService();
export default exportService;
