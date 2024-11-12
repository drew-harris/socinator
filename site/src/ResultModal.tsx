import { useState } from "react";
import { trpc } from "./utils/trpc";

interface ResultModalProps {
  jobId: string;
}

interface ProgressiveResults {
  major?: { code: string; title: string };
  minor?: { code: string; title: string };
  broad?: { code: string; title: string };
  detailed?: { code: string; title: string };
}

export const ResultModal = (props: ResultModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [progressiveResults, setProgressiveResults] = useState<ProgressiveResults>({});
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
  const inferMutation = trpc.jobs.getInference.useMutation();
  const inputParams = trpc.jobs.getFullData.useQuery({ jobId: props.jobId });

  const openUp = () => {
    setIsOpen(true);
    setDetailsOpen(true);
    setProgressiveResults({});
  };

  const runInference = async () => {
    try {
      setProcessingStatus('processing');
      setProgressiveResults({});
      
      const result = await inferMutation.mutateAsync({ jobId: props.jobId });
      
      // Update major immediately
      if (result.majorSOCCode) {
        setProgressiveResults(prev => ({
          ...prev,
          major: {
            code: result.majorSOCCode,
            title: result.majorSOCTitle
          }
        }));
      }

      // Update minor after a short delay if different
      if (result.minorSOCCode && result.minorSOCCode !== result.majorSOCCode) {
        setTimeout(() => {
          setProgressiveResults(prev => ({
            ...prev,
            minor: {
              code: result.minorSOCCode!,
              title: result.minorSOCTitle || ''
            }
          }));
        }, 500);
      }

      // Update broad after delay if different
      if (result.broadSOCCode && result.broadSOCCode !== result.minorSOCCode) {
        setTimeout(() => {
          setProgressiveResults(prev => ({
            ...prev,
            broad: {
              code: result.broadSOCCode!,
              title: result.broadSOCTitle || ''
            }
          }));
        }, 1000);
      }

      // Update detailed after delay if different
      if (result.detailedSOCCode && result.detailedSOCCode !== result.broadSOCCode) {
        setTimeout(() => {
          setProgressiveResults(prev => ({
            ...prev,
            detailed: {
              code: result.detailedSOCCode!,
              title: result.detailedSOCTitle || ''
            }
          }));
        }, 1500);
      }

      // Mark as complete after all updates
      setTimeout(() => {
        setProcessingStatus('complete');
      }, 2000);

    } catch (error) {
      console.error("Inference error:", error);
      setProcessingStatus('error');
    }
  };

  const renderSOCSection = (result?: { code: string; title: string }, label: string) => {
    if (!result) return (
      <div className="animate-pulse">
        <p className="text-sm text-neutral-400">{label}</p>
        <div className="h-6 bg-neutral-700 rounded w-24 mb-1"></div>
        <div className="h-4 bg-neutral-700 rounded w-48"></div>
      </div>
    );

    return (
      <div className="transition-opacity duration-500 opacity-100">
        <p className="text-sm text-neutral-400">{label}</p>
        <p className="text-white">{result.code}</p>
        <p className="text-sm text-neutral-300">{result.title}</p>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <div>
          <button
            onClick={openUp}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            Run Inference
          </button>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Inference Result</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                onClick={runInference}
                disabled={inferMutation.status === "pending"}
              >
                {inferMutation.status === "pending" ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Run Inference on {props.jobId}
              </button>

              <details open={detailsOpen}>
                <summary>Job Data</summary>
                <pre>{JSON.stringify(inputParams.data, null, 4)}</pre>
              </details>

              <div className="mt-4">
                <div className="space-y-4">
                  {processingStatus === 'processing' && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <div className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full" />
                      <p>Running inference...</p>
                    </div>
                  )}

                  {processingStatus === 'error' && (
                    <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg">
                      <p className="text-red-500">
                        Error: {inferMutation.error?.message || "An unknown error occurred"}
                      </p>
                    </div>
                  )}

                  {(processingStatus === 'processing' || processingStatus === 'complete') && (
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">SOC Code Results</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          {renderSOCSection(progressiveResults.major, "Major SOC")}
                          {renderSOCSection(progressiveResults.minor, "Minor SOC")}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {renderSOCSection(progressiveResults.broad, "Broad SOC")}
                          {renderSOCSection(progressiveResults.detailed, "Detailed SOC")}
                        </div>
                      </div>
                    </div>
                  )}

                  {processingStatus === 'complete' && (
                    <div className="p-4 bg-green-950/50 border border-green-900 rounded-lg">
                      <p className="text-green-500">
                        Inference completed successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
