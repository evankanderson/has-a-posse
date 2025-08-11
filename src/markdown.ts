export interface Answer {
  questionId: string;
  optionId: string;
  optionText: string;
  policyText: string;
  section: string;
  question: string;
}

export function generateMarkdownReport(answers: Answer[], exitMessage?: string): string {
  if (exitMessage) {
    return `# Compliance Information Statement

${exitMessage}
`;
  }

  let markdown = `# Introduction and Purpose

This project is committed to providing our consumers and adopters with capabilities that
are designed with security in mind. To achieve this, this project is committed to secure
development and effective vulnerability management. This policy outlines the secure
practices, secure development and vulnerability handling processes in use and serves as
the central file in the project’s repository to learn more about how this project
approaches its security.

`;

  // Group answers by section
  const sectionGroups = new Map<string, Answer[]>();
  answers.forEach(answer => {
    if (!sectionGroups.has(answer.section)) {
      sectionGroups.set(answer.section, []);
    }
    sectionGroups.get(answer.section)!.push(answer);
  });

  // Generate sections
  sectionGroups.forEach((sectionAnswers, sectionName) => {
    markdown += `# ${sectionName}`;

    sectionAnswers.forEach(answer => {
      markdown += "\n" + answer.policyText + "\n\n";
    });
  });

  return markdown;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
