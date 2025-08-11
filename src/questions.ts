export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  exitWorkflow?: boolean;
  exitMessage?: string;
}

export interface Answer {
  questionId: string;
  optionId: string;
  optionText: string;
}

export const questions: Question[] = [
  {
    id: 'commercial-support',
    text: 'Do you have or support commercial users of your project?',
    options: [
      {
        id: 'no',
        text: 'No',
        exitWorkflow: true,
        exitMessage: 'I owe you nothing'
      },
      {
        id: 'implicit',
        text: 'We implicitly support commercial use, but do not actively think about it'
      },
      {
        id: 'designed',
        text: 'Our project has been designed to enable commercial use, but the maintainers are not paid'
      },
      {
        id: 'paid',
        text: 'We offer paid support'
      }
    ]
  },
  {
    id: 'security-practices',
    text: 'Do you follow any security practices in your development workflow?',
    options: [
      {
        id: 'no-formal',
        text: 'We do not have a formal development workflow'
      },
      {
        id: 'some-practices',
        text: 'We follow some of the secure software development lifecycle best practices, but not all'
      },
      {
        id: 'documented',
        text: 'We document security practices for contributors in CONTRIBUTING.md'
      }
    ]
  },
  {
    id: 'vulnerability-management',
    text: 'How does your project manage reported vulnerabilities?',
    options: [
      {
        id: 'no-process',
        text: 'We do not have a written vulnerability management process'
      },
      {
        id: 'documented-process',
        text: 'Our vulnerability reporting process is documented in SECURITY.md'
      },
      {
        id: 'full-process',
        text: 'Our vulnerability reporting process is documented in SECURITY.md, and we have documentation for responding to vulnerabilities including timelines for remediation'
      }
    ]
  },
  {
    id: 'security-design',
    text: 'Does your project perform any sort of explicit security design, including threat modelling or testing?',
    options: [
      {
        id: 'no-formal',
        text: 'We do not have a formal threat model or security documentation.'
      },
      {
        id: 'documented-model',
        text: 'We have a documented threat model, and we reference it during design activities'
      },
      {
        id: 'active-testing',
        text: 'We have a documented threat model which is used to guide active testing.'
      }
    ]
  }
];
