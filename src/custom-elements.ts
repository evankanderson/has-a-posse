// Custom HTML elements for the questionnaire
class QuestionCard extends HTMLElement {
  connectedCallback() {
    this.classList.add('question-card');
    this.render();
  }

  private render() {
    const question = this.getAttribute('question') || '';
    const questionNumber = this.getAttribute('number') || '';
    
    // Store the option-box elements before clearing
    const optionBoxes = Array.from(this.children) as HTMLElement[];
    
    // Create the question structure
    this.innerHTML = `
      <h2>${questionNumber}${questionNumber ? '. ' : ''}${question}</h2>
      <div class="options"></div>
    `;
    
    // Re-append the option-box elements to the options container
    const optionsContainer = this.querySelector('.options')!;
    optionBoxes.forEach(optionBox => {
      optionsContainer.appendChild(optionBox);
    });
  }
}

class OptionBox extends HTMLElement {
  private radioName: string = '';
  
  connectedCallback() {
    this.classList.add('option-box');
    this.radioName = this.getRadioName();
    this.render();
    this.setupEventListeners();
  }

  private getRadioName(): string {
    // Get the name from the parent question-card or generate one
    const questionCard = this.closest('question-card') as QuestionCard;
    if (questionCard) {
      return questionCard.getAttribute('name') || this.generateNameFromQuestion(questionCard);
    }
    return 'unknown';
  }

  private generateNameFromQuestion(questionCard: QuestionCard): string {
    const question = questionCard.getAttribute('question') || '';
    // Generate a kebab-case name from the question
    return question.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30) || 'question';
  }

  private render() {
    const value = this.getAttribute('value') || '';
    const exit = this.getAttribute('exit') === 'true';
    
    // Get the main text content (excluding policy-text)
    const policyTextElement = this.querySelector('policy-text');
    const allText = this.textContent?.trim().replace(/^\s+/gm, '') || '';
    const policyText = policyTextElement?.textContent?.trim().replace(/^\s+/gm, '') || '';
    
    // Extract the main label by removing the policy text from the full text
    const label = allText.replace(policyText, '').trim();
    const dataText = label; // Use the label as the data-text value
    const exitMessage = exit ? policyText : '';
    
    // Store the policy-text element before clearing
    const storedPolicyTextElement = policyTextElement?.cloneNode(true);
    
    // Clear existing content and create the structure
    this.innerHTML = `
      <input type="radio" name="${this.radioName}" value="${value}" 
             data-text="${dataText}" 
             data-policy-text="${policyText}"
             ${exit ? 'data-exit="true"' : ''}
             ${exit && exitMessage ? `data-exit-message="${exitMessage}"` : ''} />
      <span>${label}</span>
    `;
    
    // Re-append the policy-text element to keep it in the DOM (but hidden)
    if (storedPolicyTextElement) {
      this.appendChild(storedPolicyTextElement);
    }
  }

  private setupEventListeners() {
    // Make the entire option clickable
    this.addEventListener('click', () => {
      const radio = this.querySelector('input[type="radio"]') as HTMLInputElement;
      if (radio) {
        radio.checked = true;
        // Trigger change event for form handling
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
}

class PolicyText extends HTMLElement {
  connectedCallback() {
    this.classList.add('policy-text');
    // Hide this element - it's just for data storage
    this.style.display = 'none';
  }
}

// Register the custom elements
customElements.define('question-card', QuestionCard);
customElements.define('option-box', OptionBox);
customElements.define('policy-text', PolicyText);

export { QuestionCard, OptionBox, PolicyText };
