'use client';

import { useState, useEffect } from 'react';
import { Modal, Button } from '@mantine/core';

type TutorialStep = {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  trigger: 'auto' | 'table-created' | 'table-selected' | 'column-added' | 'heatmap-enabled' | 'date-selected' | 'row-added' | 'export-ready';
};

const tutorialSteps: TutorialStep[] = [
  {
    target: 'welcome',
    title: 'Welcome to Calyra! 🎉',
    description: 'Plan it. Track it. Graph it. Let\'s get started by creating your first table!',
    position: 'center',
    trigger: 'auto',
  },
  {
    target: 'table-input',
    title: 'Create Your First Table',
    description: 'Give your table a meaningful name, then press Enter or click Add.',
    position: 'bottom',
    trigger: 'auto', // Shows immediately after welcome
  },
  {
    target: 'table-list',
    title: 'Great! Now Select Your Table',
    description: 'Click on your new table to select it.',
    position: 'right',
    trigger: 'table-created', // Wait for table to be created
  },
  {
    target: 'column-management',
    title: 'Add Columns to Track Data',
    description: 'Add custom columns for the metrics you want to track. For example: "Reps", "Duration", or "Score". Every table automatically has a "Date" column.',
    position: 'left',
    trigger: 'table-selected',
  },
  {
    target: 'column-chips',
    title: 'Enable Heatmap Visualization',
    description: 'On columns with numbers, you can click on the column chip to enable heatmap mode, which will visualize your data on the calendar.',
    position: 'left',
    trigger: 'column-added', 
  },
  {
    target: 'calendar',
    title: 'Select a Date to Add Data',
    description: 'Click on any date in the calendar to add data for that day. The calendar will highlight dates with existing data.',
    position: 'right',
    trigger: 'date-selected',
  },
  {
    target: 'row-entry',
    title: 'Enter Your Data',
    description: 'Fill in the values for each column. You can use numbers, fractions or text. Click "Add Row" when done.',
    position: 'left',
    trigger: 'date-selected',
  },
  {
    target: 'table-display',
    title: 'View Your Data',
    description: 'Excellent! All your entries are displayed in this table. You can see all your tracked data organized by date.',
    position: 'top',
    trigger: 'row-added',
  },
  {
    target: 'export-button',
    title: 'Export Your Progress',
    description: 'Click on data chips, then click export to download your tables as graphs.',
    position: 'center',
    trigger: 'auto', // Changed to center modal
  },
  {
    target: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Your data is automatically saved to your browser. Continue exploring the app - you can rename or delete tables using the settings icon next to each table. Happy tracking!',
    position: 'center',
    trigger: 'auto', // Manual advance from previous step
  },
];

type TutorialProps = {
  onComplete: () => void;
  currentTrigger: string;
};

export default function Tutorial({ onComplete, currentTrigger }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isCenterPosition = step.position === 'center';

  // Auto-show step 1 after welcome
  useEffect(() => {
    if (currentStep === 0 && !isCenterPosition) {
      // If we're on step 0 but it's not center position, it means we manually advanced from welcome
      // This shouldn't happen, but just in case
    }
  }, [currentStep, isCenterPosition]);

  // Auto-advance to the next appropriate step when trigger conditions are met
  useEffect(() => {
    if (!isVisible) return;

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < tutorialSteps.length) {
      const nextStep = tutorialSteps[nextStepIndex];
      
      // Advance if the current trigger matches the NEXT step's trigger (and it's not 'auto')
      if (nextStep.trigger === currentTrigger && nextStep.trigger !== 'auto') {
        setCurrentStep(nextStepIndex);
      }
    }
  }, [currentTrigger, currentStep, isVisible]);

  useEffect(() => {
    if (!isCenterPosition && step.target !== 'complete') {
      // Calculate tooltip position based on target element
      const element = document.querySelector(`[data-tutorial="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top - 200;
            left = rect.left + rect.width / 2 - 150;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - 150;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - 60;
            left = rect.left - 320;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - 60;
            left = rect.right + 20;
            break;
        }

        setTooltipPosition({ top, left });
        
        // Add highlight to target element
        element.setAttribute('data-tutorial-active', 'true');
      }
      
      // Cleanup previous highlights
      return () => {
        const allHighlighted = document.querySelectorAll('[data-tutorial-active]');
        allHighlighted.forEach(el => el.removeAttribute('data-tutorial-active'));
      };
    }
  }, [currentStep, step.target, step.position, isCenterPosition]);

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      onComplete();
    } else {
      const nextStepIndex = currentStep + 1;
      const nextStep = tutorialSteps[nextStepIndex];
      
      // Allow manual "Next" if:
      // 1. Both current and next steps have 'auto' trigger (sequential auto steps)
      // 2. Current step is from center position (modals)
      // 3. Current step is column-chips or table-display (special cases with Next button)
      if (step.trigger === 'auto' && nextStep.trigger === 'auto') {
        setCurrentStep(currentStep + 1);
      } else if (isCenterPosition) {
        setCurrentStep(currentStep + 1);
      } else if (step.target === 'column-chips' || step.target === 'table-display') {
        // Allow advancing from these steps
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  // Render center modal for welcome and completion steps
  if (isCenterPosition) {
    return (
      <>
        {/* Overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
          }}
        />

        {/* Center Modal */}
        <Modal
          opened={true}
          onClose={handleSkip}
          title={step.title}
          centered
          size="md"
          zIndex={9999}
        >
          <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
            {step.description}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center' }}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {currentStep > 0 && (
                <Button variant="subtle" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {/* Only show "Skip Tutorial" button on first step (welcome) */}
              {currentStep === 0 && !isLastStep && (
                <Button variant="subtle" onClick={handleSkip}>
                  Skip Tutorial
                </Button>
              )}
              <Button variant="filled" color="blue" onClick={handleNext}>
                {isLastStep ? 'Get Started' : currentStep === 0 ? "Let's Go!" : 'Next'}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Render positioned tooltip for other steps
  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 300,
          backgroundColor: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          padding: 20,
          zIndex: 9999,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: '#2684FF' }}>
          {step.title}
        </h3>
        <p style={{ margin: '0 0 20px 0', fontSize: 14, lineHeight: 1.6, color: '#333' }}>
          {step.description}
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            {currentStep + 1} / {tutorialSteps.length}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Show Next button ONLY for: column-chips, table-display */}
            {(step.target === 'column-chips' || step.target === 'table-display' || step.target === 'export-button') && (
              <Button size="xs" variant="filled" color="blue" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
