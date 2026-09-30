interface WizardStepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export default function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center overflow-x-auto pb-2 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={
                  isDone
                    ? "h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold"
                    : isActive
                    ? "h-8 w-8 rounded-full border-2 border-green-600 text-green-600 flex items-center justify-center text-sm font-semibold"
                    : "h-8 w-8 rounded-full border-2 border-gray-200 text-gray-400 flex items-center justify-center text-sm font-semibold"
                }
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className={
                  isActive
                    ? "text-xs font-medium text-green-700 whitespace-nowrap"
                    : "text-xs text-gray-400 whitespace-nowrap"
                }
              >
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <div className={isDone ? "h-0.5 w-10 bg-green-600 mx-2" : "h-0.5 w-10 bg-gray-200 mx-2"} />
            )}
          </div>
        );
      })}
    </div>
  );
}