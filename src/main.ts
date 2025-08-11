import './style.css';
import './custom-elements.js';
import { downloadMarkdown, Answer, generateMarkdownReport } from './markdown.js';

class QuestionnaireApp {
  private formElement: HTMLFormElement;
  private resultElement: HTMLDivElement;

  constructor() {
    this.formElement = document.querySelector('#questionnaire-form')!;
    this.resultElement = document.querySelector('#result')!;

    this.initializeApp();
  }

  private initializeApp(): void {
    this.hideAllQuestions();
    this.showFirstQuestion();
    this.setupEventListeners();
  }

  private hideAllQuestions(): void {
    const questionCards = this.formElement.querySelectorAll('question-card');
    questionCards.forEach((card, index) => {
      if (index > 0) {
        (card as HTMLElement).style.display = 'none';
      }
    });
  }

  private showFirstQuestion(): void {
    const firstQuestion = this.formElement.querySelector('question-card');
    if (firstQuestion) {
      (firstQuestion as HTMLElement).style.display = 'block';
    }
  }

  private setupEventListeners(): void {
    // Handle radio button changes for all questions
    this.formElement.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'radio') {
        this.handleQuestionChange(target);
      }
    });

    // Handle form submission
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Handle reset button
    const resetBtn = document.querySelector('#reset-btn') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => {
      this.resetForm();
    });
  }

  private handleQuestionChange(radio: HTMLInputElement): void {
    const currentQuestionCard = radio.closest('question-card') as HTMLElement;
    const isExitOption = radio.dataset.exit === 'true';

    if (isExitOption) {
      // Hide all subsequent questions and show the generate button
      this.hideSubsequentQuestions(currentQuestionCard);
      this.showGenerateButton();
    } else {
      // Show the next question if it exists
      this.showNextQuestion(currentQuestionCard);
    }
  }

  private hideSubsequentQuestions(currentCard: HTMLElement): void {
    const allCards = Array.from(this.formElement.querySelectorAll('question-card'));
    const currentIndex = allCards.indexOf(currentCard);

    for (let i = currentIndex + 1; i < allCards.length; i++) {
      (allCards[i] as HTMLElement).style.display = 'none';
      // Clear selections in hidden questions
      const radios = allCards[i].querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        (radio as HTMLInputElement).checked = false;
      });
    }
  }

  private showNextQuestion(currentCard: HTMLElement): void {
    const allCards = Array.from(this.formElement.querySelectorAll('question-card'));
    const currentIndex = allCards.indexOf(currentCard);
    const nextCard = allCards[currentIndex + 1] as HTMLElement;

    if (nextCard) {
      nextCard.style.display = 'block';
    } else {
      // No more questions, show the generate button
      this.showGenerateButton();
    }
  }

  private showGenerateButton(): void {
    const formActions = this.formElement.querySelector('.form-actions') as HTMLElement;
    if (formActions) {
      formActions.style.display = 'block';
    }
  }

  private handleFormSubmit(): void {
    const answers: Answer[] = [];
    const questionCards = this.formElement.querySelectorAll('question-card');
    let earlyExit = false;

    questionCards.forEach(card => {
      const questionName = card.getAttribute('name');
      if (questionName) {
        const selectedRadio = this.formElement.querySelector(`input[name="${questionName}"]:checked`) as HTMLInputElement;
        if (selectedRadio) {
          answers.push({
            questionId: questionName,
            optionId: selectedRadio.value,
            optionText: selectedRadio.dataset.text || '',
            policyText: selectedRadio.dataset.policyText || '',
            section: card.getAttribute('section') || '',
            question: card.getAttribute('question') || ''
          });

          // Check if this is an exit option
          if (selectedRadio.dataset.exit === 'true') {
            const exitMessage = selectedRadio.dataset.policyText || 'No policy defined';
            this.showResult(answers, exitMessage);
            earlyExit = true;
            return;
          }
        }
      }
    });

    if (!earlyExit) {
      this.showResult(answers);
    }
  }

  private showResult(answers: Answer[], exitMessage?: string): void {
    const markdownContent = generateMarkdownReport(answers, exitMessage);

    // Hide form and show result
    this.formElement.style.display = 'none';
    this.resultElement.classList.remove('hidden');

    // Display markdown in preview
    const markdownPreview = this.resultElement.querySelector('#markdown-content') as HTMLPreElement;
    markdownPreview.textContent = markdownContent;

    // Setup result action buttons
    const downloadBtn = this.resultElement.querySelector('#download-btn') as HTMLButtonElement;
    const restartBtn = this.resultElement.querySelector('#restart-btn') as HTMLButtonElement;

    downloadBtn.onclick = () => {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadMarkdown(markdownContent, `project-assessment-${timestamp}.md`);
    };

    restartBtn.onclick = () => {
      this.resetForm();
      this.formElement.style.display = 'block';
      this.resultElement.classList.add('hidden');
    };
  }

  private resetForm(): void {
    this.formElement.reset();
    this.hideAllQuestions();
    this.showFirstQuestion();

    // Hide the generate button
    const formActions = this.formElement.querySelector('.form-actions') as HTMLElement;
    if (formActions) {
      formActions.style.display = 'none';
    }
  }
}

// Initialize the app
new QuestionnaireApp();
