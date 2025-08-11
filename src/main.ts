import './style.css';
import { questions, Question, Answer } from './questions.js';
import { generateMarkdownReport, downloadMarkdown } from './markdown.js';

class QuestionnaireApp {
  private currentQuestionIndex = 0;
  private answers: Answer[] = [];
  private isComplete = false;
  private exitMessage?: string;

  private appElement: HTMLDivElement;
  private progressElement!: HTMLDivElement;
  private progressFillElement!: HTMLDivElement;
  private questionContainerElement!: HTMLDivElement;
  private navigationElement!: HTMLDivElement;
  private resultElement!: HTMLDivElement;

  constructor() {
    this.appElement = document.querySelector<HTMLDivElement>('#app')!;
    this.initializeApp();
  }

  private initializeApp(): void {
    this.appElement.innerHTML = `
      <div class="container">
        <h1>Project Support Assessment</h1>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
        <div class="question-container"></div>
        <div class="navigation">
          <button class="btn btn-secondary" id="back-btn">Back</button>
          <button class="btn btn-primary" id="next-btn" disabled>Next</button>
        </div>
        <div class="result hidden"></div>
      </div>
    `;

    this.progressElement = this.appElement.querySelector('.progress')!;
    this.progressFillElement = this.appElement.querySelector('.progress-fill')!;
    this.questionContainerElement = this.appElement.querySelector('.question-container')!;
    this.navigationElement = this.appElement.querySelector('.navigation')!;
    this.resultElement = this.appElement.querySelector('.result')!;

    this.setupEventListeners();
    this.showCurrentQuestion();
    this.updateProgress();
  }

  private setupEventListeners(): void {
    const backBtn = this.appElement.querySelector('#back-btn') as HTMLButtonElement;
    const nextBtn = this.appElement.querySelector('#next-btn') as HTMLButtonElement;

    backBtn.addEventListener('click', () => this.goBack());
    nextBtn.addEventListener('click', () => this.goNext());
  }

  private showCurrentQuestion(): void {
    if (this.currentQuestionIndex >= questions.length || this.isComplete) {
      this.showResult();
      return;
    }

    const question = questions[this.currentQuestionIndex];
    this.questionContainerElement.innerHTML = this.renderQuestion(question);

    // Add event listeners to radio buttons
    const radioButtons = this.questionContainerElement.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => this.updateNavigationState());
    });

    this.updateNavigationState();
  }

  private renderQuestion(question: Question): string {
    return `
      <div class="question">
        <h2>${question.text}</h2>
        <ul class="options">
          ${question.options.map(option => `
            <li class="option">
              <label>
                <input type="radio" name="question-${question.id}" value="${option.id}" />
                <span>${option.text}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  private updateNavigationState(): void {
    const backBtn = this.appElement.querySelector('#back-btn') as HTMLButtonElement;
    const nextBtn = this.appElement.querySelector('#next-btn') as HTMLButtonElement;

    backBtn.disabled = this.currentQuestionIndex === 0;

    const selectedOption = this.questionContainerElement.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    nextBtn.disabled = !selectedOption;
  }

  private updateProgress(): void {
    const totalQuestions = questions.length;
    const progress = this.isComplete ? 100 : (this.currentQuestionIndex / totalQuestions) * 100;
    this.progressFillElement.style.width = `${progress}%`;
  }

  private goBack(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.answers.pop(); // Remove the last answer
      this.isComplete = false;
      this.exitMessage = undefined;
      
      this.progressElement.classList.remove('hidden');
      this.navigationElement.classList.remove('hidden');
      this.resultElement.classList.add('hidden');
      
      this.showCurrentQuestion();
      this.updateProgress();
    }
  }

  private goNext(): void {
    const selectedOption = this.questionContainerElement.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    
    if (!selectedOption) return;

    const currentQuestion = questions[this.currentQuestionIndex];
    const selectedOptionData = currentQuestion.options.find(opt => opt.id === selectedOption.value)!;

    // Store the answer
    this.answers.push({
      questionId: currentQuestion.id,
      optionId: selectedOptionData.id,
      optionText: selectedOptionData.text
    });

    // Check if this option exits the workflow
    if (selectedOptionData.exitWorkflow) {
      this.isComplete = true;
      this.exitMessage = selectedOptionData.exitMessage;
      this.showResult();
      return;
    }

    // For question 1, only continue to security questions if option c or d was selected
    if (currentQuestion.id === 'commercial-support' && 
        !['designed', 'paid'].includes(selectedOptionData.id)) {
      this.isComplete = true;
      this.showResult();
      return;
    }

    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= questions.length) {
      this.isComplete = true;
      this.showResult();
    } else {
      this.showCurrentQuestion();
      this.updateProgress();
    }
  }

  private showResult(): void {
    this.isComplete = true;
    this.progressElement.classList.add('hidden');
    this.navigationElement.classList.add('hidden');
    this.questionContainerElement.innerHTML = '';
    
    const markdownContent = generateMarkdownReport(this.answers, this.exitMessage);
    
    this.resultElement.innerHTML = `
      <h2>Assessment Complete</h2>
      <p>Your assessment has been completed. You can download your results as a markdown file.</p>
      <div style="margin-top: 20px;">
        <button class="btn download-btn" id="download-btn">Download Results</button>
        <button class="btn restart-btn" id="restart-btn">Start Over</button>
      </div>
    `;
    
    this.resultElement.classList.remove('hidden');
    
    // Add event listeners for result buttons
    const downloadBtn = this.resultElement.querySelector('#download-btn') as HTMLButtonElement;
    const restartBtn = this.resultElement.querySelector('#restart-btn') as HTMLButtonElement;
    
    downloadBtn.addEventListener('click', () => {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadMarkdown(markdownContent, `project-assessment-${timestamp}.md`);
    });
    
    restartBtn.addEventListener('click', () => this.restart());
    
    this.updateProgress();
  }

  private restart(): void {
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.isComplete = false;
    this.exitMessage = undefined;
    
    this.progressElement.classList.remove('hidden');
    this.navigationElement.classList.remove('hidden');
    this.resultElement.classList.add('hidden');
    
    this.showCurrentQuestion();
    this.updateProgress();
  }
}

// Initialize the app
new QuestionnaireApp();
